/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
  Access,
} from 'payload'
import { APIError } from 'payload'

export const showTitle: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return
  if (data.chose === 'material') {
    const showMaterial = await req.payload.findByID({
      collection: 'materials',
      id: data.materialName,
    })
    data.title = showMaterial.materialsName
  } else {
    const showMachine = await req.payload.findByID({
      collection: 'machine',
      id: data.machineName,
    })
    data.title = showMachine.nameMachine
  }
}
export const notChange: CollectionBeforeValidateHook = ({ data, operation, originalDoc }) => {
  if (!data || !originalDoc) throw new APIError('Dữ liệu không hợp lệ', 400)

  const error = new Set<string>()

  if (operation === 'update') {
    if (originalDoc.chose !== data.chose) {
      error.add('Không thể thay đổi lựa chọn này')
      if (data.machineName) {
        error.add('Không thể thay đổi lựa chọn này')
      }
    }
  }

  if (error.size > 0) {
    throw new APIError(Array.from(error).join(','), 400)
  }
}
export const formatPrice: CollectionAfterReadHook = ({ doc }) => {
  const formatNumber = (value: any) => {
    if (value == null || value === '') return '0'
    if (typeof value === 'number') {
      return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }).format(value)
    }
    const normalizedValue = value.toString().replace(/\./g, '').replace(/,/g, '.')
    const numberValue = parseFloat(normalizedValue)

    if (isNaN(numberValue)) return '0'

    // Format theo chuẩn Việt Nam
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    }).format(numberValue)
  }
  if (doc.price && Array.isArray(doc.price)) {
    doc.price.forEach((item: any) => {
      if (item.price) {
        item.price = formatNumber(item.price)
      }
    })
  }
}
export const changeTypePrice: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data) return
  if (operation === 'update') {
    const EXCHANGE_RATE = 25000
    const convertToNumber = (str: any) => {
      if (str == null || str === '') return 0
      const numberValue = parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '.'))
      return isNaN(numberValue) ? 0 : numberValue
    }
    const formatNumber = (value: any) => {
      if (value == null || value === '') return '0'
      if (typeof value === 'number') {
        return new Intl.NumberFormat('vi-VN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 10,
        }).format(value)
      }
      const normalizedValue = value.toString().replace(/\./g, '').replace(/,/g, '.')
      const numberValue = parseFloat(normalizedValue)
      if (isNaN(numberValue)) return '0'
      return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }).format(numberValue)
    }
    data.price.forEach((dc: any) => {
      originalDoc.price.forEach((pc: any) => {
        if (pc.id === dc.id) {
          if (dc.typePrice !== pc.typePrice) {
            if (dc.typePrice === 'VND' && pc.typePrice === 'USD') {
              const price = convertToNumber(dc.price) * EXCHANGE_RATE
              dc.price = formatNumber(price)
            }
            if (dc.typePrice === 'USD' && pc.typePrice === 'VND') {
              const price = convertToNumber(dc.price) / EXCHANGE_RATE
              dc.price = formatNumber(price)
            }
          }
        }
      })
    })
  }
}
export const noEmtyPrice: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const error: string[] = []
  const errorCount = new Map<string, number>()
  if (data.price.length > 0) {
    data.price.forEach((dt: any, index: number) => {
      const key = dt.it
      let count = errorCount.get(key) || 0
      if (data.chose === 'material') {
        if (!dt.supplier || !dt.unitMaterial || !dt.price || !dt.typePrice || !dt.dateUpdate) {
          count++
        }
      }
      if (data.chose === 'machine') {
        if (!dt.supplier || !dt.unitMachine || !dt.price || !dt.typePrice || !dt.dateUpdate) {
          count++
        }
      }
      errorCount.set(key, count)
      if (count > 0) {
        const message = `Giá ${index + 1} thiếu thông tin`
        if (!error.includes(message)) {
          error.push(message)
        }
      }
    })
    if (error.length > 0) {
      throw new APIError(`Lỗi giá: ${error.join(', ')}`, 400)
    }
  }
}
export const trackPriceHistory: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data || !originalDoc) return
  if (operation === 'update') {
    data.priceHistory = [...(originalDoc.priceHistory || [])]
    const priceHistoryEntry: {
      changedAt: string
      type: {
        unitMaterial: any
        supplier: any
        unitMachine: any
        oldPrice: any
        newPrice: any
        oldCurrency: any
        newCurrency: any
      }[]
    } = {
      changedAt: new Date().toISOString(),
      type: [],
    }
    data.price.forEach((newPriceEntry: any) => {
      if (data.chose === 'material') {
        const matchingOldPrice =
          originalDoc.price.find(
            (oldPriceEntry: any) =>
              oldPriceEntry.supplier === newPriceEntry.supplier &&
              oldPriceEntry.unitMaterial === newPriceEntry.unitMaterial,
          ) || []
        if (matchingOldPrice) {
          if (matchingOldPrice.price === newPriceEntry.price) {
            return
          }
        }
        priceHistoryEntry.type.push({
          supplier: newPriceEntry.supplier,
          unitMaterial: newPriceEntry.unitMaterial,
          unitMachine: null,
          oldPrice: matchingOldPrice.price,
          oldCurrency: matchingOldPrice.typePrice,
          newPrice: newPriceEntry.price,
          newCurrency: newPriceEntry.typePrice,
        })
        if (priceHistoryEntry.type.length > 0) {
          data.priceHistory.push(priceHistoryEntry)
        }
      }
      if (data.chose === 'machine') {
        const matchingOldPrice =
          originalDoc.price.find(
            (oldPriceEntry: any) =>
              oldPriceEntry.supplier === newPriceEntry.supplier &&
              oldPriceEntry.unitMachine === newPriceEntry.unitMachine,
          ) || []
        if (matchingOldPrice) {
          if (matchingOldPrice.price === newPriceEntry.price) {
            return
          }
        }
        priceHistoryEntry.type.push({
          supplier: newPriceEntry.supplier,
          unitMaterial: null,
          unitMachine: newPriceEntry.unitMachine,
          oldPrice: matchingOldPrice.price,
          oldCurrency: matchingOldPrice.typePrice,
          newPrice: newPriceEntry.price,
          newCurrency: newPriceEntry.typePrice,
        })
        if (priceHistoryEntry.type.length > 0) {
          data.priceHistory.push(priceHistoryEntry)
        }
      }
    })
  }
}
export const noEmtyInfo: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const error: string[] = []
  if (data.chose === 'material') {
    if (!data.materialName) {
      error.push('Tên nguyên vật liệu')
    }
  }
  if (data.chose === 'machine') {
    if (!data.machineName) {
      error.push('Tên máy móc')
    }
  }
  if (data.price.length > 0) {
    error.push('Giá')
  }
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
}
export const canRead: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'business') return true
  return false
}
export const canUpdateCreateDelete: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'business' && user.employee?.position !== 'employees')
    return true
  return false
}
