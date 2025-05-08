import type { Field } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
export const hero: Field = {
  name: 'hocvan',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'degree',
      label: 'Bằng Cấp',
      labels: {
        plural: 'Bằng Cấp',
        singular: 'Bằng Cấp',
      },
      type: 'array',
      fields: [
        {
          name: 'Namedegree',
          type: 'text',
          label: 'Tên Bằng Cấp',
        },
        {
          name: 'university',
          type: 'text',
          label: 'Đại Học',
        },
        {
          name: 'specialization',
          type: 'text',
          label: 'Chuyên Ngành',
        },
        {
          name: 'img',
          label: 'Minh chứng',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'Certificate',
      label: 'Chứng chỉ',
      labels: {
        singular: 'Chứng chỉ',
        plural: 'Chứng chỉ',
      },
      type: 'array',
      fields: [
        {
          name: 'nameCertificate',
          label: 'Tên chững chỉ',
          type: 'text',
        },
        {
          name: 'img',
          label: 'Minh chứng',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'Note',
          label: 'Ghi chú',
          type: 'textarea',
        },
      ],
    },
  ],
}
export const employee: Field = {
  name: 'employee',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'position',
      label: 'Vị trí công việc',
      type: 'select',
      defaultValue: 'employees',
      access: {
        update: ({ req }) => {
          const user = req.user
          if (!user) return false
          if (user.role === 'admin') {
            return true
          }
          return false
        },
      },
      options: [
        {
          label: 'Trưởng Phòng',
          value: 'manager',
        },
        {
          label: 'Phó Phòng',
          value: 'deputyManager',
        },
        {
          label: 'Nhân Viên',
          value: 'employees',
        },
        {
          label: 'Giám Đốc',
          value: 'director',
        },
      ],
    },
    {
      name: 'typeDepartment',
      label: 'Loại phòng ban',
      type: 'select',
      access: {
        update: ({ req }) => {
          const user = req.user
          if (!user) return false
          if (user.role === 'admin') {
            return true
          }
          return false
        },
      },
      options: [
        { label: 'Sản xuất', value: 'production' },
        { label: 'Kinh doanh', value: 'business' },
        { label: 'kho', value: 'warehouse' },
        { label: 'Phát triển sản phẩm', value: 'productDevelopment' },
      ],
    },
    {
      name: 'department',
      label: 'Phòng ban',
      type: 'relationship',
      relationTo: 'department',
      hasMany: false,
      admin: {
        condition: (data) => {
          if (
            (!data?.userID && !data.employee.department) ||
            data.employee?.position === 'director'
          )
            return false
          return true
        },
        readOnly: true,
      },
    },
    {
      name: 'regionalManagement',
      label: 'phòng ban quản lý',
      type: 'join',
      collection: 'department',
      on: 'manager',
      admin: {
        condition: (data) => {
          return data.employee?.position === 'director' ? true : false
        },
        allowCreate: false,
      },
      access: {
        read: ({ req }) => {
          const user = req.user
          if (!user) return false
          if (user.role === 'admin') {
            return true
          }
          if (user.employee?.position === 'director') {
            return true
          }
          return false
        },
      },
    },
    {
      name: 'salary',
      label: 'Lương',
      type: 'number',
      access: {
        update: ({ req }) => {
          const user = req.user
          if (!user) return false
          if (user.role === 'admin') {
            return true
          }
          return false
        },
      },
    },
    {
      name: 'statusWork',
      label: 'Tình trạng làm việc',
      type: 'select',
      options: [
        { label: 'Đang làm', value: 'working' },
        { label: 'Nghỉ việc', value: 'out' },
      ],
      defaultValue: 'working',
      access: {
        read: () => true,
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'assignedTasks',
      label: 'công việc được giao',
      type: 'relationship',
      relationTo: 'tasks',
    },
  ],
}
export const Skill: Field = {
  name: 'Skill',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'note',
      label: '',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
  ],
}
export const WorkTime: Field = {
  name: 'WorkTime_User',
  label: '',
  type: 'join',
  collection: 'WorkTime',
  on: 'info_worktime',
}
