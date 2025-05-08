/* eslint-disable @typescript-eslint/no-explicit-any */
import { Access, APIError, CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const beforeValidate: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.materialsID) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.materialsID = `VL${numberOnly.substring(0, 10)}`
    return data
  }
}
export const beforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    materialsName: 'Tên Vật Liệu',
    materialstype: 'Loại vật liệu',
    Origin: 'Xuất xứ',
    cost: 'Giá',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
}
export const changeUniti: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data) return
  if (operation === 'update') {
    const exchangeSpecific = 1000
    const exchangeTemperature = 273
    if (Array.isArray(data.specificvolume)) {
      data.specificvolume = data.specificvolume.map((item, index) => {
        const originalItem = originalDoc?.specificvolume?.[index]
        if (originalItem?.Unitspecific && originalItem.Unitspecific !== item.Unitspecific) {
          if (originalItem.Unitspecific === 'g/cm³' && item.Unitspecific === 'kg/m³') {
            item.Massspecific = item.Massspecific / exchangeSpecific
          } else if (originalItem.Unitspecific == 'kg/m³' && item.Unitspecific == 'g/cm³') {
            item.Massspecific = item.Massspecific * exchangeSpecific
          }
        }
        return item
      })
    }
    if (Array.isArray(data.temperaturetolerance)) {
      data.temperaturetolerance = data.temperaturetolerance.map((item, index) => {
        const originalItem = originalDoc?.temperaturetolerance?.[index]
        if (
          originalItem?.Unittemperaturetolerance &&
          originalItem?.Unittemperaturetolerance !== item.Unittemperaturetolerance
        ) {
          if (
            originalItem?.Unittemperaturetolerance === '°C' &&
            item?.Unittemperaturetolerance === 'K'
          ) {
            item.Masstemperaturetolerance = item.Masstemperaturetolerance + exchangeTemperature
          } else if (
            originalItem?.Unittemperaturetolerance === 'K' &&
            item?.Unittemperaturetolerance === '°C'
          ) {
            item.Masstemperaturetolerance = item.Masstemperaturetolerance - exchangeTemperature
          }
        }
        return item
      })
    }
    data.previousCurrency = data.currency
    return data
  }
}
export const checkValueEmty: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const find = new Map<string, number>()
  const duplicates: string[] = []

  data.Dimension.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.Length || !stat.Width || !stat.Thickness) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `Kích thước ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  data.specificvolume.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.Massspecific || !stat.Unitspecific) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `Khối lượng riêng ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  data.tensilestrength.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.Masstensile || !stat.Unittensile) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `'Độ bền kéo ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  data.temperaturetolerance.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.Masstemperaturetolerance || !stat.Unittemperaturetolerance) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `Nhiệt độ chịu đựng ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  data.compressivestrength.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.Masscompressive || !stat.Unitcompressive) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `Độ bền nén ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  data.qualitystandards.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.nameCertificate || !stat.img) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `Tiêu chuẩn chất lượng ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })

  data.safetycertification.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0
    if (!stat.nameCertificate || !stat.img) {
      count++
    }
    find.set(key, count)
    if (count > 0) {
      const message = `Chứng nhận an toàn ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  if (!data.color) {
    duplicates.push('Màu sắc thiếu thông tin')
  }
  if (duplicates.length > 0) {
    throw new APIError(`Lỗi đặc tính kỹ thuật: ${duplicates.join(', ')}`, 400)
  }
}
export const canReadMaterial: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (
    user.employee?.typeDepartment === 'business' ||
    user.employee?.typeDepartment === 'productDevelopment' ||
    user.employee?.typeDepartment === 'warehouse'
  )
    return true
  return false
}
export const canUpdateCreateDeleteMaterial: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'productDevelopment') return true
  return false
}
