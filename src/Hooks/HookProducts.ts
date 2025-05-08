import { headers } from 'next/headers'
import { Access, APIError, CollectionBeforeValidateHook } from 'payload'
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
export const canReadProducts: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
  const referer = (await headers()).get('referer')
  const isFromMedicalRecodsAdmin = referer?.includes('/admin/collections/factories') || false
  if (isFromMedicalRecodsAdmin) {
    return true
  }
  if (user.role === 'admin') return true
  if (
    user.employee?.typeDepartment === 'business' ||
    user.employee?.typeDepartment === 'productDevelopment' ||
    user.employee?.typeDepartment === 'warehouse'
  )
    return true
  return false
}
export const canUpdateCreateDeleteProducts: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'productDevelopment') return true
  return false
}
