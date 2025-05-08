import { CollectionConfig } from 'payload'
import {
  changeTypePrice,
  checkValue,
  formatPrice,
  percent,
  requiredunti,
  showTitle,
  trackPriceHistory,
  noEmtyPrice,
  canRead,
  canUpdateCreateDelete,
} from '@/Hooks/HookProductPrices'
export const ProductPrices: CollectionConfig = {
  slug: 'productprices',
  labels: {
    singular: 'Bảng giá sản phẩm',
    plural: 'Bảng giá sản phẩm',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['product', 'currency', 'price', 'effectiveDate', 'createdAt'],
    group: 'Quản Lý kinh doanh',
  },
  access: {
    read: canRead,
    update: canUpdateCreateDelete,
    delete: canUpdateCreateDelete,
    create: canUpdateCreateDelete,
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
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin giá',
          fields: [
            {
              name: 'product',
              label: 'Sản phẩm',
              type: 'relationship',
              relationTo: 'products',
              admin: {
                allowCreate: false,
              },
              filterOptions: async ({ req, siblingData }) => {
                const nameProduce = siblingData as { product: string }
                const findProduce = await req.payload.find({
                  collection: 'productprices',
                })
                const showProduce = findProduce.docs.map((dt) => dt.product)
                const product = showProduce.map((dt) =>
                  typeof dt === 'object' && dt !== null ? dt.id : dt,
                )
                return {
                  or: [{ id: { not_in: product } }, { id: { equals: nameProduce.product } }],
                }
              },
            },
            {
              name: 'price',
              label: 'Giá bán',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
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
                  name: 'priceProduct',
                  label: 'Giá',
                  type: 'text',
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
                {
                  name: 'tieredPricing',
                  label: 'Bậc giá theo số lượng',
                  type: 'array',
                  fields: [
                    {
                      name: 'minQuantity',
                      label: 'Số lượng tối thiểu',
                      type: 'number',
                    },
                    {
                      name: 'percent',
                      label: 'Phần trăm giảm',
                      type: 'text',
                      validate: (value: string | string[] | null | undefined) => {
                        if (typeof value !== 'string') {
                          return 'Vui lòng nhập đúng định dạng %'
                        }
                        const regex = /^\d+(\.\d+)?%$/
                        if (!regex.test(value)) {
                          return 'Vui lòng nhập đúng định dạng %'
                        }
                        return true
                      },
                    },
                    {
                      name: 'discountedPrice',
                      label: 'Giá ưu đãi',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => !!siblingData.discountedPrice,
                        readOnly: true,
                      },
                    },
                  ],
                },
                {
                  name: 'effectiveDate',
                  label: 'Ngày áp dụng',
                  type: 'date',
                },
              ],
            },
          ],
        },
        {
          label: 'Lịch sử thay đổi giá',
          fields: [
            {
              name: 'priceHistory',
              label: 'Lịch sử giá',
              type: 'array',
              admin: {
                readOnly: true,
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'changedAt',
                  label: 'Ngày thay đổi',
                  type: 'date',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'type',
                  label: 'Phân loại',
                  type: 'array',
                  admin: {
                    readOnly: true,
                  },
                  fields: [
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
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'oldPrice',
                          label: 'Giá cũ',
                          type: 'text',
                          admin: {
                            readOnly: true,
                          },
                        },
                        {
                          name: 'oldCurrency',
                          label: 'Loại tiền tệ',
                          type: 'select',
                          options: [
                            { label: 'VND', value: 'VND' },
                            { label: 'USD', value: 'USD' },
                          ],
                          defaultValue: 'VND',
                          admin: {
                            readOnly: true,
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'newPrice',
                          label: 'Giá mới',
                          type: 'text',
                          admin: {
                            readOnly: true,
                          },
                        },
                        {
                          name: 'newCurrency',
                          label: 'Loại tiền tệ',
                          type: 'select',
                          options: [
                            { label: 'VND', value: 'VND' },
                            { label: 'USD', value: 'USD' },
                          ],
                          defaultValue: 'VND',
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
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [showTitle, requiredunti, checkValue, noEmtyPrice],
    beforeChange: [changeTypePrice, trackPriceHistory, formatPrice],
    afterRead: [percent],
  },
}
