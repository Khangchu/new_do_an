import { CollectionConfig } from 'payload'
import { Os_Field } from '@/fields/Fields_Department'
import {
  beforeValidate,
  Change,
  afterDelete,
  noEmtyValue,
  canReadDepartment,
  canUpdateDepartment,
} from '@/Hooks/HookDepartment'
import { accessAdmin } from '@/access/accessAll'
export const department: CollectionConfig = {
  slug: 'department',
  labels: {
    singular: ' Phòng ban',
    plural: 'Phòng ban',
  },
  access: {
    read: canReadDepartment,
    update: canUpdateDepartment,
    create: accessAdmin,
    delete: accessAdmin,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Quản lý nhân sự',
    defaultColumns: ['idDepartment', 'typeDepartment', 'nameDepartment', 'manager'],
  },
  fields: [
    {
      label: '',
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin phòng ban',
          fields: [
            {
              name: 'idDepartment',
              label: 'Mã phòng ban',
              type: 'text',
              admin: {
                readOnly: true,
                condition: (data) => !!data.idDepartment,
              },
            },
            {
              name: 'typeDepartment',
              label: 'Loại phòng ban',
              type: 'select',
              access: {
                update: ({ req }) => !!accessAdmin({ req }),
              },
              options: [
                { label: 'Sản xuất', value: 'production' },
                { label: 'Kinh doanh', value: 'business' },
                { label: 'kho', value: 'warehouse' },
                { label: 'Phát triển sản phẩm', value: 'productDevelopment' },
              ],
            },
            {
              name: 'nameDepartment',
              label: 'Tên phòng ban',
              type: 'text',
            },
            {
              name: 'manager',
              type: 'relationship',
              relationTo: 'users',
              label: 'Giám đốc phòng ban',
              access: {
                update: ({ req }) => !!accessAdmin({ req }),
              },
              filterOptions: async ({ req, data }) => {
                const findUser = await req.payload.find({
                  collection: 'users',
                  where: {
                    'employee.position': { equals: 'director' },
                    'employee.typeDepartment': { equals: data.typeDepartment },
                  },
                })
                const userIDs = findUser.docs.map((user) => user.id)
                return {
                  id: { in: userIDs.length !== 0 ? userIDs : null },
                }
              },
              admin: {
                allowCreate: false,
              },
            },
            {
              name: 'Note',
              label: 'Mô tả',
              type: 'textarea',
            },
            {
              name: 'establishedDate',
              label: 'Ngày thành lập',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              name: 'title',
              label: '',
              type: 'text',
              admin: {
                hidden: true,
              },
            },
          ],
        },
        {
          label: 'Cơ cấu phòng ban',
          fields: [Os_Field],
        },
        {
          label: 'Tài liệu',
          fields: [
            {
              name: 'uploadFile',
              label: '',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [beforeValidate, noEmtyValue],
    afterChange: [Change, afterDelete],
  },
}
