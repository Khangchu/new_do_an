import { CollectionBeforeValidateHook, APIError, Access } from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const randomId: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data.idSuppliers) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.idSuppliers = `NCC${numberOnly.substring(0, 10)}`
  }
  return data
}
export const noEmtyValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    webside: 'webside',
    email: 'email',
    fax: 'Số Fax',
    sdt: 'Số Điện Thoại',
    address: 'Địa Chỉ',
    ad: 'Tên Tiếng Anh',
    name: 'Tên Công Ty',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => {
      const value = key.split('.').reduce((obj, keyPart) => obj?.[keyPart], data)
      return value === undefined || value === null || (Array.isArray(value) && value.length === 0)
    })
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
}
export const canReadSupplier: Access = ({ req }) => {
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
export const canUpdateCreateDeleteSupplier: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'productDevelopment') return true
  return false
}
