import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  beforeValidate,
  beforeChange,
  changeUniti,
  checkValueEmty,
  canReadMaterial,
  canUpdateCreateDeleteMaterial,
} from '@/Hooks/HookMaterials'

export const Materials: CollectionConfig = {
  slug: 'materials',
  labels: {
    singular: 'Vật Liệu',
    plural: 'Vật Liệu',
  },
  admin: {
    useAsTitle: 'materialsName',
    defaultColumns: ['materialsID', 'materialsName', 'materialstype', 'supplier'],
    group: 'Quản lý vật liệu và máy móc',
  },
  access: {
    read: canReadMaterial,
    update: canUpdateCreateDeleteMaterial,
    delete: canUpdateCreateDeleteMaterial,
    create: canUpdateCreateDeleteMaterial,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'materialsID',
              label: 'Mã Vật Liệu',
              type: 'text',
              admin: {
                readOnly: true,
                condition: (data) => {
                  if (!data.materialsID) return false
                  return true
                },
              },
            },
            {
              name: 'materialsName',
              label: 'Tên Vật Liệu',
              type: 'text',
            },
            {
              name: 'materialstype',
              label: 'Loại vật liệu',
              type: 'select',
              options: [
                { label: 'Kim loại', value: 'kimloai' },
                { label: 'Nhựa', value: 'nhua' },
                { label: 'Gỗ', value: 'go' },
                { label: 'Vải', value: 'vai' },
              ],
            },
            {
              name: 'supplier',
              label: 'Nhà Cung Cấp',
              type: 'join',
              collection: 'Suppliers',
              on: 'Imported materials',
            },
            {
              name: 'Origin',
              label: 'Xuất xứ',
              type: 'text',
            },
          ],
          label: 'Thông tin chung',
        },
        {
          fields: [
            {
              name: 'Dimension',
              label: 'Kích thước',
              labels: {
                singular: 'Kích thước',
                plural: 'Kích thước',
              },
              admin: {
                initCollapsed: false,
              },
              type: 'array',
              fields: [
                { name: 'Length', label: 'Chiều dài', type: 'text' },
                { name: 'Width', label: 'Chiều rộng', type: 'text' },
                { name: 'Thickness', label: 'Độ dày', type: 'text' },
              ],
            },
            {
              name: 'specificvolume',
              label: 'Khối lượng riêng',
              type: 'array',
              labels: {
                singular: 'Khối lượng riêng',
                plural: 'Khối lượng riêng',
              },
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'Massspecific',
                      label: 'Khối lượng',
                      type: 'number',
                    },
                    {
                      name: 'Unitspecific',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { label: 'g/cm³', value: 'g/cm³' },
                        { label: 'kg/m³', value: 'kg/m³' },
                      ],
                      defaultValue: 'kg/m³',
                    },
                    {
                      name: 'previousspecific',
                      type: 'text',
                      admin: { hidden: true },
                    },
                  ],
                },
              ],
            },
            {
              name: 'tensilestrength',
              label: 'Độ bền kéo',
              type: 'array',
              labels: {
                singular: 'Độ bền kéo',
                plural: 'Độ bền kéo',
              },
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'Masstensile',
                      label: 'Khối lượng',
                      type: 'number',
                    },
                    {
                      name: 'Unittensile',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { label: 'MPa', value: 'MPa' },
                        { label: 'N/mm²', value: 'N/mm²' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'compressivestrength',
              label: 'Độ bền nén',
              type: 'array',
              admin: {
                initCollapsed: false,
              },
              labels: {
                singular: 'Độ bền nén',
                plural: 'Độ bền nén',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'Masscompressive',
                      label: 'Khối lượng',
                      type: 'number',
                    },
                    {
                      name: 'Unitcompressive',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { label: 'MPa', value: 'MPa' },
                        { label: 'N/mm²', value: 'N/mm²' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'temperaturetolerance',
              label: 'Nhiệt độ chịu đựng',
              type: 'array',
              admin: {
                initCollapsed: false,
              },
              labels: {
                singular: 'Nhiệt độ chịu đựng',
                plural: 'Nhiệt độ chịu đựng',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'Masstemperaturetolerance',
                      label: 'Nhiệt độ ',
                      type: 'number',
                    },
                    {
                      name: 'Unittemperaturetolerance',
                      label: 'Đơn vị',
                      type: 'select',
                      options: [
                        { label: '°C', value: '°C' },
                        { label: 'K', value: 'K' },
                      ],
                      defaultValue: '°C',
                    },
                    {
                      name: 'previoustemperaturetolerance',
                      type: 'text',
                      admin: { hidden: true },
                    },
                  ],
                },
              ],
            },
            {
              name: 'color',
              label: 'Màu Sắc',
              type: 'relationship',
              relationTo: 'colors',
              hasMany: true,
            },
          ],
          label: 'Đặc tính kỹ thuật',
        },
        {
          fields: [
            {
              name: 'qualitystandards',
              label: 'Tiêu chuẩn chất lượng',
              labels: {
                singular: 'Tiêu chuẩn chất lượng',
                plural: 'Tiêu chuẩn chất lượng',
              },
              admin: {
                initCollapsed: false,
              },
              type: 'array',
              fields: [
                {
                  name: 'nameCertificate',
                  label: 'Tên chững chỉ',
                  type: 'text',
                },
                {
                  name: 'img',
                  label: 'Minh chứng',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'Note',
                  label: 'Ghi chú',
                  type: 'textarea',
                },
              ],
            },
            {
              name: 'safetycertification',
              label: 'Chứng nhận an toàn',
              type: 'array',
              admin: {
                initCollapsed: false,
              },
              labels: {
                singular: 'Chứng nhận an toàn',
                plural: 'Chứng nhận an toàn',
              },
              fields: [
                {
                  name: 'nameCertificate',
                  label: 'Chứng nhận an toàn',
                  type: 'text',
                },
                {
                  name: 'img',
                  label: 'Minh chứng',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'Note',
                  label: 'Ghi chú',
                  type: 'textarea',
                },
              ],
            },
          ],
          label: 'Tiêu chuẩn & Chứng nhận',
        },
        {
          fields: [
            {
              name: 'products',
              label: 'Sản Phẩm',
              type: 'join',
              collection: 'products',
              on: 'material',
            },
          ],
          label: 'Ứng dụng',
        },
        {
          fields: [
            {
              name: 'tonkho',
              label: 'Tồn Kho',
              type: 'join',
              collection: 'MaterialsAndMachine_Inventory',
              on: 'material.materialName',
              admin: {
                allowCreate: false,
              },
            },
          ],
          label: 'Kho',
        },
        {
          fields: [
            {
              name: 'note',
              label: '',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                  ]
                },
              }),
            },
          ],
          label: 'Ghi chú khác',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [beforeChange, changeUniti],
    beforeValidate: [beforeValidate, checkValueEmty],
  },
}
