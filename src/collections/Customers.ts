import { CollectionConfig } from 'payload'
import { ordersAndDealAndDeal } from '@/fields/Fields_Customers'
import { randomId, checkValue, canUpdateCreateDeleteCustomer } from '@/Hooks/HookCustomers'

export const customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Khách hàng',
    plural: 'Khách hàng',
  },
  admin: {
    useAsTitle: 'nameCustomers',
    defaultColumns: ['idCustomers', 'nameCustomers', 'typeCustomers', 'phone'],
    group: 'Quản Lý kinh doanh',
    hidden: ({ user }) => {
      if (!user) return true
      if (user.role === 'admin' || user.employee?.typeDepartment === 'business') {
        return false
      }
      return true
    },
  },
  access: {
    delete: canUpdateCreateDeleteCustomer,
    update: canUpdateCreateDeleteCustomer,
    create: canUpdateCreateDeleteCustomer,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin khách hàng',
          fields: [
            {
              name: 'idCustomers',
              label: 'Mã khách hàng',
              type: 'text',
              admin: {
                condition: (data) => !!data.idCustomers,
                readOnly: true,
              },
            },
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
          label: 'Tài liệu đính kèm',
          fields: [
            {
              name: 'attachments',
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
    beforeValidate: [randomId, checkValue],
  },
}
