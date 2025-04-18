import type { Field } from 'payload'

export const hero: Field = {
  name: 'hocvan',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'degree',
      type: 'text',
      label: 'Bằng Cấp',
      validate: (value: unknown) => {
        if (!value) {
          return 'Không được để trống'
        }
        if (typeof value !== 'string') {
          return 'Giá trị phải là chuỗi số'
        }
        return true
      },
    },
    {
      name: 'university',
      type: 'text',
      label: 'Đại Học',
      validate: (value: unknown) => {
        if (!value) {
          return 'Không được để trống'
        }
        if (typeof value !== 'string') {
          return 'Giá trị phải là chuỗi số'
        }
        return true
      },
    },
    {
      name: 'specialization',
      type: 'text',
      label: 'Chuyên Ngành',
      validate: (value: unknown) => {
        if (!value) {
          return 'Không được để trống'
        }
        if (typeof value !== 'string') {
          return 'Giá trị phải là chuỗi số'
        }
        return true
      },
    },
    {
      name: 'Certificate',
      label: 'Chứng chỉ',
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
      type: 'text',
      admin: {
        condition: (data) => {
          return data.employee?.position === 'director' ? true : false
        },
      },
    },
    {
      name: 'salary',
      label: 'Lương',
      type: 'number',
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
  fields: [],
}
export const WorkTime: Field = {
  name: 'WorkTime_User',
  label: '',
  type: 'join',
  collection: 'WorkTime',
  on: 'info_worktime',
}
