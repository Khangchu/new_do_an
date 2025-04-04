import { CollectionConfig } from 'payload'
import { info, ordersAndDealAndDeal } from '@/fields/Fields_Customers'

export const customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Khách hàng',
    plural: 'Khách hàng',
  },
  admin: {
    useAsTitle: 'nameCustomers',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin khách hàng',
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
        },
        {
          label: ' Lịch sử giao dịch & đơn hàng',
          fields: [ordersAndDealAndDeal],
        },
        {
          label: 'Lịch sử chăm sóc khách hàng',
          fields: [],
        },
      ],
    },
  ],
}
