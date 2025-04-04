import {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionBeforeReadHook,
} from 'payload'
import { APIError } from 'payload'
export const CheckValueUsers: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create') {
    const error: string[] = []
    const { ID, phone } = data
    const checkID = await req.payload.find({
      collection: 'users',
      where: { ID: { equals: ID } },
    })
    if (checkID.docs.length > 0) {
      error.push('Căn cước công dân bị trùng, vui lòng nhập lại.')
    }
    const checkPhone = await req.payload.find({
      collection: 'users',
      where: { phone: { equals: phone } },
    })
    if (checkPhone.docs.length > 0) {
      error.push('Số điện thoại bị trùng, vui lòng nhập lại.')
    }
    if (error.length > 0) {
      throw new APIError(error.map((err, index) => `${index + 1}. ${err}`).join('\n'), 400)
    }
    if (!ID) {
      error.push('khong duoc de trong ID')
    }
    console.log('check:', ID)
  }
  const error: string[] = []
  if (!data.fullName) {
    error.push('Họ và tên')
  }
  if (!data.sex) {
    error.push('Giới tính')
  }
  if (!data.ID) {
    error.push('Căn cước công dân')
  }
  if (!data.Date_of_birth) {
    error.push('Ngày sinh')
  }
  if (!data.address) {
    error.push('Địa chỉ')
  }
  if (!data.phone) {
    error.push('Số điện thoại')
  }
  if (!data.hocvan.degree) {
    error.push('Bằng Cấp')
  }
  if (!data.hocvan.university) {
    error.push('Đại học')
  }
  if (!data.hocvan.specialization) {
    error.push('Chuyên ngành')
  }
  if (!data.email) {
    error.push('email')
  }
  const throwError = error.map((err) => err).join(',')
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${throwError}`, 400)
  }
  const birthDate = new Date(data.Date_of_birth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const dayDiff = today.getDate() - birthDate.getDate()
  if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
    throw new APIError('Bạn phải đủ 18 tuổi', 400)
  }
}
export const BeforeValidateUser: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  const error: string[] = []
  if (!data.email) {
    error.push('email')
  }
  const throwError = error.map((err) => err).join(',')
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${throwError}`, 400)
  }
  if (!data.userID) {
    data.userID = `ID-${Date.now()}${Math.floor(Math.random() * 10000)}`
  }
  data.title = `${data.userID}-${data.fullName || 'Unknown'}`
}
