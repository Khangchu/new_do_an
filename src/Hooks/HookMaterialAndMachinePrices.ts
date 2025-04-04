/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
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
