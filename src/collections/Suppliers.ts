import { CollectionConfig } from 'payload'
import {
  randomId,
  noEmtyValue,
  canReadSupplier,
  canUpdateCreateDeleteSupplier,
} from '@/Hooks/HookSuppliers'
export const Suppliers: CollectionConfig = {
  slug: 'Suppliers',
  labels: {
    singular: 'Nhà Cung Cấp',
    plural: 'Nhà Cung Cấp',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['idSuppliers', 'name', 'sdt', 'fax'],
    group: 'Quản lý vật liệu và máy móc',
  },
  access: {
    read: canReadSupplier,
    update: canUpdateCreateDeleteSupplier,
    create: canUpdateCreateDeleteSupplier,
    delete: canUpdateCreateDeleteSupplier,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin chung',
          fields: [
            {
              name: 'idSuppliers',
              label: 'Mã nhà cung cấp',
              type: 'text',
              admin: {
                readOnly: true,
                condition: (data) => !!data.idSuppliers,
              },
            },
            {
              name: 'name',
              label: 'Tên Công Ty',
              type: 'text',
            },
            {
              name: 'ad',
              label: 'Tên Tiếng Anh',
              type: 'text',
            },
            {
              name: 'address',
              label: 'Địa Chỉ',
              type: 'text',
            },
            {
              name: 'sdt',
              label: 'Số Điện Thoại',
              type: 'text',
              validate: (value: unknown) => {
                if (typeof value !== 'string') {
                  return 'Giá trị phải là chuỗi số'
                }
                const regex = /^0\d{9}$/
                return regex.test(value) ? true : 'Số điện thoại không hợp lệ!'
              },
            },

            {
              name: 'fax',
              label: 'Số Fax',
              type: 'number',
              min: 0,
              validate: (value: unknown) => {
                if (!Number.isInteger(value)) {
                  return 'Phải là số nguyên!'
                }
                return true
              },
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
            },
            {
              name: 'webside',
              label: 'Webside',
              type: 'text',
              validate: (value: unknown) => {
                if (typeof value !== 'string') return 'Giá trị không hợp lệ'
                const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
                return regex.test(value) ? true : 'Vui lòng nhập một URL hợp lệ'
              },
            },
            {
              name: 'importedMachine',
              label: 'Nhập máy móc',
              type: 'relationship',
              relationTo: 'machine',
              hasMany: true,
            },
            {
              name: 'Imported materials',
              label: 'Nhập Vật Liệu',
              type: 'relationship',
              relationTo: 'materials',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Lịch sử đơn hàng và giao dịch',
          fields: [
            {
              name: 'order',
              label: 'Đợn hàng',
              type: 'join',
              collection: 'orders',
              on: 'suppliers',
              admin: {
                allowCreate: false,
              },
            },
            {
              name: 'transaction',
              label: 'Giao dịch',
              type: 'join',
              collection: 'transactions',
              on: 'info.suppliers',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [randomId, noEmtyValue],
  },
}
