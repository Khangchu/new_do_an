import { CollectionConfig } from 'payload'

export const Colors: CollectionConfig = {
  slug: 'colors',
  labels: {
    singular: 'Màu săc',
    plural: 'Màu sắc',
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên màu',
      validate: (value: unknown) => {
        if (typeof value !== 'string') {
          return 'phai la 1 chuoi'
        }
        if (!value) {
          return 'Không được trống'
        }
        return true
      },
    },
    {
      name: 'hex',
      type: 'text',
      label: 'Mã màu HEX',
      validate: (value: unknown) => {
        if (typeof value !== 'string') {
          return 'phai la 1 chuoi'
        }
        if (!value) {
          return 'Không được để trống'
        }
        return true
      },
    },
  ],
}
