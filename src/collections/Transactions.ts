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
} from '@/Hooks/HookTransaction'
export const Transactions: CollectionConfig = {
  slug: 'transactions',
  labels: {
    singular: 'Giao Dịch',
    plural: 'Giao Dịch',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['transactionId', 'customer', 'dateMake', 'status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'info',
      label: 'Thông tin Giao dịch',
      type: 'group',
      fields: [
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
          name: 'order',
          label: 'Đơn Hàng Liên Quan',
          type: 'join',
          collection: 'orders',
          on: 'transactions',
          admin: {
            allowCreate: false,
          },
        },
        {
          name: 'customer',
          label: 'Khách Hàng',
          type: 'relationship',
          relationTo: 'customers',
          admin: {
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
              label: 'Giá trị chiết khấu',
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
    beforeValidate: [romdomId, showTitle, checkTime, changeStatus],
    beforeChange: [showPrice, formatPrice, changePrice],
    afterRead: [totalPrice],
  },
}

export default Transactions
