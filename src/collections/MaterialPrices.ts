/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionConfig } from 'payload'
import {
  showTitle,
  notChange,
  formatPrice,
  changeTypePrice,
  trackPriceHistory,
  canRead,
  canUpdateCreateDelete,
} from '@/Hooks/HookMaterialAndMachinePrices'

export const MaterialPrices: CollectionConfig = {
  slug: 'materialAndMachinePrice',
  access: {
    read: canRead,
    delete: canUpdateCreateDelete,
    create: canUpdateCreateDelete,
    update: canUpdateCreateDelete,
  },
  labels: {
    singular: 'Bảng giá vật liệu và máy móc',
    plural: 'Bảng giá vật liệu và máy móc',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'chose', 'price', 'dateUpdate'],
    group: 'Quản Lý kinh doanh',
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
              name: 'chose',
              label: 'chọn vật liệu hay máy móc',
              type: 'radio',
              options: [
                { label: 'Vật liệu', value: 'material' },
                { label: 'Máy móc', value: 'machine' },
              ],
              defaultValue: 'material',
            },
            {
              name: 'materialName',
              label: 'Tên nguyên vật liệu',
              type: 'relationship',
              relationTo: 'materials',
              admin: {
                allowCreate: false,
                condition: (data) => {
                  if (data.chose === 'material') {
                    return true
                  }
                  return false
                },
              },
              filterOptions: async ({ data, req }) => {
                if (!data) return false
                const findMaterial = await req.payload.find({
                  collection: 'materialAndMachinePrice',
                })
                const showMaterial = findMaterial.docs
                  .map((dt) => {
                    const name =
                      typeof dt.materialName === 'object' && dt.materialName !== null
                        ? dt.materialName.id
                        : dt.materialName
                    return name
                  })
                  .filter((pc) => pc !== data.materialName)
                return {
                  id: { not_in: showMaterial },
                }
              },
            },
            {
              name: 'machineName',
              label: 'Tên máy móc',
              type: 'relationship',
              relationTo: 'machine',
              admin: {
                allowCreate: false,
                condition: (data) => {
                  if (data.chose === 'machine') {
                    return true
                  }
                  return false
                },
              },
              filterOptions: async ({ data, req }) => {
                if (!data) return false
                const findMachine = await req.payload.find({
                  collection: 'materialAndMachinePrice',
                })
                const showMachine = findMachine.docs
                  .map((dt) => {
                    const name =
                      typeof dt.machineName === 'object' && dt.machineName !== null
                        ? dt.machineName.id
                        : dt.machineName
                    return name
                  })
                  .filter((pc) => pc !== data.machineName)
                return {
                  id: { not_in: showMachine },
                }
              },
            },
            {
              name: 'price',
              label: 'giá nhà cung cấp',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'supplier',
                  label: 'Nhà cung cấp',
                  type: 'relationship',
                  relationTo: 'Suppliers',
                  admin: {
                    allowCreate: false,
                  },
                  filterOptions: async ({ data, req }) => {
                    if (!data) return false
                    if (data.chose === 'material') {
                      const findMaterial = await req.payload.findByID({
                        collection: 'materials',
                        id: data.materialName,
                      })
                      const showSuppliers = findMaterial.supplier?.docs?.flatMap((dt) =>
                        typeof dt === 'object' && dt !== null ? dt.id : dt,
                      )
                      return {
                        id: { in: showSuppliers },
                      } as any
                    }
                    if (data.chose === 'machine') {
                      const findMachine = await req.payload.findByID({
                        collection: 'machine',
                        id: data.machineName,
                      })
                      const showSuppliers = findMachine.suppliers?.docs?.map((dt) =>
                        typeof dt === 'object' && dt !== null ? dt.id : dt,
                      )
                      return {
                        id: { in: showSuppliers },
                      } as any
                    }
                    return false
                  },
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
                    condition: (data) => {
                      if (data.chose === 'material') {
                        return true
                      }
                      return false
                    },
                  },
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
                    condition: (data) => {
                      if (data.chose === 'machine') {
                        return true
                      }
                      return false
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'price',
                      label: 'Giá nhập',
                      type: 'text',
                    },
                    {
                      name: 'typePrice',
                      label: 'Loại tiền',
                      type: 'select',
                      options: [
                        { label: 'VND', value: 'VND' },
                        { label: 'USD', value: 'USD' },
                      ],
                      defaultValue: 'VND',
                    },
                  ],
                },
              ],
            },
            {
              name: 'dateUpdate',
              label: 'Ngày cập nhật giá',
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
                      name: 'supplier',
                      label: 'Nhà cung cấp',
                      type: 'relationship',
                      relationTo: 'Suppliers',
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
                        condition: (data) => {
                          if (data.chose === 'material') {
                            return true
                          }
                          return false
                        },
                      },
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
                        condition: (data) => {
                          if (data.chose === 'machine') {
                            return true
                          }
                          return false
                        },
                      },
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
    beforeChange: [showTitle, changeTypePrice, trackPriceHistory],
    beforeValidate: [notChange],
    afterRead: [formatPrice],
  },
}
