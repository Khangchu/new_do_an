import { APIError, CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

export const rondomID: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.productID) {
    data.productID = `ID-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }
  return data
}
export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const error: string[] = []
  if (!data.nameProduct) {
    error.push('Tên sản phẩm')
  }
  if (!data.category) {
    error.push('Danh mục')
  }
  if (!data.sizes) {
    error.push('Kích cỡ')
  }
  if (!data.color) {
    error.push('Màu sắc')
  }
  if (!data.material) {
    error.push('Vật liệu')
  }
  if (!data.price) {
    error.push('Giá tiền')
  }
  const throwError = error.map((err) => err).join(',')
  if (error.length > 0) {
    throw new APIError(`Không được để trống:${throwError}`, 400)
  }
}
