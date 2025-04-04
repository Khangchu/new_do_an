/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeChangeHook,
  CollectionAfterReadHook,
  CollectionBeforeValidateHook,
  APIError,
} from 'payload'

export const showPrice: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return
  if (operation === 'create') {
    for (const item of data.catalogueOfGoods) {
      const findPrice = await req.payload.find({
        collection: 'productprices',
        where: {
          product: item.productId,
        },
      })
      findPrice.docs.forEach((item1) => {
        item1.price?.forEach((item2) => {
          if (item2.unti === item.danhmuc.unti) {
            item.importPrice = item2.priceProduct
            item.unitPrice = item2.currency
          }
        })
      })
    }
  }
  if (operation === 'update') {
    for (const item of data.catalogueOfGoods) {
      const originalDocs =
        originalDoc.catalogueOfGoods.find((od: any) => od?.id === item?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findPrice = await req.payload.find({
          collection: 'productprices',
          where: {
            product: item.productId,
          },
        })
        findPrice.docs.forEach((item1) => {
          item1.price?.forEach((item2) => {
            if (item2.unti === item.danhmuc.unti) {
              item.importPrice = item2.priceProduct
              item.unitPrice = item2.currency
            }
          })
        })
      }
    }
  }
}
export const totalPrice: CollectionAfterReadHook = ({ doc }) => {
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
  if (doc.catalogueOfGoods.length !== 0) {
    for (const item of doc.catalogueOfGoods) {
      if (item.danhmuc.amount && item.importPrice) {
        const totalValue = convertToNumber(item.importPrice) * item.danhmuc.amount
        item.totalPrice = formatNumber(totalValue)
      }
    }
  }
}
export const checkValueProduct: CollectionBeforeValidateHook = async ({ req, data }) => {
  if (!data) return
  const productMap = new Map()
  for (const item of data.catalogueOfGoods) {
    const key = item.productId
    const findProduce = await req.payload.findByID({
      collection: 'products',
      id: item.productId,
    })
    if (!productMap.has(key)) {
      productMap.set(key, new Set())
    }

    const unitSet = productMap.get(key) as Set<string>
    if (unitSet.has(item.danhmuc?.unti)) {
      if (item.danhmuc?.unti === 'cai') {
        throw new APIError(
          `Sản phẩm ${findProduce.nameProduct} đã có đơn vị cái, không thể tạo thêm.`,
          400,
        )
      }
      if (item.danhmuc?.unti === 'bo') {
        throw new APIError(
          `Sản phẩm ${findProduce.nameProduct} đã có đơn vị bộ, không thể tạo thêm.`,
          400,
        )
      }
      if (item.danhmuc?.unti === 'doi') {
        throw new APIError(
          `Sản phẩm ${findProduce.nameProduct} đã có đơn vị đôi, không thể tạo thêm.`,
          400,
        )
      }
    }
    unitSet.add(item.danhmuc?.unti)
  }
}
export const showReport: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data) return
  const reportData: {
    [key: string]: { productId: string; report: { unti: string; amount: number }[] }
  } = {}
  data.catalogueOfGoods.forEach((dt: any) => {
    if (!dt.productId || !dt.danhmuc.amount || !dt.danhmuc.unti) return
    if (!reportData[dt.productId]) {
      reportData[dt.productId] = {
        productId: dt.productId,
        report: [],
      }
    }
    const existingUnit = reportData[dt.productId].report.find((r) => r.unti === dt.danhmuc.unti)
    if (existingUnit) {
      existingUnit.amount += dt.danhmuc.amount
    }
    reportData[dt.productId].report.push({
      unti: dt.danhmuc.unti,
      amount: dt.danhmuc.amount,
    })
  })
  data.reportProduct = Object.values(reportData)
}
export const totalPriceReport: CollectionAfterReadHook = ({ doc }) => {
  const exchangeRate = 25000
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
  if (doc.catalogueOfGoods.length !== 0) {
    const totalValueVnd = doc.catalogueOfGoods
      .filter((dt: any) => dt.unitPrice === 'VND')
      .flatMap((pc: any) => pc.totalPrice)
    const totalValueUsd = doc.catalogueOfGoods
      .filter((dt: any) => dt.unitPrice === 'USD')
      .flatMap((pc: any) => pc.totalPrice)
    if (doc.unitPrice === 'VND') {
      const total = [
        ...totalValueUsd.map((value: any) => convertToNumber(value) * exchangeRate),
        ...totalValueVnd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      doc.totalPrice = formatNumber(total)
    }
    if (doc.unitPrice === 'USD') {
      const total = [
        ...totalValueUsd.map((value: any) => convertToNumber(value)),
        ...totalValueVnd.map((value: any) => convertToNumber(value) / exchangeRate),
      ].reduce((sum: number, value: number) => sum + value, 0)
      doc.totalPrice = formatNumber(total)
    }
  }
}
export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    inventoryName: 'Tên Kho Hàng',
    address: 'Địa chỉ',
    phone: 'Số Điện Thoại',
    employee: 'Người quản lý',
    area: 'Diên tích kho',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
  if (data.catalogueOfGoods.length === 0) {
    throw new APIError('Không được để trống phần sản phẩm', 400)
  }
}
