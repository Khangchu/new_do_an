/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from 'payload'

export const produce: Field = {
  name: 'produce',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'produce1',
      type: 'array',
      fields: [
        {
          name: 'sanpham',
          label: 'Sản phẩm',
          type: 'relationship',
          relationTo: 'products',
          admin: {
            condition: (data) => {
              if (!data.inventoryProduce) return false
              return true
            },
          },
          filterOptions: async ({ data, req }) => {
            if (data.inventoryProduce) {
              const inventory = await req.payload.findByID({
                collection: 'Products_Inventory',
                id: data.inventoryProduce,
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
            readOnly: true,
          },
        },
        {
          name: 'totalProduc',
          label: 'Thành tiền',
          type: 'text',
          admin: {
            condition: (data, siblingData) => !!siblingData.totalProduc,
            readOnly: true,
          },
        },
        {
          name: 'rate',
          label: 'Tiền ',
          type: 'text',
          admin: {
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
}
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
            condition: (data) => !!data.inventory,
          },
          filterOptions: async ({ data, req }) => {
            if (data.inventory) {
              const inventory = await req.payload.findByID({
                collection: 'MaterialsAndMachine_Inventory',
                id: data.inventory,
              })
              const checkout = inventory.material?.flatMap((dt: any) => dt.materialName.id)
              return {
                id: { in: checkout },
              }
            }
            return false
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
            if (materialData.materialsName) {
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
            }
            return false
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
            condition: (data) => !!data.inventory,
          },
          filterOptions: async ({ data, req }) => {
            if (data.inventory) {
              const inventory = await req.payload.findByID({
                collection: 'MaterialsAndMachine_Inventory',
                id: data.inventory,
              })
              const checkout = inventory.machine?.flatMap((dt: any) => dt.machineName.id)
              return {
                id: { in: checkout },
              }
            }
            return false
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
            if (machineData.machinesName) {
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
            }
            return false
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
export const report: Field = {
  name: 'report',
  label: '',
  type: 'group',
  admin: { description: 'Thống kê vật liệu đã nhập' },
  fields: [
    {
      name: 'total',
      label: 'Sản phẩm',
      type: 'array',
      admin: {
        readOnly: true,
        description: 'Thống kê sản phẩm đã xuất',
        initCollapsed: false,
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
      admin: { description: 'Thống kê vật liệu đã nhập', readOnly: true, initCollapsed: false },
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
      admin: { description: 'Thống kê máy moc đã nhập', readOnly: true, initCollapsed: false },
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
    {
      name: 'payType',
      label: 'Hình thức thanh toán',
      type: 'select',
      options: [
        { label: 'Tiền mặt', value: 'tienmat' },
        { label: 'Chuyển khoản', value: 'chuyenkhoan' },
      ],
    },
  ],
}
