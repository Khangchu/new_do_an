import { CollectionConfig } from 'payload'
import { tsMachine, maintenance, performance, regulation } from '@/fields/Fields_Machine'
import { checkValue, dateMaintenance, date } from '@/Hooks/HookMachine'

export const machine: CollectionConfig = {
  slug: 'machine',
  labels: {
    singular: 'Máy móc',
    plural: 'Máy móc',
  },
  admin: {
    useAsTitle: 'nameMachine',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin chung',
          fields: [
            {
              name: 'nameMachine',
              label: 'Tên máy',
              type: 'text',
            },
            {
              name: 'machineId',
              label: 'Mã máy',
              type: 'text',
              admin: {
                condition: (data) => {
                  if (!data?.machineId) return false
                  return true
                },
              },
            },
            {
              name: 'machineType',
              label: 'Loại máy',
              type: 'select',
              options: [
                { label: 'Máy dệt', value: 'maydet' },
                { label: 'máy cắt vải', value: 'maycatvai' },
                { label: 'máy in logo', value: 'mayinlogo' },
                { label: 'máy ép nhiệt', value: 'mayepnhiet' },
                { label: 'máy may', value: 'maymay' },
              ],
            },
            {
              name: 'suppliers',
              label: 'Nhà cung cấp',
              type: 'join',
              collection: 'Suppliers',
              on: 'importedMachine',
            },
            {
              name: 'origin',
              label: 'Xuất xứ',
              type: 'text',
            },
            {
              name: 'yearOfManufacture',
              label: 'Năm sản xuất',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'monthOnly',
                  displayFormat: 'yyyy',
                },
              },
            },
            {
              name: 'dateUser',
              label: 'Ngày đưa vào sử dụng',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              name: 'install',
              label: 'Vị trí lắp đặt',
              type: 'text',
            },
          ],
        },
        {
          label: 'Thông số kỹ thuật',
          fields: [tsMachine],
        },
        {
          label: 'Lịch bảo trì & Bảo dưỡng',
          fields: [maintenance],
        },
        {
          label: 'Hiệu suất & Tình trạng hoạt động',
          fields: [performance],
        },
        {
          label: 'Quy định sử dụng & An toàn lao động',
          fields: [regulation],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [checkValue],
    beforeValidate: [dateMaintenance],
    afterRead: [date],
  },
}
