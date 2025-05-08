/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionConfig } from 'payload'
import {
  priceProduct,
  totalValueProduce,
  setUpdateSoluong,
  checkValueSoluong,
  rondomID,
  checkValue,
  updateReport,
  checkTime,
  changeStatus,
  autoEmployee,
  canRead,
  canUpdate,
} from '@/Hooks/HookWarehousing'
import { machine, materials } from '@/fields/Fields_GoodDeliveryNote'
export const goodsDeliveryNote: CollectionConfig = {
  slug: 'goodsDeliveryNote',
  labels: {
    singular: 'Xuất kho',
    plural: 'Xuất kho',
  },
  admin: {
    useAsTitle: 'goodsDeliveryNoteID',
    group: 'Quản lý Kho hàng',
    defaultColumns: ['goodsDeliveryNoteID', 'chose', 'date', 'voucherMaker'],
  },
  access: {
    read: canRead,
    update: canUpdate,
    delete: canUpdate,
    create: canUpdate,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'chose',
              label: 'Loại xuất',
              type: 'select',
              options: [
                { label: 'Sản xuất', value: 'sanxuat' },
                { label: 'Đơn hàng', value: 'order' },
                { label: 'Chuyển kho sản phẩm', value: 'chuyenkhosanpham' },
                { label: 'Chuyển kho vật liệu và máy moc', value: 'chuyenkho' },
                { label: 'Tiêu hủy sản phẩm', value: 'tieuhuysanpham' },
                { label: 'Tiêu hủy vật liệu và máy moc', value: 'tieuhuy' },
              ],
              defaultValue: 'order',
            },
            {
              name: 'goodsDeliveryNoteID',
              label: 'Mã phiếu Xuất',
              type: 'text',
              admin: {
                condition: (data) => {
                  if (!data.goodsDeliveryNoteID) return false
                  return true
                },
                readOnly: true,
              },
            },
            {
              name: 'date',
              label: 'Ngày nhập',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'inventory',
                  label: 'Kho hàng sản phẩm',
                  type: 'relationship',
                  relationTo: 'Products_Inventory',
                  admin: {
                    allowCreate: false,
                    condition: (data) =>
                      data.chose === 'order' ||
                      data.chose === 'tieuhuysanpham' ||
                      data.chose === 'chuyenkhosanpham',
                  },
                  filterOptions: async ({ req, data }) => {
                    const user = req.user
                    const idDepartment =
                      typeof user?.employee?.department === 'object' &&
                      user?.employee?.department !== null
                        ? user?.employee?.department.id
                        : user?.employee?.department
                    if (!user) return false
                    if (!data) return false
                    const find = await req.payload.find({
                      collection: 'Products_Inventory',
                      where: {
                        employee: { equals: idDepartment },
                      },
                    })
                    if (data.chose === 'chuyenkhosanpham') {
                      return {
                        id: { not_equals: data.inventoryProduc },
                      }
                    }
                    return {
                      id: {
                        in:
                          find.docs.map((dt) => dt.id).length !== 0
                            ? find.docs.map((dt) => dt.id)
                            : null,
                      },
                    }
                  },
                },
                {
                  name: 'inventoryProduc',
                  label: 'Kho hàng sản phẩm đến',
                  type: 'relationship',
                  relationTo: 'Products_Inventory',
                  admin: {
                    allowCreate: false,
                    condition: (data) => data.chose === 'chuyenkhosanpham',
                  },
                  filterOptions: ({ data }) => {
                    if (!data) return false
                    if (data.chose === 'chuyenkhosanpham') {
                      return {
                        id: { not_equals: data.inventory },
                      }
                    }
                    return true
                  },
                },
              ],
            },
            {
              name: 'order',
              label: 'Đơn hàng',
              type: 'relationship',
              relationTo: 'orders',
              admin: {
                allowCreate: false,
                condition: (data) => data.chose === 'order',
              },
            },

            {
              type: 'row',
              fields: [
                {
                  name: 'inventoryM',
                  label: 'Kho vật liệu và máy móc',
                  type: 'relationship',
                  relationTo: 'MaterialsAndMachine_Inventory',
                  admin: {
                    allowCreate: false,
                    condition: (data) =>
                      data.chose === 'sanxuat' ||
                      data.chose === 'tieuhuy' ||
                      data.chose === 'chuyenkho',
                  },
                  filterOptions: async ({ data, req }) => {
                    const user = req.user
                    const idDepartment =
                      typeof user?.employee?.department === 'object' &&
                      user?.employee?.department !== null
                        ? user?.employee?.department.id
                        : user?.employee?.department
                    if (!data) return false
                    if (!user) return false
                    const find = await req.payload.find({
                      collection: 'MaterialsAndMachine_Inventory',
                      where: {
                        managerInventory: { equals: idDepartment },
                      },
                    })
                    if (data.chose === 'chuyenkho') {
                      return {
                        id: { not_equals: data.inventoryMTo },
                      }
                    }
                    return {
                      id: {
                        in:
                          find.docs.map((dt) => dt.id).length !== 0
                            ? find.docs.map((dt) => dt.id)
                            : null,
                      },
                    }
                  },
                },
                {
                  name: 'inventoryMTo',
                  label: 'Kho vật liệu và máy móc đến',
                  type: 'relationship',
                  relationTo: 'MaterialsAndMachine_Inventory',
                  admin: {
                    allowCreate: false,
                    condition: (data) => data.chose === 'chuyenkho',
                  },
                  filterOptions: ({ data }) => {
                    if (!data) return false
                    if (data.chose === 'chuyenkho') {
                      return {
                        id: { not_equals: data.inventoryM },
                      }
                    }
                    return true
                  },
                },
              ],
            },

            {
              name: 'shipper',
              label: 'Người giao hàng',
              type: 'text',
            },
            {
              name: 'voucherMaker',
              label: 'Người lập phiếu',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                condition: (data) => !!data.voucherMaker,
                readOnly: true,
              },
            },
          ],
          label: 'Thông Tin Phiếu Xuất',
        },
        {
          label: 'Sản phẩm ',
          admin: {
            condition: (data) => {
              if (
                data.chose === 'order' ||
                data.chose === 'tieuhuysanpham' ||
                data.chose === 'chuyenkhosanpham'
              ) {
                return true
              }
              return false
            },
          },
          fields: [
            {
              name: 'produce',
              admin: {
                initCollapsed: true,
              },
              type: 'array',
              fields: [
                {
                  name: 'sanpham',
                  label: 'Sản phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                  admin: {
                    allowCreate: false,
                    condition: (data) => {
                      if (!data.inventory) return false
                      return true
                    },
                  },
                  filterOptions: async ({ data, req }) => {
                    if (data.inventory) {
                      const inventory = await req.payload.findByID({
                        collection: 'Products_Inventory',
                        id: data.inventory,
                      })
                      const checkout = inventory?.catalogueOfGoods?.flatMap((dt) => dt.productId)
                      const checkoutId = checkout?.flatMap((dt) =>
                        typeof dt === 'object' && dt !== null ? dt.id : dt,
                      )
                      return {
                        id: { in: checkoutId },
                      }
                    }
                    return true
                  },
                },
                {
                  name: 'soluong',
                  label: 'Số lượng',
                  type: 'number',
                  admin: {
                    condition: (data, siblingData) => !!siblingData.sanpham,
                  },
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
                  admin: {
                    condition: (data, siblingData) => !!siblingData.sanpham,
                  },
                },
                {
                  name: 'cost',
                  label: 'Đơn giá',
                  type: 'text',
                  admin: {
                    condition: (data, siblingData) => {
                      if (!siblingData.cost) return false
                      return true
                    },
                    readOnly: true,
                  },
                },
                {
                  name: 'totalProduc',
                  label: 'Thành tiền',
                  type: 'text',
                  admin: {
                    condition: (data) => {
                      return data.produce?.some((dt: any) => dt.rate && dt.cost) ?? false
                    },
                    readOnly: true,
                  },
                },
                {
                  name: 'rate',
                  label: 'Tiền ',
                  type: 'text',
                  admin: {
                    condition: (data, siblingData) => {
                      if (!siblingData.rate) return false
                      return true
                    },
                    readOnly: true,
                  },
                },
                {
                  name: 'note',
                  label: 'Ghi chú',
                  type: 'textarea',
                },
              ],
            },
          ],
        },
        {
          label: 'Vật liệu',
          admin: {
            condition: (data) =>
              data.chose === 'sanxuat' || data.chose === 'tieuhuy' || data.chose === 'chuyenkho',
          },
          fields: [materials],
        },
        {
          label: 'Máy móc',
          admin: {
            condition: (data) =>
              data.chose === 'sanxuat' || data.chose === 'tieuhuy' || data.chose === 'chuyenkho',
          },
          fields: [machine],
        },
        {
          label: 'Báo cáo',
          fields: [
            {
              name: 'total',
              label: 'Sản phẩm',
              type: 'array',
              admin: {
                initCollapsed: true,
                condition: (data) => {
                  if (
                    data.chose === 'order' ||
                    data.chose === 'tieuhuysanpham' ||
                    data.chose === 'chuyenkhosanpham'
                  ) {
                    return true
                  }
                  return false
                },
                readOnly: true,
                description: 'Thống kê sản phẩm đã xuất',
              },
              fields: [
                {
                  name: 'nameProduct',
                  label: 'Tên sản phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                },
                {
                  name: 'report',
                  label: 'Thống kê',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                    readOnly: true,
                  },
                  fields: [
                    {
                      name: 'unit',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { label: 'Cái', value: 'cai' },
                        { label: 'Bộ', value: 'bo' },
                        { label: 'Đôi', value: 'doi' },
                      ],
                    },
                    {
                      name: 'soluong',
                      label: 'Số Lượng',
                      type: 'number',
                    },
                  ],
                },
              ],
            },
            {
              name: 'reportMaterial',
              label: 'Vật liệu',
              type: 'array',

              admin: {
                condition: (data) =>
                  data.chose === 'sanxuat' ||
                  data.chose === 'tieuhuy' ||
                  data.chose === 'chuyenkho',
                description: 'Thống kê vật liệu đã nhập',
                readOnly: true,
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'reportMaterialName',
                  label: 'Tên vật liệu',
                  type: 'relationship',
                  relationTo: 'materials',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'report',
                  label: 'Thống kê',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'reportMaterialSoLuong',
                      label: 'Số lượng',
                      type: 'number',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'reportMaterialUnits',
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
                        readOnly: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'reportMachines',
              label: 'Máy móc',
              type: 'array',
              admin: {
                condition: (data) =>
                  data.chose === 'sanxuat' ||
                  data.chose === 'tieuhuy' ||
                  data.chose === 'chuyenkho',
                description: 'Thống kê máy moc đã nhập',
                readOnly: true,
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'reportMachinesName',
                  label: 'Tên máy móc',
                  type: 'relationship',
                  relationTo: 'machine',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'report',
                  label: 'Thống kê',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'reportMachinesSoLuong',
                      label: 'Số lượng',
                      type: 'number',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'reportMachinesUnits',
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
                        readOnly: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Tổng giá trị nhập kho',
              type: 'collapsible',
              fields: [
                {
                  name: 'totalValue',
                  label: 'Tổng tiền',
                  type: 'text',
                  admin: { readOnly: true },
                },
                {
                  name: 'rateValue',
                  label: 'Loại Tiền',
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
      ],
    },
  ],
  hooks: {
    beforeChange: [priceProduct, updateReport],
    afterRead: [totalValueProduce],
    afterChange: [setUpdateSoluong, changeStatus],
    beforeValidate: [rondomID, checkValue, checkTime, checkValueSoluong, autoEmployee],
  },
}
