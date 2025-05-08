import { CollectionConfig } from 'payload'
import { tsMachine, maintenance, performance, regulation } from '@/fields/Fields_Machine'
import {
  checkValue,
  dateMaintenance,
  date,
  randomId,
  canReadMachine,
  canUpdateCreateDeleteMachine,
} from '@/Hooks/HookMachine'

export const machine: CollectionConfig = {
  slug: 'machine',
  labels: {
    singular: 'Máy móc',
    plural: 'Máy móc',
  },

  admin: {
    useAsTitle: 'nameMachine',
    defaultColumns: ['machineId', 'nameMachine', 'machineType', 'suppliers'],
    group: 'Quản lý vật liệu và máy móc',
    hidden: ({ user }) => {
      if (!user) return true
      if (
        user?.employee?.typeDepartment === 'business' ||
        user?.employee?.typeDepartment === 'productDevelopment' ||
        user?.employee?.typeDepartment === 'warehouse'
      ) {
        return false
      }
      if (user.role === 'admin') return false
      return true
    },
  },
  access: {
    read: canReadMachine,
    update: canUpdateCreateDeleteMachine,
    delete: canUpdateCreateDeleteMachine,
    create: canUpdateCreateDeleteMachine,
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
              type: 'join',
              collection: 'factories',
              on: 'productionAreas.areaCore.machines.machineName',
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
        {
          label: 'Kho',
          fields: [
            {
              name: 'inventory',
              label: '',
              type: 'join',
              collection: 'MaterialsAndMachine_Inventory',
              on: 'machine.machineName',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [checkValue],
    beforeValidate: [randomId, dateMaintenance],
    afterRead: [date],
  },
}
