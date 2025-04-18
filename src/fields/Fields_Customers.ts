import { Field } from 'payload'

export const info: Field = {
  name: 'info',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'nameCustomers',
      label: 'khách hàng/doanh nghiệp',
      type: 'text',
    },
    {
      label: 'Người liên hệ chính',
      type: 'collapsible',
      fields: [
        {
          name: 'nameContactPerson',
          label: 'Tên người liên hệ',
          type: 'text',
        },
        {
          name: 'role',
          label: 'chức vụ',
          type: 'text',
        },
        {
          name: 'phone',
          label: 'số điện thoại',
          type: 'number',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
        },
      ],
    },
    {
      name: 'address',
      label: 'Địa chỉ',
      type: 'textarea',
    },
    {
      name: 'typeCustomers',
      label: 'Loại khách hàng',
      type: 'select',
      options: [
        { label: 'Cá nhân', value: 'Individual' },
        { label: ' cửa hàng bán lẻ', value: 'Stores' },
        { label: 'nhà phân phối', value: 'Distributor' },
        { label: 'đội thể thao', value: 'SportsTeam' },
        { label: 'trường học', value: 'school' },
      ],
    },
  ],
}
export const ordersAndDealAndDeal: Field = {
  name: 'ordersAndDeal',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'orders',
      label: 'Đơn hàng',
      type: 'group',
      fields: [
        {
          name: 'orderId',
          label: '',
          type: 'join',
          collection: 'orders',
          on: 'customerName',
        },
      ],
    },
    {
      name: 'deal',
      label: 'Giao dịch',
      type: 'group',
      fields: [
        {
          name: 'dealId',
          label: '',
          type: 'join',
          collection: 'transactions',
          on: 'info.customer',
        },
      ],
    },
  ],
}
