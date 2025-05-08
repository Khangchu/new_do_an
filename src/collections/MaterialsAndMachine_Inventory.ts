/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionConfig } from 'payload'
import {
  showTitle,
  totalPrice,
  rondomID,
  checkValue,
  showPrice,
  changeTypePrice,
  noEmtyValue,
  updateReport,
  canReadInventory,
  canUpdateInventory,
} from '@/Hooks/HookInventory'
import { accessAdmin } from '@/access/accessAll'
export const MaterialsAndMachine_Inventory: CollectionConfig = {
  slug: 'MaterialsAndMachine_Inventory',
  labels: {
    singular: 'Kho Vật Liêu và máy móc',
    plural: 'Kho Vật Liêu và máy móc',
  },
  admin: {
    useAsTitle: 'inventoryName',
    group: 'Quản lý Kho hàng',
    defaultColumns: ['inventoryId', 'inventoryName', 'factories', 'location'],
    hidden: ({ user }) => {
      if (!user) return true
      if (user.role === 'admin' || user.employee?.typeDepartment === 'warehouse') {
        return false
      }
      return true
    },
  },
  access: {
    read: canReadInventory,
    update: canUpdateInventory,
    create: accessAdmin,
    delete: accessAdmin,
  },
  fields: [
    {
      name: 'titel',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin Kho',
          fields: [
            {
              name: 'inventoryId',
              label: 'ID Kho Hàng',
              type: 'text',
              admin: {
                readOnly: true,
                condition: (data) => !!data.inventoryId,
              },
            },
            {
              name: 'inventoryName',
              label: 'Tên kho',
              type: 'text',
              access: {
                update: ({ req }) => req.user?.role === 'admin',
              },
            },
            {
              name: 'factories',
              label: 'Nhà máy chực thuộc',
              type: 'relationship',
              relationTo: 'factories',
              admin: {
                allowCreate: false,
              },
              access: {
                update: ({ req }) => req.user?.role === 'admin',
              },
            },
            {
              name: 'location',
              label: 'Địa Chỉ',
              type: 'textarea',
              access: {
                update: ({ req }) => req.user?.role === 'admin',
              },
            },
            {
              name: 'managerInventory',
              label: 'Phòng ban quản lý',
              type: 'relationship',
              relationTo: 'department',
              filterOptions: () => {
                return {
                  typeDepartment: { equals: 'warehouse' },
                }
              },
              access: {
                update: ({ req }) => req.user?.role === 'admin',
              },
            },
            {
              name: 'phoneInventory',
              label: 'Số điện thoại liên hệ',
              type: 'text',
              validate: (value: unknown) => {
                if (typeof value !== 'string') {
                  return 'Giá trị phải là chuỗi số'
                }
                const regex = /^0\d{9}$/
                return regex.test(value) ? true : 'Số điện thoại gồm 10 số'
              },
              access: {
                update: ({ req }) => req.user?.role === 'admin',
              },
            },
          ],
        },
        {
          label: 'Vật liệu',
          fields: [
            {
              type: 'array',
              name: 'material',
              label: 'Vật liệu',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'materialName',
                  label: 'Vật liệu',
                  type: 'relationship',
                  relationTo: 'materials',
                  admin: {
                    allowCreate: false,
                  },
                },
                {
                  name: 'suppliersMaterial',
                  label: 'Nhà cung cấp',
                  type: 'relationship',
                  relationTo: 'Suppliers',
                  filterOptions: async ({ req, siblingData }) => {
                    const materialData = siblingData as { materialName?: string }
                    if (!materialData.materialName) return true
                    const showMaterial = await req.payload.findByID({
                      collection: 'materials',
                      id: materialData.materialName,
                    })
                    if (
                      !showMaterial ||
                      !showMaterial.supplier ||
                      showMaterial.supplier.docs?.length === 0
                    ) {
                      return false
                    }
                    return {
                      id: {
                        in: showMaterial.supplier.docs?.map((supplier: any) => supplier.id),
                      },
                    }
                  },
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.materialName
                    },
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
                  label: 'Giá trị tồn Kho',
                  type: 'collapsible',
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.priceMaterial
                    },
                  },
                  fields: [
                    {
                      name: 'priceMaterial',
                      label: 'Đơn giá',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'totalPriceMaterial',
                      label: 'Tổng giá',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'typePriceMaterial',
                      label: 'Loại tiền',
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
        {
          label: 'Máy móc',
          fields: [
            {
              type: 'array',
              name: 'machine',
              label: 'Máy móc',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'machineName',
                  label: 'Máy móc',
                  type: 'relationship',
                  relationTo: 'machine',
                  admin: {
                    allowCreate: false,
                  },
                },
                {
                  name: 'suppliersMachine',
                  label: 'Nhà cung cấp',
                  type: 'relationship',
                  relationTo: 'Suppliers',
                  filterOptions: async ({ siblingData, req }) => {
                    const machineData = siblingData as { machineName?: string }
                    if (!machineData.machineName) return true
                    const showMachine = await req.payload.findByID({
                      collection: 'machine',
                      id: machineData.machineName,
                    })
                    if (
                      !showMachine ||
                      !showMachine.suppliers ||
                      showMachine.suppliers.docs?.length === 0
                    ) {
                      return false
                    }
                    return {
                      id: {
                        in: showMachine.suppliers.docs?.map((sup: any) => sup.id),
                      },
                    }
                  },
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.machineName
                    },
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
                  label: 'Giá trị tồn Kho',
                  type: 'collapsible',
                  admin: {
                    condition: (data, siblingData) => {
                      return !!siblingData.priceMachine
                    },
                  },
                  fields: [
                    {
                      name: 'priceMachine',
                      label: 'Giá',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'totalPriceMachine',
                      label: 'Tổng giá',
                      type: 'text',
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'typePriceMachine',
                      label: 'Loại tiền',
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
        {
          label: 'Báo cáo',
          fields: [
            {
              name: 'reportMaterial',
              label: 'Vật liệu',
              type: 'array',
              admin: {
                description: 'Thống kê vật liệu đã nhập',
                readOnly: true,
                initCollapsed: true,
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
                description: 'Thống kê máy moc đã nhập',
                readOnly: true,
                initCollapsed: true,
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
        {
          label: 'Lịch sư xuất nhập kho',
          fields: [
            {
              name: 'goodsDeliveryNote',
              label: 'Lịch sử xuất kho',
              type: 'join',
              collection: 'goodsDeliveryNote',
              on: 'inventoryM',
              admin: {
                allowCreate: false,
              },
            },
            {
              name: 'goodsReceivedNote',
              label: 'Lịch sử nhập kho',
              type: 'join',
              collection: 'goodsReceiveNote',
              on: 'inventory',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [checkValue, rondomID, showTitle, noEmtyValue],
    beforeChange: [showPrice, changeTypePrice, updateReport],
    afterRead: [totalPrice],
  },
}
