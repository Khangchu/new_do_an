/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from 'next/dist/server/api-utils'
import {
  CollectionBeforeValidateHook,
  CollectionBeforeChangeHook,
  APIError,
  CollectionAfterReadHook,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const rondomID: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.orderId) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.orderId = `DH${numberOnly.substring(0, 10)}`
  }
}
export const checkTime: CollectionBeforeValidateHook = ({ data, originalDoc, operation }) => {
  if (!data) return
  const error: string[] = []
  const today = new Date()
  const threeDaysAgo = new Date()
  const oneNextDay = new Date()
  const inputDateMake = new Date(data.dateMake)
  const inputOriginalDateMake = new Date(originalDoc.dateMake)
  const inputDateShip = new Date(data.dateShip)
  const inputOriginalDateShip = new Date(originalDoc.dateShip)
  threeDaysAgo.setDate(today.getDate() - 3)
  oneNextDay.setDate(inputDateMake.getDate() + 1)
  const formatDate = (date: any) => {
    return new Date(date).toISOString().split('T')[0]
  }
  if (operation === 'create') {
    if (formatDate(inputDateMake) > formatDate(today)) {
      error.push('Ngày lập không được ở tương lai.')
    }
    if (formatDate(inputDateMake) < formatDate(threeDaysAgo)) {
      error.push('Chỉ có thể tạo phiếu trong vòng 3 ngày trước.')
    }
    if (formatDate(inputDateShip) < formatDate(today)) {
      error.push('Không thể chọn ngày ơ quá khứ')
    }
    if (error.length > 0) {
      throw new APIError(`${error.join('; ')}`, 400)
    }
  }
  if (operation === 'update') {
    if (formatDate(inputOriginalDateMake) !== formatDate(inputDateMake)) {
      error.push('Không thể sửa ngày nhập.')
    }
    if (error.length > 0) {
      throw new APIError(`${error.join('; ')}`, 400)
    }
  }
}
export const priceProduct: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
  operation,
}) => {
  if (!data) return
  const findBestPrice = (tieredPricing: any[], quantity: number) => {
    let bestPrice = null
    tieredPricing.forEach((tier) => {
      if (quantity >= (tier.minQuantity ?? 0)) {
        bestPrice = tier.discountedPrice
      }
    })
    return bestPrice
  }
  if (operation === 'create') {
    for (const item of data.products) {
      const findPrice = await req.payload.find({
        collection: 'productprices',
        where: {
          product: item.productId,
        },
      })
      findPrice.docs.forEach((item1) => {
        item1.price?.forEach((item2) => {
          if (item2.unti === item.unti) {
            const bestPrice = findBestPrice(item2.tieredPricing || [], item.quantity)
            if (bestPrice !== null) {
              item.price = bestPrice
            } else {
              item.price = item2.priceProduct
            }
            item.currency = item2.currency
          }
        })
      })
    }
  }
  if (operation === 'update') {
    for (const item of data.products) {
      const originalDocs = originalDoc.products.find((od: any) => od?.id === item?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findPrice = await req.payload.find({
          collection: 'productprices',
          where: {
            product: item.productId,
          },
        })
        findPrice.docs.forEach((item1) => {
          item1.price?.forEach((item2) => {
            if (item2.unti === item.unti) {
              const bestPrice = findBestPrice(item2.tieredPricing || [], item.quantity)
              if (bestPrice !== null) {
                item.price = bestPrice
              } else {
                item.price = item2.priceProduct
              }
              item.currency = item2.currency
            }
          })
        })
      }
    }
  }
}
export const updateReport: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data.products) return data
  const reportData: {
    [key: string]: { productId: string; report: { unti: string; quantity: number }[] }
  } = {}

  data.products.forEach((item: any) => {
    if (!item.productId || !item.quantity || !item.unti) return
    if (!reportData[item.productId]) {
      reportData[item.productId] = {
        productId: item.productId,
        report: [],
      }
    }
    const existingUnit = reportData[item.productId].report.find((r) => r.unti === item.unti)

    if (existingUnit) {
      existingUnit.quantity += item.quantity
    } else {
      reportData[item.productId].report.push({
        unti: item.unti,
        quantity: item.quantity,
      })
    }
  })
  data.productsReport = Object.values(reportData)

  return data
}
export const totalValueProduce: CollectionAfterReadHook = async ({ doc }) => {
  if (!doc?.products) return doc
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
  doc.products.forEach((pc: any) => {
    if (pc.price && pc.quantity) {
      const total = convertToNumber(pc.price) * pc.quantity
      pc.totalPrice = formatNumber(total)
    }
  })
  const totalValuesVnd = doc.products
    .filter((pc: any) => pc.currency === 'VND')
    .flatMap((dc: any) => dc.totalPrice)

  const totalValuesUsd = doc.products
    .filter((pc: any) => pc.currency === 'USD')
    .flatMap((dc: any) => dc.totalPrice)
  if (doc.currency === 'VND') {
    const totalValue = [
      ...totalValuesVnd.map((value: any) => convertToNumber(value)),
      ...totalValuesUsd.map((value: any) => convertToNumber(value) * 25000),
    ].reduce((sum: number, value: number) => sum + value, 0)
    doc.totalPrice = formatNumber(totalValue)
  }
  if (doc.currency === 'USD') {
    const totalValue = [
      ...totalValuesVnd.map((value: any) => convertToNumber(value) / 25000),
      ...totalValuesUsd.map((value: any) => convertToNumber(value)),
    ].reduce((sum: number, value: number) => sum + value, 0)
    doc.totalPrice = formatNumber(totalValue)
  }

  return doc
}
export const checkValueSanPham: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
  originalDoc,
}) => {
  if (!data) return
  const errorSet = new Set<string>()
  const error = new Set<string>()
  const priceMap = new Map()
  const nameProduceMap = new Map()
  if (operation === 'create') {
    for (const item of data.products) {
      const findPrice = await req.payload.find({
        collection: 'productprices',
        where: {
          product: item.productId,
        },
      })

      findPrice.docs.forEach((item1) => {
        const ProduceId =
          typeof item1.product === 'object' && item1.product !== null
            ? item1.product.id
            : item1.product
        const ProduceName =
          typeof item1.product === 'object' && item1.product !== null
            ? item1.product.nameProduct
            : item1.product
        item1.price?.forEach((dt) => {
          priceMap.set(`${ProduceId}-${dt.unti}`, ProduceId)
          nameProduceMap.set(`${ProduceId}`, ProduceName)
        })
      })
      const key = `${item.productId}-${item.unti}`
      const keyName = `${item.productId}`
      const dt = priceMap.get(key)
      const name = nameProduceMap.get(keyName)
      if (!dt) {
        if (item.unti === 'cai') {
          errorSet.add(`Sản phẩm ${name} với đơn vị la cái chưa có giá`)
        } else if (item.unti === 'bo') {
          errorSet.add(`Sản phẩm ${name} với đơn vị la bộ chưa có giá`)
        } else if (item.unti === 'doi') {
          errorSet.add(`Sản phẩm ${name} với đơn vị la đôi chưa có giá`)
        }
      }
    }
    if (errorSet.size > 0) {
      throw new APIError(Array.from(errorSet).join(','), 400)
    }
  }
  if (operation === 'update') {
    for (const item of data.products) {
      const originalDocs = originalDoc.products.find((od: any) => od?.id === item?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findPrice = await req.payload.find({
          collection: 'productprices',
          where: {
            product: item.productId,
          },
        })

        findPrice.docs.forEach((item1) => {
          const ProduceId =
            typeof item1.product === 'object' && item1.product !== null
              ? item1.product.id
              : item1.product
          const ProduceName =
            typeof item1.product === 'object' && item1.product !== null
              ? item1.product.nameProduct
              : item1.product
          item1.price?.forEach((dt) => {
            priceMap.set(`${ProduceId}-${dt.unti}`, ProduceId)
            nameProduceMap.set(`${ProduceId}`, ProduceName)
          })
        })
        const key = `${item.productId}-${item.unti}`
        const keyName = `${item.productId}`
        const dt = priceMap.get(key)
        const name = nameProduceMap.get(keyName)
        if (!dt) {
          if (item.unti === 'cai') {
            errorSet.add(`Sản phẩm ${name} với đơn vị la cái chưa có giá`)
          } else if (item.unti === 'bo') {
            errorSet.add(`Sản phẩm ${name} với đơn vị la bộ chưa có giá`)
          } else if (item.unti === 'doi') {
            errorSet.add(`Sản phẩm ${name} với đơn vị la đôi chưa có giá`)
          }
        }
      } else {
        if (
          item.productId !== originalDocs.productId ||
          item.quantity !== originalDocs.quantity ||
          item.unti !== originalDocs.unti
        ) {
          error.add('Không được chỉnh sửa phiểu đã tạo')
        }
      }
    }

    if (errorSet.size > 0) {
      throw new APIError(Array.from(errorSet).join(','), 400)
    }
    if (error.size > 0) {
      throw new APIError(Array.from(error).join(','), 400)
    }
  }
}
export const checkInfo: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    voucherMaker: 'Người lập phiếu',
    dateMake: 'Ngày lập',
    customerName: 'Tên khách hàng',
    adderssShip: 'Địa chỉ giao hàng',
    dateShip: 'Ngày giao hàng dự kiến',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(',')}`, 400)
  }
  if (data.products.length === 0) {
    throw new APIError('Không được để trống sản phẩm')
  }
}
