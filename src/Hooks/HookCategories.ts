import { Access, APIError, CollectionBeforeChangeHook } from 'payload'
import slugify from 'slugify'

export const BeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  const error: string[] = []

  if (!data.title) {
    error.push('Tên danh mục')
  }
  if (!data.image) {
    error.push('Hình ảnh danh mục')
  }
  const throwError = error.map((err) => err).join(',')
  if (error.length > 0) {
    throw new APIError(`Không được để trống:${throwError}`, 400)
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ensureUniqueSlug = async ({ data, req, operation }: any) => {
  if (data.title) {
    data.slug = slugify(data.title, { lower: true, strict: true })
  }

  if (operation === 'create') {
    const existing = await req.payload.find({
      collection: 'categories',
      where: { slug: { equals: data.slug } },
    })
    if (existing.docs.length > 0) {
      throw new APIError('Slug đã tồn tại, vui lòng chọn slug khác.', 400)
    }
  }

  return data
}
export const subEnsureUniqueSlug: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (data.title) {
    data.slug = slugify(data.title, { lower: true, strict: true })
  }
  if (operation === 'create') {
    const existing = await req.payload.find({
      collection: 'subCategories',
      where: { slug: { equals: data.slug } },
    })
    if (existing.docs.length > 0) {
      throw new APIError('Slug đã tồn tại, vui lòng chọn slug khác.', 400)
    }
  }
}
export const canReadCategories: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (
    user.employee?.typeDepartment === 'productDevelopment' ||
    user.employee?.typeDepartment === 'business' ||
    user.employee?.typeDepartment === 'warehouse'
  ) {
    if (user.employee.department || (user.employee.regionalManagement?.docs?.length ?? 0) > 0) {
      return true
    } else {
      return false
    }
  }
  return false
}
export const canUpdateCreateDeleteCategories: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'productDevelopment') {
    if (user.employee.department || (user.employee.regionalManagement?.docs?.length ?? 0) > 0) {
      return true
    } else {
      return false
    }
  }
  return false
}
