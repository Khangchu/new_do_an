import { CollectionConfig } from 'payload'

export const Factories: CollectionConfig = {
  slug: 'factories',
  labels: {
    singular: 'Nhà Máy',
    plural: 'Nhà Máy',
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      hidden: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin chung',
          fields: [
            {
              name: 'name',
              label: 'Tên Nhà Máy',
              type: 'text',
            },
            {
              name: 'location',
              label: 'Địa Chỉ',
              type: 'text',
            },
            {
              name: 'manager',
              label: 'Người Quản Lý',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'phone',
              label: 'Số điện thoại',
              type: 'number',
            },
          ],
        },
        {
          label: 'Khu Vực Sản Xuất',
          fields: [
            {
              name: 'productionAreas',
              label: 'Khu Vực Sản Xuất',
              type: 'array',
              labels: {
                singular: 'Khu Vực',
                plural: 'Các Khu Vực',
              },
              fields: [
                {
                  name: 'areaName',
                  label: 'Tên Khu Vực',
                  type: 'text',
                },
                {
                  name: 'supervisor',
                  label: 'Người Phụ Trách',
                  type: 'relationship',
                  relationTo: 'users',
                },
                {
                  name: 'employee',
                  label: 'Công nhân',
                  type: 'relationship',
                  relationTo: 'users',
                  hasMany: true,
                },
                {
                  name: 'machines',
                  label: 'Máy Móc',
                  type: 'array',
                  fields: [
                    {
                      name: 'machineName',
                      label: 'Tên Máy',
                      type: 'relationship',
                      relationTo: 'machine',
                    },
                    {
                      name: 'status',
                      label: 'Trạng Thái',
                      type: 'select',
                      options: [
                        { label: 'Hoạt động', value: 'active' },
                        { label: 'Bảo trì', value: 'maintenance' },
                        { label: 'Hỏng', value: 'broken' },
                      ],
                      defaultValue: 'active',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Thống kê sản lượng',
          fields: [
            {
              name: 'productionStats',
              label: 'Thống Kê Sản Xuất',
              type: 'array',
              fields: [
                {
                  name: 'product',
                  label: 'Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                },
                {
                  name: 'dailyOutput',
                  label: 'Sản Lượng 1 Ngày',
                  type: 'array',
                  fields: [
                    {
                      name: 'soluong',
                      label: 'Sản Lượng 1 Ngày',
                      type: 'number',
                    },
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
                  ],
                },
                {
                  name: 'date',
                  label: 'Ngày Sản Xuất',
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
          ],
        },
        {
          label: 'Kho hàng',
          fields: [
            { name: 'producInventory', label: 'Kho sản phẩm', type: 'text' },
            {
              name: 'materialAndMachineInventory',
              label: 'kho vật liệu và máy móc',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}

export default Factories
