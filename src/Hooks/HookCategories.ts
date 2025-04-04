import { APIError, CollectionBeforeChangeHook } from 'payload'
import slugify from 'slugify'

export const BeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  const error: string[] = []

  if (!data.title) {
    error.push('Tên danh mục')
  }
  const throwError = error.map((err) => err).join(',')
  if (error.length > 0) {
    throw new APIError(`Không được để trống:${throwError}`, 400)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ensureUniqueSlug = async ({ data, req, operation }: any) => {
  if (!data.slug && data.title) {
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
  if (!data.slug && data.title) {
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
