/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionConfig } from 'payload'
import {
  showTitle,
  notChange,
  formatPrice,
  changeTypePrice,
} from '@/Hooks/HookMaterialAndMachinePrices'

export const MaterialPrices: CollectionConfig = {
  slug: 'materialAndMachinePrice',
  labels: {
    singular: 'Bảng giá nguyên vật liệu và máy móc',
    plural: 'Bảng giá nguyên vật liệu và máy móc',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'chose', 'price', 'dateUpdate'],
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
      name: 'chose',
      label: '',
      type: 'radio',
      options: [
        { label: 'Vật liệu', value: 'material' },
        { label: 'Máy móc', value: 'machine' },
      ],
    },
    {
      name: 'materialName',
      label: 'Tên nguyên vật liệu',
      type: 'relationship',
      relationTo: 'materials',
      admin: {
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
      fields: [
        {
          name: 'supplier',
          label: 'Nhà cung cấp',
          type: 'relationship',
          relationTo: 'Suppliers',
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
  hooks: {
    beforeChange: [showTitle, changeTypePrice],
    beforeValidate: [notChange],
    afterRead: [formatPrice],
  },
}
