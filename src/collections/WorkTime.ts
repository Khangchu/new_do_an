import { CollectionConfig } from 'payload'

export const WorkTime: CollectionConfig = {
  slug: 'WorkTime',
  labels: {
    singular: 'Đăng ký lịch làm',
    plural: 'Đăng ký lịch làm',
  },
  admin: {
    useAsTitle: '',
  },
  fields: [
    {
      name: 'info_worktime',
      label: 'Thông tin nhân viên',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'time_worktime',
      label: 'Thời Gian Đăng Ký',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyy',
          minDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        },
      },
    },
    {
      name: 'shift',
      label: 'Ca làm việc',
      type: 'select',
      options: [
        { label: 'Sáng', value: 'morning' },
        { label: 'Chiều', value: 'afternoon' },
        { label: 'Tối', value: 'night' },
      ],
      required: true,
    },
    {
      name: 'note',
      label: 'Ghi chú',
      type: 'textarea',
    },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Đã duyệt', value: 'approved' },
        { label: 'Từ chối', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
    },
  ],
}
