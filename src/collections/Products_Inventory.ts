import type { CollectionConfig } from 'payload'
import {
  showPrice,
  totalPrice,
  checkValueProduct,
  showReport,
  totalPriceReport,
  checkValue,
} from '@/Hooks/HookProductsInventory'
export const Products_Inventory: CollectionConfig = {
  slug: 'Products_Inventory',
  admin: {
    useAsTitle: 'inventoryName',
  },
  labels: {
    singular: 'Kho Sản Phẩm',
    plural: 'Kho Sản Phẩm',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin kho hàng',
          fields: [
            {
              name: 'inventoryName',
              label: 'Tên Kho Hàng',
              type: 'text',
            },
            {
              name: 'factories',
              label: 'Nhà máy chực thuộc',
              type: 'relationship',
              relationTo: 'factories',
            },
            {
              name: 'address',
              label: 'Địa chỉ',
              type: 'text',
            },
            {
              name: 'employee',
              label: 'Người quản lý',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'phone',
              label: 'Số Điện Thoại',
              type: 'text',
              validate: (value: unknown) => {
                if (!value) {
                  return 'Không được để trống'
                }
                if (typeof value !== 'string') {
                  return 'Giá trị phải là chuỗi số'
                }
                const regex = /^0\d{9}$/
                return regex.test(value) ? true : 'Số điện thoại gồm 10 số'
              },
            },
            {
              name: 'area',
              label: 'Diên tích kho',
              type: 'text',
            },
          ],
        },
        {
          label: 'Sản phẩm',
          fields: [
            {
              name: 'catalogueOfGoods',
              label: 'Danh mục hàng hóa',
              type: 'array',
              admin: {
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
                  name: 'danhmuc',
                  type: 'group',
                  label: '',
                  fields: [
                    {
                      name: 'amount',
                      label: 'Số lượng',
                      type: 'number',
                    },
                    {
                      name: 'unti',
                      label: 'Đơn vị tính',
                      type: 'select',
                      options: [
                        { label: 'Cái', value: 'cai' },
                        { label: 'Bộ', value: 'bo' },
                        { label: 'Đôi', value: 'doi' },
                      ],
                    },
                  ],
                },
                {
                  label: 'Giá trị tồn kho',
                  type: 'collapsible',
                  admin: {
                    condition: (data, siblingData) =>
                      !!siblingData.importPrice || !!siblingData.unitPrice,
                  },
                  fields: [
                    {
                      name: 'importPrice',
                      label: 'Giá Bán',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'totalPrice',
                      label: 'Tổng tiền',
                      type: 'text',
                      admin: {
                        readOnly: true,
                        condition: (data, siblingData) => !!siblingData.totalPrice,
                      },
                    },
                    {
                      name: 'unitPrice',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { value: 'VND', label: 'VND' },
                        { value: 'USD', label: 'USD' },
                      ],
                      admin: {
                        readOnly: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Báo cáo',
          fields: [
            {
              name: 'reportProduct',
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
                      name: 'unti',
                      label: 'Đơn vị tính',
                      type: 'select',
                      options: [
                        { label: 'Cái', value: 'cai' },
                        { label: 'Bộ', value: 'bo' },
                        { label: 'Đôi', value: 'doi' },
                      ],
                    },
                    {
                      name: 'amount',
                      label: 'Số lượng',
                      type: 'number',
                    },
                  ],
                },
              ],
            },
            {
              label: 'Giá trị tồn kho',
              type: 'collapsible',
              fields: [
                {
                  name: 'totalPrice',
                  label: 'Tổng tiền',
                  type: 'text',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'unitPrice',
                  label: 'Đơn vị',
                  type: 'select',
                  options: [
                    { value: 'VND', label: 'VND' },
                    { value: 'USD', label: 'USD' },
                  ],
                  defaultValue: 'VND',
                },
              ],
            },
          ],
        },
        {
          label: 'Lịch sử xuất và nhập',
          fields: [
            {
              name: 'deliveryNote',
              label: 'Phiếu xuất',
              type: 'text',
            },
            {
              name: 'receievedNote',
              label: 'Phiếu nhập',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [showPrice, showReport],
    afterRead: [totalPrice, totalPriceReport],
    beforeValidate: [checkValue, checkValueProduct],
  },
}
