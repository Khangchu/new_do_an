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
            },
            {
              name: 'inventoryProduce',
              label: 'Kho hàng',
              type: 'relationship',
              relationTo: 'Products_Inventory',
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
              name: 'employee',
              label: 'Người nhận hàng',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'voucherMaker',
              label: 'Người lập phiếu',
              type: 'relationship',
              relationTo: 'users',
            },
          ],
        },
        {
          label: 'Sản phẩm',
          fields: [produce],
        },
        {
          label: 'Vật liệu',
          fields: [materials],
        },
        {
          label: 'Máy móc',
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
    beforeValidate: [rondomID, showTitle, checkInfo, checkTime, checkSoluong],
    afterRead: [totalPrice, showReport, reportTotalPrice],
    beforeChange: [showPrice],
    afterChange: [setUpdateSoluong],
  },
}
