import { CollectionConfig } from 'payload'
import {
  showTitle,
  romdomId,
  showPrice,
  totalPrice,
  formatPrice,
  changePrice,
  checkTime,
  checkValue,
  changeStatus,
  autoVoucherMaker,
  updateOrder,
  canUpdateCreateDelete,
} from '@/Hooks/HookTransaction'
export const Transactions: CollectionConfig = {
  slug: 'transactions',
  labels: {
    singular: 'Giao Dịch',
    plural: 'Giao Dịch',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'typeTransactionTitle', 'totalAmountTitle', 'totalAmountTitle'],
    group: 'Quản Lý kinh doanh',
    hidden: ({ user }) => {
      if (user?.role === 'admin' || user?.employee?.typeDepartment === 'business') {
        return false
      }
      return true
    },
  },
  access: {
    update: canUpdateCreateDelete,
    delete: canUpdateCreateDelete,
    create: canUpdateCreateDelete,
  },
  fields: [
    {
      name: 'title',
      label: 'Mã Giao Dịch',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'typeTransactionTitle',
      label: 'Loại giao dịch',
      type: 'radio',
      options: [
        { label: 'Khách hàng', value: 'customer' },
        { label: 'Công ty', value: 'company' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'totalAmountTitle',
      label: 'Tổng tiền thanh toán',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'currencyTitle',
      label: 'Loại Tiền',
      type: 'select',
      options: [
        { label: 'VND', value: 'VND' },
        { label: 'USD', value: 'USD' },
      ],
      defaultValue: 'VND',
      admin: { hidden: true },
    },
    {
      name: 'info',
      label: 'Thông tin Giao dịch',
      type: 'group',
      fields: [
        {
          name: 'typeTransaction',
          label: 'Loại giao dịch',
          type: 'radio',
          options: [
            { label: 'Khách hàng', value: 'customer' },
            { label: 'Công ty', value: 'company' },
          ],
        },
        {
          name: 'transactionId',
          label: 'Mã Giao Dịch',
          type: 'text',
          admin: {
            condition: (data) => !!data.info.transactionId,
            readOnly: true,
          },
        },
        {
          name: 'voucherMaker',
          label: 'Người lập phiếu',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            condition: (data) => !!data.info.voucherMaker,
            readOnly: true,
          },
        },
        {
          name: 'order',
          label: 'Đơn Hàng Liên Quan',
          type: 'relationship',
          relationTo: 'orders',
          hasMany: true,
          admin: {
            allowCreate: false,
          },
          filterOptions: async ({ data, req }) => {
            if (!data) return false

            if (data?.info?.customer && data?.info?.typeTransaction === 'customer') {
              const find = await req.payload.findByID({
                collection: 'customers',
                id: data.info.customer,
              })
              const findOrder = find.ordersAndDeal?.orders?.orderId?.docs
                ?.filter((item) =>
                  typeof item === 'object' && item !== null ? item.transactions !== null : item,
                )
                .map((item) => (typeof item === 'object' && item !== null ? item.id : item))
              return {
                id: {
                  in: findOrder !== undefined ? findOrder : null,
                },
              }
            }
            if (data?.info?.suppliers && data?.info?.typeTransaction === 'company') {
              const find = await req.payload.findByID({
                collection: 'Suppliers',
                id: data.info.suppliers,
              })
              const findOrder = find.order?.docs
                ?.filter((item) => {
                  return typeof item === 'object' && item !== null
                    ? item.transactions !== null
                    : item
                })
                .map((item) => (typeof item === 'object' && item !== null ? item.id : item))
              return {
                id: {
                  in: findOrder?.length !== 0 ? findOrder : null,
                },
              }
            }
            return false
          },
        },
        {
          name: 'customer',
          label: 'Khách Hàng',
          type: 'relationship',
          relationTo: 'customers',
          admin: {
            allowCreate: false,
            condition: (data) => {
              if (data?.info?.typeTransaction === 'customer') {
                return true
              }
              return false
            },
          },
        },
        {
          name: 'suppliers',
          label: 'Nhà cung cấp',
          type: 'relationship',
          relationTo: 'Suppliers',
          admin: {
            condition: (data) => {
              if (data?.info?.typeTransaction === 'company') {
                return true
              }
              return false
            },
            allowCreate: false,
          },
        },
        {
          name: 'dateMake',
          label: 'Ngày nhập',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
      ],
    },
    {
      name: 'transactionAmount',
      label: 'Tính tiền',
      type: 'group',
      fields: [
        {
          name: 'subtotal',
          label: 'Tổng tiền hàng',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'discountType',
              label: 'Loại chiết khấu',
              type: 'select',
              options: [
                { label: 'Phần trăm (%) trên tổng đơn', value: 'percentage' },
                { label: 'Số tiền cố định', value: 'fixed' },
              ],
              defaultValue: 'percentage',
            },
            {
              name: 'discountValue',
              label: 'discountValue',
              type: 'text',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'shippingType',
              label: 'Loại phí vận chuyển',
              type: 'select',
              options: [
                { label: 'Số tiền cố định', value: 'fixed' },
                { label: 'Phần trăm (%) trên tổng đơn', value: 'percentage' },
              ],
              defaultValue: 'percentage',
            },
            {
              name: 'shippingValue',
              label: 'Giá trị phí vận chuyển',
              type: 'text',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'offerType',
              label: 'Loại ưu đãi',
              type: 'select',
              options: [
                { label: 'Số tiền cố định', value: 'fixed' },
                { label: 'Phần trăm (%) trên tổng đơn', value: 'percentage' },
              ],
              defaultValue: 'percentage',
            },
            {
              name: 'offerValue',
              label: 'Giá trị ưu đãi',
              type: 'text',
            },
          ],
        },
        {
          name: 'totalAmount',
          label: 'Tổng tiền thanh toán',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'currency',
          label: 'Loại Tiền',
          type: 'select',
          options: [
            { label: 'VND', value: 'VND' },
            { label: 'USD', value: 'USD' },
          ],
          defaultValue: 'VND',
        },
      ],
    },
    {
      name: 'payment',
      label: 'Thanh toán',
      type: 'group',
      fields: [
        {
          name: 'paymentMethod',
          label: 'Phương Thức Thanh Toán',
          type: 'select',
          options: [
            { label: 'Tiền mặt', value: 'cash' },
            { label: 'Chuyển khoản', value: 'bank_transfer' },
            { label: 'Ví điện tử', value: 'e_wallet' },
          ],
          defaultValue: 'cash',
        },
        {
          name: 'bankInfo',
          label: 'Thông Tin Chuyển Khoản',
          type: 'group',
          admin: {
            condition: (data) => data?.payment?.paymentMethod === 'bank_transfer',
          },
          fields: [
            {
              name: 'bankName',
              label: 'Tên Ngân Hàng',
              type: 'text',
            },
            {
              name: 'accountNumber',
              label: 'Số Tài Khoản',
              type: 'text',
            },
            {
              name: 'accountHolder',
              label: 'Chủ Tài Khoản',
              type: 'text',
            },
            {
              name: 'transactionReference',
              label: 'Mã Giao Dịch Chuyển Khoản',
              type: 'text',
            },
          ],
        },
        {
          name: 'eWalletInfo',
          label: 'Thông tin Ví điện tử',
          type: 'group',
          admin: {
            condition: (data) => data?.payment?.paymentMethod === 'e_wallet', // Chỉ hiển thị khi chọn "Ví điện tử"
          },
          fields: [
            {
              name: 'walletName',
              label: 'Tên Ví (Momo, ZaloPay, ShopeePay...)',
              type: 'text',
            },
            {
              name: 'walletId',
              label: 'Số điện thoại / ID Ví',
              type: 'text',
            },
            {
              name: 'transactionReference',
              label: 'Mã giao dịch',
              type: 'text',
            },
          ],
        },
        {
          name: 'status',
          label: 'Trạng Thái',
          type: 'select',
          options: [
            { label: 'Đang xử lý', value: 'pending' },
            { label: 'Thành công', value: 'success' },
            { label: 'Thất bại', value: 'failed' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'transactionDate',
          label: 'Ngày Giao Dịch',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
      ],
    },
    {
      name: 'note',
      label: 'Ghi Chú',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeValidate: [romdomId, showTitle, checkValue, checkTime, changeStatus],
    beforeChange: [autoVoucherMaker, showPrice, formatPrice, changePrice],
    afterRead: [totalPrice],
    afterChange: [updateOrder],
  },
}
export default Transactions
