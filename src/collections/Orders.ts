import {
  rondomID,
  checkTime,
  priceProduct,
  updateReport,
  totalValueProduce,
  checkValueSanPham,
  checkInfo,
  autoVoucherMaker,
  priceMaterialAndMachine,
  checkValueMaterialAndMachine,
  noChangeTypeOrder,
  canRead,
  canUpdateCreateDelete,
} from '@/Hooks/HookOrder'
import { CollectionConfig } from 'payload'
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Đơn Hàng',
    plural: 'Đơn Hàng',
  },
  access: {
    read: canRead,
    update: canUpdateCreateDelete,
    delete: canUpdateCreateDelete,
    create: canUpdateCreateDelete,
  },
  admin: {
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'typeOrder', 'voucherMaker', 'dateMake'],
    group: 'Quản Lý kinh doanh',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin phiếu',
          fields: [
            {
              name: 'typeOrder',
              label: 'Loại đơn hàng',
              type: 'radio',
              options: [
                { label: 'Khách hàng', value: 'customer' },
                { label: 'Công ty', value: 'company' },
              ],
            },
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
              admin: {
                readOnly: true,
                condition: (data) => !!data.voucherMaker,
              },
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
              admin: {
                condition: (data) => {
                  if (data.typeOrder === 'customer') {
                    return true
                  }
                  return false
                },
                allowCreate: false,
              },
            },
            {
              name: 'suppliers',
              label: 'Nhà cung cấp',
              type: 'relationship',
              relationTo: 'Suppliers',
              admin: {
                condition: (data) => {
                  if (data.typeOrder === 'company') {
                    return true
                  }
                  return false
                },
                allowCreate: false,
              },
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
          admin: {
            condition: (data) => {
              if (data.typeOrder === 'customer') {
                return true
              }
              return false
            },
          },
          fields: [
            {
              name: 'products',
              label: 'Sản phẩm',
              interfaceName: 'CardSlider',
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
                  admin: {
                    allowCreate: false,
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
          label: 'Vật liệu',
          admin: {
            condition: (data) => {
              if (data.typeOrder === 'company') {
                return true
              }
              return false
            },
          },
          fields: [
            {
              name: 'material',
              label: 'Vật liệu',
              interfaceName: 'CardSlider',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'materialName',
                  label: 'Vật liệu',
                  type: 'relationship',
                  relationTo: 'materials',
                  filterOptions: async ({ req, data }) => {
                    if (data.typeOrder === 'company' && data.suppliers) {
                      const productPrices = await req.payload.find({
                        collection: 'materialAndMachinePrice',
                        where: {
                          chose: { equals: 'material' },
                        },
                      })
                      const productId = productPrices.docs
                        .filter((dt) => {
                          return dt?.price?.some((pc) => {
                            const idSupplier =
                              typeof pc.supplier === 'object' && pc.supplier !== null
                                ? pc.supplier.id
                                : pc.supplier
                            return idSupplier === data.suppliers
                          })
                        })
                        .map((dt) => {
                          const productId =
                            typeof dt.materialName === 'object' && dt.materialName !== null
                              ? dt.materialName.id
                              : dt.materialName
                          return productId
                        })
                      return {
                        id: { in: productId.length !== 0 ? productId : null },
                      }
                    }
                    return false
                  },
                  admin: {
                    allowCreate: false,
                  },
                },
                {
                  name: 'soluongMaterial',
                  label: 'Số lượng',
                  type: 'number',
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.materialName
                    },
                  },
                  defaultValue: 0,
                },
                {
                  name: 'unitMaterial',
                  label: 'Đơn vị tính',
                  type: 'select',
                  options: [
                    { label: 'Kilogram (Kg)', value: 'kg' },
                    { label: 'Gram (g)', value: 'g' },
                    { label: 'Tấn (T)', value: 't' },
                    { label: 'Mét (m)', value: 'm' },
                    { label: 'Cuộn', value: 'cuon' },
                    { label: 'Lít (L)', value: 'l' },
                    { label: 'Cái', value: 'cai' },
                    { label: 'Bộ', value: 'bo' },
                    { label: 'Thùng', value: 'thung' },
                    { label: 'Hộp', value: 'hop' },
                    { label: 'Bao', value: 'bao' },
                    { label: 'Pallet', value: 'pallet' },
                  ],
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.soluongMaterial
                    },
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
          label: 'Máy móc',
          admin: {
            condition: (data) => {
              if (data.typeOrder === 'company') {
                return true
              }
              return false
            },
          },
          fields: [
            {
              name: 'machine',
              label: 'Máy móc',
              interfaceName: 'CardSlider',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'machineName',
                  label: 'Máy móc',
                  type: 'relationship',
                  relationTo: 'machine',
                  filterOptions: async ({ req, data }) => {
                    if (data.typeOrder === 'company' && data.suppliers) {
                      const productPrices = await req.payload.find({
                        collection: 'materialAndMachinePrice',
                        where: {
                          chose: { equals: 'machine' },
                        },
                      })
                      const productId = productPrices.docs
                        .filter((dt) => {
                          return dt?.price?.some((pc) => {
                            const idSupplier =
                              typeof pc.supplier === 'object' && pc.supplier !== null
                                ? pc.supplier.id
                                : pc.supplier
                            return idSupplier === data.suppliers
                          })
                        })
                        .map((dt) => {
                          const productId =
                            typeof dt.machineName === 'object' && dt.machineName !== null
                              ? dt.machineName.id
                              : dt.machineName
                          return productId
                        })
                      return {
                        id: { in: productId.length !== 0 ? productId : null },
                      }
                    }
                    return false
                  },
                  admin: {
                    allowCreate: false,
                  },
                },
                {
                  name: 'soluongMachine',
                  label: 'Số lượng',
                  type: 'number',
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.machineName
                    },
                  },
                  defaultValue: 0,
                },
                {
                  name: 'unitMachine',
                  label: 'Đơn vị tính',
                  type: 'select',
                  options: [
                    { label: 'Cái', value: 'cai' },
                    { label: 'Bộ', value: 'bo' },
                    { label: 'Chiếc', value: 'chiec' },
                    { label: 'Hệ thống', value: 'he-thong' },
                    { label: 'Máy', value: 'may' },
                    { label: 'Tấn (T)', value: 't' },
                    { label: 'Kilogram (Kg)', value: 'kg' },
                    { label: 'Thùng', value: 'thung' },
                    { label: 'Hộp', value: 'hop' },
                    { label: 'Bao', value: 'bao' },
                    { label: 'Pallet', value: 'pallet' },
                    { label: 'Lô', value: 'lo' },
                    { label: 'Cuộn', value: 'cuon' },
                    { label: 'Mét (m)', value: 'm' },
                  ],
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.soluongMachine
                    },
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
                condition: (data) => {
                  if (data.typeOrder === 'customer') {
                    return true
                  }
                  return false
                },
              },
              fields: [
                {
                  name: 'productId',
                  label: 'ID Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                  admin: {
                    allowCreate: false,
                  },
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
              name: 'materialReport',
              label: 'Vật liệu',
              type: 'array',
              admin: {
                readOnly: true,
                initCollapsed: true,
                condition: (data) => {
                  if (data.typeOrder === 'company') {
                    return true
                  }
                  return false
                },
              },
              fields: [
                {
                  name: 'materialId',
                  label: 'ID Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'materials',
                  admin: {
                    allowCreate: false,
                  },
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
                        { label: 'Kilogram (Kg)', value: 'kg' },
                        { label: 'Gram (g)', value: 'g' },
                        { label: 'Tấn (T)', value: 't' },
                        { label: 'Mét (m)', value: 'm' },
                        { label: 'Cuộn', value: 'cuon' },
                        { label: 'Lít (L)', value: 'l' },
                        { label: 'Cái', value: 'cai' },
                        { label: 'Bộ', value: 'bo' },
                        { label: 'Thùng', value: 'thung' },
                        { label: 'Hộp', value: 'hop' },
                        { label: 'Bao', value: 'bao' },
                        { label: 'Pallet', value: 'pallet' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'machineReport',
              label: 'Máy móc',
              type: 'array',
              admin: {
                readOnly: true,
                initCollapsed: true,
                condition: (data) => {
                  if (data.typeOrder === 'company') {
                    return true
                  }
                  return false
                },
              },
              fields: [
                {
                  name: 'machineId',
                  label: 'ID Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'machine',
                  admin: {
                    allowCreate: false,
                  },
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
                        { label: 'Chiếc', value: 'chiec' },
                        { label: 'Hệ thống', value: 'he-thong' },
                        { label: 'Máy', value: 'may' },
                        { label: 'Tấn (T)', value: 't' },
                        { label: 'Kilogram (Kg)', value: 'kg' },
                        { label: 'Thùng', value: 'thung' },
                        { label: 'Hộp', value: 'hop' },
                        { label: 'Bao', value: 'bao' },
                        { label: 'Pallet', value: 'pallet' },
                        { label: 'Lô', value: 'lo' },
                        { label: 'Cuộn', value: 'cuon' },
                        { label: 'Mét (m)', value: 'm' },
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
    beforeValidate: [
      noChangeTypeOrder,
      checkInfo,
      rondomID,
      checkTime,
      checkValueSanPham,
      checkValueMaterialAndMachine,
    ],
    beforeChange: [autoVoucherMaker, priceProduct, priceMaterialAndMachine, updateReport],
    afterRead: [totalValueProduce],
  },
}
