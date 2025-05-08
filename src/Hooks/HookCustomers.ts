import { CollectionBeforeValidateHook, APIError, Access } from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const randomId: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data.idCustomers) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.idCustomers = `KH${numberOnly.substring(0, 10)}`
  }
  return data
}
export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    nameCustomers: 'khách hàng/doanh nghiệp',
    nameContactPerson: 'Tên người liên hệ',
    role: 'chức vụ',
    phone: 'số điện thoại',
    email: 'Email',
    address: 'Địa chỉ',
    typeCustomers: 'Loại khách hàng',
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
export const canReadCustomer: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'business') return true
  return false
}
export const canUpdateCreateDeleteCustomer: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'business') return true
  return false
}
