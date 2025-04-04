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
          if (!data?.userID) return false
          return true
        },
        readOnly: true,
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
