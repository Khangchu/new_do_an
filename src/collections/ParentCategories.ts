import { CollectionConfig } from 'payload'
import { BeforeChange, ensureUniqueSlug } from '@/Hooks/HookCategories'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Danh mục',
    plural: 'Danh mục',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Tên danh mục',
      type: 'text',
      validate: (value: unknown) => {
        if (typeof value !== 'string') {
          return 'phải là 1 chuỗi'
        }
        if (!value) {
          return 'Không được để trống'
        }
        return true
      },
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      admin: {
        readOnly: true,
        condition: (data) => {
          if (!data?.slug) return false
          return true
        },
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hình ảnh danh mục',
    },
    {
      name: 'description',
      label: 'Mô tả ngắn',
      type: 'textarea',
    },
    {
      name: 'subCategories',
      type: 'join',
      label: 'Danh mục con',
      collection: 'subCategories',
      on: 'parentCategory',
    },
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'category',
      label: 'Sản phẩm',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      options: [
        {
          label: 'Hiện thị',
          value: 'active',
        },
        {
          label: 'Ẩn',
          value: 'inactive',
        },
      ],
      defaultValue: 'active',
    },
  ],
  hooks: {
    beforeChange: [BeforeChange, ensureUniqueSlug],
  },
}
