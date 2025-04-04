import {
  rondomID,
  checkTime,
  priceProduct,
  updateReport,
  totalValueProduce,
  checkValueSanPham,
  checkInfo,
} from '@/Hooks/HookOrder'
import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Đơn Hàng',
    plural: 'Đơn Hàng',
  },
  admin: {
    useAsTitle: 'orderId',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin phiếu',
          fields: [
            {
              name: 'orderId',
              label: 'ID đơn hàng',
              type: 'text',
              admin: {
                condition: (data) => !!data.orderId,
                readOnly: true,
              },
            },
            {
              name: 'voucherMaker',
              label: 'Người lập phiếu',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'dateMake',
              label: 'Ngày lập',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              name: 'customerName',
              label: 'Tên khách hàng',
              type: 'relationship',
              relationTo: 'customers',
            },

            {
              name: 'adderssShip',
              label: 'Địa chỉ giao hàng',
              type: 'textarea',
            },
            {
              name: 'dateShip',
              label: 'Ngày giao hàng dự kiến',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              name: 'shippingMethods',
              label: 'Phương thức vận chuyển',
              type: 'text',
            },
          ],
        },
        {
          label: 'Sản phẩm',
          fields: [
            {
              name: 'products',
              label: 'Sản phẩm',
              interfaceName: 'CardSlider',
              type: 'array',
              fields: [
                {
                  name: 'productId',
                  label: 'ID Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                  filterOptions: async ({ req }) => {
                    const productPrices = await req.payload.find({
                      collection: 'productprices',
                    })
                    const productId = productPrices.docs.map((dt) => {
                      const productId =
                        typeof dt.product === 'object' && dt.product !== null
                          ? dt.product?.id
                          : dt.product
                      return productId
                    })
                    return {
                      id: { in: productId },
                    }
                  },
                },
                {
                  name: 'quantity',
                  label: 'Số lượng',
                  type: 'number',
                  admin: {
                    condition: (data, siblingData) => !!siblingData.productId,
                  },
                },
                {
                  name: 'unti',
                  label: 'Đơn vị',
                  type: 'select',
                  options: [
                    { label: 'Cái', value: 'cai' },
                    { label: 'Bộ', value: 'bo' },
                    { label: 'Đôi', value: 'doi' },
                  ],
                  admin: {
                    condition: (data, siblingData) => !!siblingData.productId,
                  },
                },
                {
                  name: 'price',
                  label: 'Giá',
                  type: 'text',
                  admin: {
                    readOnly: true,
                    condition: (data, siblingData) => !!siblingData.price,
                  },
                },
                {
                  name: 'totalPrice',
                  label: 'Tổng giá',
                  type: 'text',
                  admin: {
                    readOnly: true,
                    condition: (data, siblingData) => !!siblingData.totalPrice,
                  },
                },
                {
                  name: 'currency',
                  label: 'Loại tiền tệ',
                  type: 'select',
                  options: [
                    { label: 'VND', value: 'VND' },
                    { label: 'USD', value: 'USD' },
                  ],
                  admin: {
                    readOnly: true,
                    condition: (data, siblingData) => !!siblingData.currency,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Báo cáo',
          fields: [
            {
              name: 'productsReport',
              label: 'Sản phẩm',
              type: 'array',
              admin: {
                readOnly: true,
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'productId',
                  label: 'ID Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                },
                {
                  name: 'report',
                  label: 'Thống kê',
                  type: 'array',
                  fields: [
                    {
                      name: 'quantity',
                      label: 'Số lượng',
                      type: 'number',
                    },
                    {
                      name: 'unti',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { label: 'Cái', value: 'cai' },
                        { label: 'Bộ', value: 'bo' },
                        { label: 'Đôi', value: 'doi' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Tổng giá trị đơn hàng',
              type: 'collapsible',
              fields: [
                {
                  name: 'totalPrice',
                  label: 'Giá',
                  type: 'text',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'currency',
                  label: 'Loại tiền tệ',
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
              name: 'transactions',
              label: 'Phiếu giao dịch',
              type: 'relationship',
              relationTo: 'transactions',
            },
            {
              name: 'status',
              label: 'Trạng thái',
              type: 'select',
              options: [
                { label: 'Đang xử lý', value: 'dang_xu_ly' },
                { label: 'Đã giao', value: 'da_giao' },
                { label: 'Đã hủy', value: 'da_huy' },
              ],
              defaultValue: 'dang_xu_ly',
            },
            {
              name: 'goodsDeliveryNote',
              label: 'Phiếu Xuất Kho',
              type: 'join',
              collection: 'goodsDeliveryNote',
              on: 'order',
              admin: {
                condition: (data) => data.status === 'da_giao',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [checkInfo, rondomID, checkTime, checkValueSanPham],
    beforeChange: [priceProduct, updateReport],
    afterRead: [totalValueProduce],
  },
}
