/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeValidateHook,
  CollectionBeforeChangeHook,
  CollectionAfterReadHook,
  APIError,
} from 'payload'

export const showTitle: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data) return
  const findProduct = await req.payload.findByID({
    collection: 'products',
    id: data.product,
  })
  if (findProduct) {
    data.title = findProduct.nameProduct
  }
}

export const formatPrice: CollectionBeforeChangeHook = ({ data }) => {
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
  for (const dc of data.price) {
    if (dc.priceProduct) {
      dc.priceProduct = formatNumber(dc.priceProduct)
    }
    for (const pc of dc.tieredPricing) {
      if (pc.discountedPrice) {
        console.log('run')
        pc.discountedPrice = formatNumber(pc.discountedPrice)
      }
    }
  }
}

export const changeTypePrice: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
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
    for (const item of data.price) {
      for (const olditem of originalDoc.price) {
        if (item.id === olditem.id) {
          if (item.currency !== olditem.currency) {
            if (olditem.currency === 'VND' && item.currency === 'USD') {
              const price = convertToNumber(item.priceProduct) / EXCHANGE_RATE
              item.priceProduct = formatNumber(price)
            }
            if (olditem.currency === 'USD' && item.currency === 'VND') {
              const price = convertToNumber(item.priceProduct) * EXCHANGE_RATE
              item.priceProduct = formatNumber(price)
            }
            for (const item1 of item.tieredPricing) {
              for (const olditem1 of olditem.tieredPricing) {
                if (olditem1.id === item1.id) {
                  if (item.currency !== olditem.currency) {
                    if (olditem.currency === 'VND' && item.currency === 'USD') {
                      const price = convertToNumber(item1.discountedPrice) / EXCHANGE_RATE
                      item1.discountedPrice = formatNumber(price)
                    }
                    if (olditem.currency === 'USD' && item.currency === 'VND') {
                      const price = convertToNumber(item1.discountedPrice) * EXCHANGE_RATE
                      item1.discountedPrice = formatNumber(price)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export const percent: CollectionAfterReadHook = ({ doc }) => {
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
  const convertPercentToDecimal = (percent: any) => {
    if (!percent) return 0
    const numericValue = parseFloat(percent.replace('%', ''))
    return isNaN(numericValue) ? 0 : numericValue / 100
  }
  const convertToNumber = (str: any) => {
    if (str == null || str === '') return 0
    const numberValue = parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '.'))
    return isNaN(numberValue) ? 0 : numberValue
  }
  for (const item of doc.price) {
    for (const item1 of item.tieredPricing) {
      if (item1.percent && item.priceProduct) {
        const discountedPrice =
          convertToNumber(item.priceProduct) -
          convertPercentToDecimal(item1.percent) * convertToNumber(item.priceProduct)
        item1.discountedPrice = formatNumber(discountedPrice)
      }
    }
  }
}

export const requiredunti: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const map = new Map()
  data.price.forEach((dc: any) => {
    const key = `${dc.unti}`
    const count = map.get(key) || 0
    map.set(key, count + 1)
  })
  const findUntiCai = map.get('cai')
  const findUntiBo = map.get('bo')
  const findUntiDoi = map.get('doi')
  if (findUntiCai > 1) {
    throw new APIError('Sản Phẩm đã có đơn vị là cái', 400)
  }
  if (findUntiBo > 1) {
    throw new APIError('Sản Phẩm đã có đơn vị là Bộ', 400)
  }
  if (findUntiDoi > 1) {
    throw new APIError('Sản Phẩm đã có đơn vị là Đôi', 400)
  }
}

export const trackPriceHistory: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data || !originalDoc) return
  if (operation === 'update') {
    data.priceHistory = [...(originalDoc.priceHistory || [])]
    const priceHistoryEntry: {
      changedAt: string
      type: { unti: any; oldPrice: any; newPrice: any; oldCurrency: any; newCurrency: any }[]
    } = {
      changedAt: new Date().toISOString(),
      type: [],
    }
    data.price.forEach((newPriceEntry: any) => {
      const matchingOldPrice = originalDoc.price.find(
        (oldPriceEntry: any) => oldPriceEntry.unti === newPriceEntry.unti,
      )

      if (matchingOldPrice) {
        if (matchingOldPrice.priceProduct === newPriceEntry.priceProduct) {
          return
        }
        priceHistoryEntry.type.push({
          unti: newPriceEntry.unti,
          oldPrice: matchingOldPrice.priceProduct,
          oldCurrency: matchingOldPrice.currency,
          newPrice: newPriceEntry.priceProduct,
          newCurrency: newPriceEntry.currency || 'VND',
        })
      }
    })
    if (priceHistoryEntry.type.length > 0) {
      data.priceHistory.push(priceHistoryEntry)
    }
  }
}

export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    product: 'Tên Sản phẩm',
    price: 'Giá tiền',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(',')}`, 400)
  }
}
