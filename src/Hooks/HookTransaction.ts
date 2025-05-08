/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeValidateHook,
  CollectionBeforeChangeHook,
  CollectionAfterReadHook,
  APIError,
  CollectionAfterChangeHook,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const showTitle: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (data.info.transactionId) {
    data.title = data.info.transactionId
  }
  if (data.transactionAmount.totalAmount) {
    data.totalAmountTitle = data.transactionAmount.totalAmount
  }
  if (data.info.typeTransaction) {
    data.typeTransactionTitle = data.info.typeTransaction
  }
  if (data.transactionAmount.currency) {
    data.currencyTitle = data.transactionAmount.currency
  }
}
export const romdomId: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.info.transactionId) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.info.transactionId = `GD${numberOnly.substring(0, 10)}`
  }
}
export const showPrice: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return
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

  const exchangeRate = 25000
  let totalPriceVnd = 0
  let totalPriceUsd = 0
  if (data.info.order) {
    const orderId = data.info.order
    console.log('orderId', orderId)
    for (const item of orderId) {
      const findOrder = await req.payload.findByID({
        collection: 'orders',
        id: item,
      })

      if (findOrder.currency === 'VND') {
        totalPriceVnd += convertToNumber(findOrder.totalPrice)
      } else {
        totalPriceUsd += convertToNumber(findOrder.totalPrice)
      }
    }
    if (data.transactionAmount.currency === 'VND') {
      const totalPrice = totalPriceUsd * exchangeRate + totalPriceVnd
      data.transactionAmount.subtotal = formatNumber(totalPrice)
    }
    if (data.transactionAmount.currency === 'USD') {
      const totalPrice = totalPriceUsd + totalPriceVnd / exchangeRate
      data.transactionAmount.subtotal = formatNumber(totalPrice)
    }
  }
  return data
}
export const totalPrice: CollectionAfterReadHook = ({ doc }) => {
  const convertToDecimal = (value: number): number => {
    return value / 100
  }
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
  const subtotal = convertToNumber(doc.transactionAmount.subtotal)
  let discount = convertToNumber(doc.transactionAmount.discountValue)
  let shipping = convertToNumber(doc.transactionAmount.shippingValue)
  let offer = convertToNumber(doc.transactionAmount.offerValue)
  if (doc.transactionAmount.discountType === 'percentage') {
    discount = subtotal * convertToDecimal(discount)
  }
  if (doc.transactionAmount.shippingType === 'percentage') {
    shipping = subtotal * convertToDecimal(shipping)
  }
  if (doc.transactionAmount.offerType === 'percentage') {
    offer = subtotal * convertToDecimal(offer)
  }
  const totalAmount = subtotal - discount + shipping - offer
  doc.transactionAmount.totalAmount = formatNumber(totalAmount)
}
export const formatPrice: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
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
  if (data.transactionAmount.discountType === 'fixed') {
    if (data.transactionAmount.discountValue) {
      data.transactionAmount.discountValue = formatNumber(data.transactionAmount.discountValue)
    }
  }
  if (data.transactionAmount.shippingType === 'fixed') {
    if (data.transactionAmount.shippingValue) {
      data.transactionAmount.shippingValue = formatNumber(data.transactionAmount.shippingValue)
    }
  }
  if (data.transactionAmount.offerType === 'fixed') {
    if (data.transactionAmount.offerValue) {
      data.transactionAmount.offerValue = formatNumber(data.transactionAmount.offerValue)
    }
  }
}
export const changePrice: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (!data || !data.transactionAmount) return
  const exchangeRate = 25000
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
  const convertToNumber = (str: any) => {
    if (str == null || str === '') return 0
    const numberValue = parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '.'))
    return isNaN(numberValue) ? 0 : numberValue
  }
  if (operation === 'update') {
    if (data.transactionAmount.discountType === 'fixed') {
      if (data.transactionAmount.discountValue) {
        if (
          data.transactionAmount.currency === 'USD' &&
          originalDoc.transactionAmount.currency === 'VND'
        ) {
          const value = convertToNumber(data.transactionAmount.discountValue) / exchangeRate
          data.transactionAmount.discountValue = formatNumber(value)
        }
        if (
          data.transactionAmount.currency === 'VND' &&
          originalDoc.transactionAmount.currency === 'USD'
        ) {
          const value = convertToNumber(data.transactionAmount.discountValue) * exchangeRate
          data.transactionAmount.discountValue = formatNumber(value)
        }
      }
    }
    if (data.transactionAmount.shippingType === 'fixed') {
      if (data.transactionAmount.discountValue) {
        if (
          data.transactionAmount.currency === 'USD' &&
          originalDoc.transactionAmount.currency === 'VND'
        ) {
          const value = convertToNumber(data.transactionAmount.shippingValue) / exchangeRate
          data.transactionAmount.shippingValue = formatNumber(value)
        }
        if (
          data.transactionAmount.currency === 'VND' &&
          originalDoc.transactionAmount.currency === 'USD'
        ) {
          const value = convertToNumber(data.transactionAmount.shippingValue) * exchangeRate
          data.transactionAmount.shippingValue = formatNumber(value)
        }
      }
    }
    if (data.transactionAmount.offerType === 'fixed') {
      if (data.transactionAmount.discountValue) {
        if (
          data.transactionAmount.currency === 'USD' &&
          originalDoc.transactionAmount.currency === 'VND'
        ) {
          const value = convertToNumber(data.transactionAmount.offerValue) / exchangeRate
          data.transactionAmount.offerValue = formatNumber(value)
        }
        if (
          data.transactionAmount.currency === 'VND' &&
          originalDoc.transactionAmount.currency === 'USD'
        ) {
          const value = convertToNumber(data.transactionAmount.offerValue) * exchangeRate
          data.transactionAmount.offerValue = formatNumber(value)
        }
      }
    }
  }
}
export const checkTime: CollectionBeforeValidateHook = ({ data, operation, originalDoc }) => {
  if (!data) return

  const error: string[] = []
  const today = new Date()
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(today.getDate() - 3)
  const formatDate = (date: any) => {
    if (!date) return null
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split('T')[0]
  }
  const inputDate = formatDate(data?.info?.dateMake) ?? '' // Nếu null thì gán ''
  const inputOriginalDate = formatDate(originalDoc?.info?.dateMake) ?? ''
  const inputTransactionDate = formatDate(data?.payment?.transactionDate) ?? ''
  const inputOriginalTransactionDate = formatDate(originalDoc?.payment?.transactionDate) ?? ''
  if (operation === 'create') {
    const formattedToday = formatDate(today)
    if (
      inputTransactionDate !== null &&
      formattedToday !== null &&
      inputTransactionDate < formattedToday
    ) {
      error.push('Ngày giao dịch không được ở quá khứ.')
    }
    if (inputDate !== null && formattedToday !== null && inputDate > formattedToday) {
      error.push('Ngày nhập không được ở tương lai.')
    }
    const formattedThreeDaysAgo = formatDate(threeDaysAgo)
    if (inputDate && formattedThreeDaysAgo && inputDate < formattedThreeDaysAgo) {
      error.push('Chỉ có thể tạo phiếu trong vòng 3 ngày trước.')
    }
  }
  if (operation === 'update') {
    if (inputOriginalDate && inputDate && inputOriginalDate === inputDate) {
      const oneNextDay = new Date(inputDate)
      oneNextDay.setDate(oneNextDay.getDate() + 1)
      if (today > oneNextDay) {
        error.push('Chỉ có thể sửa phiếu trong ngày hoặc ngày hôm sau.')
      }
    } else {
      error.push('Không thể sửa ngày nhập.')
    }
    if (
      inputOriginalTransactionDate &&
      inputTransactionDate &&
      inputOriginalTransactionDate !== inputTransactionDate
    ) {
      error.push('Không thể sửa ngày giao dịch.')
    }
  }
  if (error.length > 0) {
    throw new APIError(`${error.join('; ')}`, 400)
  }
}
export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    'info.dateMake': 'Ngày nhập',
    'transactionAmount.discountValue': 'Giá trị chiết khấu',
    'transactionAmount.shippingValue': 'Giá trị phí vận chuyển',
    'transactionAmount.offerValue': 'Giá trị ưu đãi',
    'payment.transactionDate': 'Ngày Giao Dịch',
    'info.order': 'Đơn Hàng Liên Quan',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => {
      const value = key.split('.').reduce((obj, keyPart) => obj?.[keyPart], data)
      return value === undefined || value === null || (Array.isArray(value) && value.length === 0)
    })
    .map(([, label]) => label)
  if (!data.info.customer && data.info.typeTransaction === 'customer') {
    error.push('Khách hàng')
  }
  if (!data.info.suppliers && data.info.typeTransaction === 'company') {
    error.push('Nhà cung cấp')
  }
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
  if (data?.payment?.paymentMethod === 'e_wallet') {
    const ewalletInfo = data?.payment?.eWalletInfo || {}

    if (!ewalletInfo.walletName || !ewalletInfo.walletId || !ewalletInfo.transactionReference) {
      throw new APIError('Vui lòng nhập đầy đủ thông tin thanh toán ví điện tử!', 400)
    }
  }
  if (data?.payment?.paymentMethod === 'bank_transfer') {
    const bankInfo = data?.payment?.bankInfo || {}

    if (
      !bankInfo.bankName ||
      !bankInfo.accountNumber ||
      !bankInfo.accountHolder ||
      !bankInfo.transactionReference
    ) {
      throw new APIError('Vui lòng nhập đầy đủ thông tin chuyển khoản!', 400)
    }
  }
}
export const changeStatus: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.payment?.paymentMethod === 'e_wallet') {
    if (data?.payment?.eWalletInfo?.transactionReference) {
      data.payment.status = 'success' // Có mã giao dịch, tự động thành công
    } else {
      data.payment.status = 'pending' // Chưa có mã, vẫn đang xử lý
    }
  }
  if (data?.payment?.paymentMethod === 'bank_transfer') {
    if (data?.payment?.bankInfo?.transactionReference) {
      data.payment.status = 'success' // Nếu có mã giao dịch, tự động thành công
    } else {
      data.payment.status = 'pending' // Nếu chưa có, vẫn đang xử lý
    }
  }
}
export const updateOrder: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!doc.info.order) return
  const find = await req.payload.find({
    collection: 'transactions',
    where: {
      'info.transactionId': { equals: doc.info.transactionId },
    },
  })
  const idTransaction = find.docs[0].id
  for (const orderId of doc.info.order) {
    await req.payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        transactions: idTransaction,
      },
    })
  }
}
export const autoVoucherMaker: CollectionBeforeChangeHook = ({ data, req }) => {
  const user = req.user
  if (!data.info.voucherMaker) {
    data.info.voucherMaker = user?.id
  }
  return data
}
export const canUpdateCreateDelete: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'business') return true
  return false
}
