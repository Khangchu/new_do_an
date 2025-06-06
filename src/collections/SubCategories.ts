import { CollectionConfig } from 'payload'
import {
  BeforeChange,
  subEnsureUniqueSlug,
  canReadCategories,
  canUpdateCreateDeleteCategories,
} from '@/Hooks/HookCategories'
export const SubCategories: CollectionConfig = {
  slug: 'subCategories',
  labels: {
    singular: 'Danh mục con',
    plural: 'Danh mục con',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Quản lý Sản phẩm',
  },
  access: {
    read: canReadCategories,
    create: canUpdateCreateDeleteCategories,
    update: canUpdateCreateDeleteCategories,
    delete: canUpdateCreateDeleteCategories,
  },
  fields: [
    {
      name: 'title',
      label: 'Tên danh mục',
      type: 'text',
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      admin: {
        readOnly: true,
        condition: ({ data, siblingData }) => !!siblingData?.slug || !!data?.slug,
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
      name: 'parentCategory',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Danh mục cha',
    },
  ],
  hooks: {
    beforeChange: [subEnsureUniqueSlug, BeforeChange],
  },
}
