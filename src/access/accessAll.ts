import { Access } from 'payload'
export const accessAdmin: Access = ({ req }) => req.user?.role === 'admin'
export const accessProduction: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.employee?.typeDepartment === 'production') {
    if ((user.employee.regionalManagement?.docs ?? []).length > 0 || user.employee.department) {
      return true
    } else {
      return false
    }
  }
  return false
}
export const accessBusiness: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.employee?.typeDepartment === 'business') {
    if ((user.employee.regionalManagement?.docs ?? []).length > 0 || user.employee.department) {
      return true
    } else {
      return false
    }
  }
  return false
}
export const accessWarehouse: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.employee?.typeDepartment === 'warehouse') {
    if ((user.employee.regionalManagement?.docs ?? []).length > 0 || user.employee.department) {
      return true
    } else {
      return false
    }
  }
  return false
}
export const accessProductDevelopment: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.employee?.typeDepartment === 'productDevelopment') {
    if ((user.employee.regionalManagement?.docs ?? []).length > 0 || user.employee.department) {
      return true
    } else {
      return false
    }
  }
  return false
}
