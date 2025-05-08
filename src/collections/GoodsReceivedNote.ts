import { CollectionConfig } from 'payload'
import {
  rondomID,
  showPrice,
  showTitle,
  totalPrice,
  setUpdateSoluong,
  showReport,
  reportTotalPrice,
  checkSoluong,
  checkTime,
  checkInfo,
  autoEmployee,
  canRead,
  canUpdate,
} from '@/Hooks/HookGoodsReceivedNote'
import { materials, machine, report, produce } from '@/fields/Fields_GoodsReceiveNote'
export const goodsReceivedNote: CollectionConfig = {
  slug: 'goodsReceiveNote',
  labels: {
    singular: 'Nhập Kho',
    plural: 'Nhập Kho',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Quản lý Kho hàng',
    defaultColumns: ['goodsReceivedNoteId', 'chose', 'date', 'voucherMaker'],
  },
  access: {
    read: canRead,
    delete: canUpdate,
    create: canUpdate,
    update: canUpdate,
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
          label: 'Thông Tin Phiếu Nhập',
          fields: [
            {
              name: 'chose',
              label: 'Loại nhập',
              type: 'select',
              options: [
                { label: 'sản phẩm', value: 'sanpham' },
                { label: 'vật liệu và máy moc', value: 'vatlieuvamaymoc' },
              ],
            },
            {
              name: 'goodsReceivedNoteId',
              label: 'Mã phiếu nhập',
              type: 'text',
              admin: {
                readOnly: true,
                condition: (data) => !!data.goodsReceivedNoteId,
              },
            },
            {
              name: 'inventory',
              label: 'Kho hàng',
              type: 'relationship',
              relationTo: 'MaterialsAndMachine_Inventory',
              admin: {
                allowCreate: false,
                condition: (data) => data.chose === 'vatlieuvamaymoc',
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
              name: 'inventoryProduce',
              label: 'Kho hàng',
              type: 'relationship',
              relationTo: 'Products_Inventory',
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
                return {
                  id: {
                    in:
                      find.docs.map((dt) => dt.id).length !== 0
                        ? find.docs.map((dt) => dt.id)
                        : null,
                  },
                }
              },
              admin: {
                allowCreate: false,
                condition: (data) => data.chose === 'sanpham',
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
        },
        {
          label: 'Sản phẩm',
          admin: {
            condition: (data) => data.chose === 'sanpham',
          },
          fields: [produce],
        },
        {
          label: 'Vật liệu',
          admin: {
            condition: (data) => data.chose === 'vatlieuvamaymoc',
          },
          fields: [materials],
        },
        {
          label: 'Máy móc',
          admin: {
            condition: (data) => data.chose === 'vatlieuvamaymoc',
          },
          fields: [machine],
        },
        {
          label: 'Báo cáo',
          fields: [report],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [rondomID, showTitle, checkInfo, checkTime, checkSoluong, autoEmployee],
    afterRead: [totalPrice, showReport, reportTotalPrice],
    beforeChange: [showPrice],
    afterChange: [setUpdateSoluong],
  },
}
