import { APIError, CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

export const beforeValidate: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.materialsID) {
    data.materialsID = `ID-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }
  return data
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
    const exchangeRate = 25000
    const exchangeSpecific = 1000
    const exchangeTemperature = 273

    if (originalDoc?.currency && originalDoc.currency !== data.currency) {
      if (originalDoc.currency === 'VND' && data.currency === 'USD') {
        data.cost = data.cost / exchangeRate
      } else if (originalDoc.currency === 'USD' && data.currency === 'VND') {
        data.cost = data.cost * exchangeRate
      }
    }
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
      console.log('check1: run')
      data.temperaturetolerance = data.temperaturetolerance.map((item, index) => {
        const originalItem = originalDoc?.temperaturetolerance?.[index]
        if (
          originalItem?.Unittemperaturetolerance &&
          originalItem?.Unittemperaturetolerance !== item.Unittemperaturetolerance
        ) {
          console.log('check2:run')
          if (
            originalItem?.Unittemperaturetolerance === '°C' &&
            item?.Unittemperaturetolerance === 'K'
          ) {
            console.log('check3:run')
            item.Masstemperaturetolerance = item.Masstemperaturetolerance + exchangeTemperature
          } else if (
            originalItem?.Unittemperaturetolerance === 'K' &&
            item?.Unittemperaturetolerance === '°C'
          ) {
            console.log('check4:run')
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
