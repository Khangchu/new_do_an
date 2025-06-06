import { CollectionConfig } from 'payload'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    group: 'Quản lý nhân sự',
  },
  fields: [
    {
      name: 'taskId',
      label: 'ID Công việc',
      type: 'text',
    },
    {
      name: 'taskName',
      label: 'Tên công việc',
      type: 'text',
    },
    {
      name: 'description',
      label: 'Mô tả',
      type: 'textarea',
    },
  ],
}
