/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from 'payload'

export const materials: Field = {
  name: 'materials',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'materialsProduce',
      label: '',
      type: 'array',
      fields: [
        {
          name: 'materialsName',
          label: 'Tên vật liệu',
          type: 'relationship',
          relationTo: 'materials',
          admin: {
            condition: (data) => !!data.inventoryM,
          },
          filterOptions: async ({ data, req }) => {
            if (!data.inventoryM) return false
            const inventory = await req.payload.findByID({
              collection: 'MaterialsAndMachine_Inventory',
              id: data.inventoryM,
            })
            const checkout = inventory.material?.flatMap((dt: any) => dt.materialName.id)
            return {
              id: { in: checkout },
            }
          },
        },
        {
          name: 'suppliersMaterials',
          label: 'Nhà cung cấp',
          type: 'relationship',
          relationTo: 'Suppliers',
          admin: {
            condition: (data, siblingData) => !!siblingData.materialsName,
          },
          filterOptions: async ({ req, siblingData }) => {
            const materialData = siblingData as { materialsName?: string }
            if (!materialData.materialsName) return true
            const showMaterial = await req.payload.findByID({
              collection: 'materials',
              id: materialData.materialsName,
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
        },
        {
          type: 'row',
          fields: [
            {
              name: 'soluongMaterials',
              label: 'Số lượng',
              type: 'number',
              admin: {
                condition: (data, siblingData) => !!siblingData.materialsName,
              },
            },
            {
              name: 'unitsMaterials',
              label: 'Đơn Vị Tính',
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
                condition: (data, siblingData) => !!siblingData.materialsName,
              },
            },
          ],
        },
        {
          name: 'priceMaterials',
          label: 'Giá nhập',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => !!siblingData.priceMaterials,
          },
        },
        {
          name: 'totalMaterials',
          label: 'Thành tiền',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => !!siblingData.totalMaterials,
          },
        },
        {
          name: 'typePriceMaterials',
          label: 'Loại tiền',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => !!siblingData.typePriceMaterials,
          },
        },
        {
          name: 'noteMaterial',
          label: 'Ghi chú',
          type: 'textarea',
        },
      ],
    },
  ],
}
export const machine: Field = {
  name: 'machine',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'machinesProduce',
      label: '',
      type: 'array',
      fields: [
        {
          name: 'machinesName',
          label: 'Tên vật liệu',
          type: 'relationship',
          relationTo: 'machine',
          admin: {
            condition: (data) => !!data.inventoryM,
          },
          filterOptions: async ({ data, req }) => {
            if (!data.inventoryM) return false
            const inventory = await req.payload.findByID({
              collection: 'MaterialsAndMachine_Inventory',
              id: data.inventoryM,
            })
            const checkout = inventory.machine?.flatMap((dt: any) => dt.machineName.id)
            return {
              id: { in: checkout },
            }
          },
        },
        {
          name: 'suppliersMachines',
          label: 'Nhà cung cấp',
          type: 'relationship',
          relationTo: 'Suppliers',
          admin: {
            condition: (data, siblingData) => !!siblingData.machinesName,
          },
          filterOptions: async ({ req, siblingData }) => {
            const machineData = siblingData as { machinesName?: string }
            if (!machineData.machinesName) return true
            const showMaterial = await req.payload.findByID({
              collection: 'machine',
              id: machineData.machinesName,
            })
            if (
              !showMaterial ||
              !showMaterial.suppliers ||
              showMaterial.suppliers.docs?.length === 0
            ) {
              return false
            }
            return {
              id: {
                in: showMaterial.suppliers.docs?.map((supplier: any) => supplier.id),
              },
            }
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'soluongMachines',
              label: 'Số lượng',
              type: 'number',
              admin: {
                condition: (data, siblingData) => !!siblingData.machinesName,
              },
            },
            {
              name: 'unitsMachines',
              label: 'Đơn Vị Tính',
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
                condition: (data, siblingData) => !!siblingData.machinesName,
              },
            },
          ],
        },
        {
          name: 'priceMachines',
          label: 'Giá nhập',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => !!siblingData.priceMachines,
          },
        },
        {
          name: 'totalMachines',
          label: 'Thành tiền',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => !!siblingData.totalMachines,
          },
        },
        {
          name: 'typePriceMachines',
          label: 'Loại tiền',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => !!siblingData.typePriceMachines,
          },
        },
        {
          name: 'noteMachines',
          label: 'Ghi chú',
          type: 'textarea',
        },
      ],
    },
  ],
}
