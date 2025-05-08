/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionConfig } from 'payload'
import {
  showTitle,
  generateFactoryId,
  preventDuplicateProductionAreas,
  noUndefindArena,
  noEmptyProductionStats,
  checkInfo,
  canRead,
  canUpdate,
} from '@/Hooks/HookFactoties'
import { accessAdmin } from '@/access/accessAll'
export const Factories: CollectionConfig = {
  slug: 'factories',
  labels: {
    singular: 'Nhà Máy',
    plural: 'Nhà Máy',
  },
  access: {
    read: canRead,
    delete: accessAdmin,
    create: accessAdmin,
    update: canUpdate,
  },
  admin: {
    useAsTitle: 'idf',
    defaultColumns: ['title', 'idf', 'regionFactory', 'managerFactory'],
    group: 'Quản lý sản xuất',
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
      name: 'idf',
      label: 'Mã Nhà Máy',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'regionFactory',
      label: 'Khu vực',
      type: 'select',
      options: [
        { label: 'Miền Bắc', value: 'north' },
        { label: 'Miền Trung', value: 'central' },
        { label: 'Miền Nam', value: 'south' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'managerFactory',
      label: 'Người Quản Lý',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin chung',
          fields: [
            {
              name: 'info',
              label: 'Thông tin cơ bản',
              type: 'group',
              fields: [
                {
                  name: 'idFactory',
                  label: 'Mã Nhà Máy',
                  type: 'text',
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                  admin: {
                    readOnly: true,
                    condition: (data) => !!data.idFactory,
                  },
                },
                {
                  name: 'name',
                  label: 'Tên Nhà Máy',
                  type: 'text',
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                },
                {
                  name: 'location',
                  label: 'Địa Chỉ',
                  type: 'text',
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                },
                {
                  name: 'region',
                  label: 'Khu vực',
                  type: 'select',
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                  options: [
                    { label: 'Miền Bắc', value: 'north' },
                    { label: 'Miền Trung', value: 'central' },
                    { label: 'Miền Nam', value: 'south' },
                  ],
                },
                {
                  name: 'department',
                  label: 'Phòng Ban Quản lý',
                  type: 'relationship',
                  relationTo: 'department',
                  hasMany: true,
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                  admin: {
                    allowCreate: false,
                  },
                  filterOptions: async ({ data, req, siblingData }) => {
                    if (!data) return false
                    const myID = siblingData as { department: string[] }
                    const findFactory = await req.payload.find({
                      collection: 'factories',
                    })
                    const departmentId = findFactory.docs.flatMap((factory) => {
                      return (
                        factory?.info?.department?.flatMap((department) =>
                          typeof department === 'object' ? department.id : department,
                        ) || []
                      )
                    })
                    return {
                      typeDepartment: { equals: 'production' },
                      or: [
                        { id: { not_in: departmentId !== undefined ? departmentId : [] } },
                        { id: { in: myID.department } },
                      ],
                    }
                  },
                },
                {
                  name: 'manager',
                  label: 'Người Quản Lý',
                  type: 'relationship',
                  relationTo: 'users',
                  admin: {
                    allowCreate: false,
                    allowEdit: true,
                  },
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                  filterOptions: async ({ data, req }) => {
                    if (!data) return false
                    if (!data?.info?.department) return false
                    const findUser = await req.payload.find({
                      collection: 'department',
                      where: {
                        id: { in: data.info.department },
                      },
                    })
                    const showManager = [
                      ...new Set(
                        findUser.docs.map((user) => {
                          const managerId =
                            typeof user.manager === 'object' ? user.manager?.id : user.manager
                          return managerId
                        }),
                      ),
                    ]
                    return {
                      id: { in: showManager !== undefined ? showManager : null },
                    }
                  },
                },
                {
                  name: 'phone',
                  label: 'Số điện thoại',
                  type: 'number',
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  access: {
                    update: ({ req }) => !!accessAdmin({ req }),
                  },
                },
              ],
            },

            {
              name: 'workingTime',
              label: 'Thời gian hoạt động',
              type: 'group',
              access: {
                update: ({ req }) => !!accessAdmin({ req }),
              },
              fields: [
                {
                  name: 'start',
                  label: 'Giờ bắt đầu',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'timeOnly',
                    },
                  },
                },
                {
                  name: 'end',
                  label: 'Giờ kết thúc',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'timeOnly',
                    },
                  },
                },
              ],
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
                  name: 'typeArea',
                  label: 'Loại Khu Vực',
                  type: 'select',
                  options: [
                    { label: 'Khu cắt vải ', value: 'cutting' },
                    { label: 'Khu may', value: 'sewing' },
                    { label: 'Khu hoàn thiện', value: 'finishing' },
                    { label: 'Khu đóng gói', value: 'packaging' },
                    { label: 'Khu kiểm hàng', value: 'qualityControl' },
                    { label: 'Khu in/ép nhiệt', value: 'printing' },
                    { label: 'Khu thêu', value: 'embroidery' },
                    { label: 'Khu đúc khuôn', value: 'molding' },
                    { label: 'Khu lắp ráp', value: 'assembly' },
                    { label: 'Khu kiểm tra chất lượng', value: 'qualityCheck' },
                    { label: 'Khu gia công', value: 'processing' },
                  ],
                },
                {
                  name: 'areaCore',
                  label: 'Khu vực ',
                  type: 'array',
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
                      admin: {
                        allowCreate: false,
                        allowEdit: false,
                      },
                      filterOptions: async ({ data, req, siblingData }) => {
                        if (!data?.info?.department) return false

                        const id = siblingData as { supervisor: string }
                        const supervisorId: string[] = []

                        if (Array.isArray(data.productionAreas)) {
                          for (const area of data.productionAreas) {
                            if (Array.isArray(area.areaCore)) {
                              for (const core of area.areaCore) {
                                if (core?.supervisor) {
                                  supervisorId.push(core.supervisor)
                                }
                              }
                            }
                          }
                        }

                        const findUser = await req.payload.find({
                          collection: 'department',
                          where: {
                            id: { in: data.info.department },
                          },
                        })

                        const showManager = findUser.docs.flatMap((user) => {
                          const managerId =
                            typeof user.Os_Field?.manager === 'object'
                              ? user.Os_Field.manager?.id
                              : user.Os_Field?.manager
                          return managerId
                        })

                        const show = showManager
                          .filter((manager): manager is string => manager !== undefined)
                          .filter((manager) => !supervisorId.includes(manager))

                        return {
                          or: [
                            { id: { in: show.length ? show : [] } },
                            { id: { equals: id.supervisor } },
                          ],
                        }
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'maxWorkers',
                          label: 'Số lượng công nhân tối đa',
                          type: 'number',
                        },
                        {
                          name: 'soluongWorker',
                          label: 'Số lượng công nhân hiện tại',
                          type: 'number',
                        },
                      ],
                    },
                    {
                      name: 'employee',
                      label: 'Công nhân',
                      type: 'relationship',
                      relationTo: 'users',
                      hasMany: true,
                      admin: {
                        allowCreate: false,
                        allowEdit: false,
                      },
                      filterOptions: async ({ data, req, siblingData }) => {
                        if (!data?.info?.department) return false

                        const { supervisor } = siblingData as { supervisor: string }
                        const { maxWorkers } = siblingData as { maxWorkers: number }
                        const { employee } = siblingData as { employee: string[] }

                        if (!supervisor) return false

                        const employeeId: string[] = []
                        const ID: string[] = []

                        if (Array.isArray(data.productionAreas)) {
                          for (const area of data.productionAreas) {
                            if (Array.isArray(area.areaCore)) {
                              for (const core of area.areaCore) {
                                if (core?.employee) {
                                  employeeId.push(core.employee)
                                }
                              }
                            }
                          }
                        }

                        const findUser = await req.payload.find({
                          collection: 'department',
                          where: {
                            id: { in: data.info.department },
                            'Os_Field.manager': { equals: supervisor },
                          },
                        })

                        const employeePool = findUser.docs.flatMap((dt) =>
                          dt.Os_Field?.employees?.flatMap((pc) =>
                            typeof pc === 'object' ? pc?.id : pc,
                          ),
                        )
                        const show = employeePool.filter((e) => e && !employeeId.includes(e))
                        if (employee) {
                          if (employee.length > maxWorkers && show.length > 0) {
                            return false
                          }
                        }
                        ID.push(...show.filter((item): item is string => item !== undefined))
                        const orFilters = []
                        if (ID.length > 0) {
                          orFilters.push({ id: { in: ID } })
                        }
                        if (Array.isArray(employee) && employee.length > 0) {
                          orFilters.push({ id: { in: employee } })
                        }
                        if (orFilters.length === 0) return false
                        return {
                          or: orFilters,
                        }
                      },
                    },
                    {
                      name: 'workShifts',
                      label: 'Ca làm việc',
                      type: 'array',
                      fields: [
                        {
                          name: 'shiftName',
                          label: 'Tên Ca',
                          type: 'text',
                        },
                        {
                          name: 'start',
                          label: 'Bắt đầu',
                          type: 'date',
                          admin: {
                            date: {
                              pickerAppearance: 'timeOnly',
                            },
                          },
                        },
                        {
                          name: 'end',
                          label: 'Kết thúc',
                          type: 'date',
                          admin: {
                            date: {
                              pickerAppearance: 'timeOnly',
                            },
                          },
                        },
                      ],
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
          ],
        },
        {
          label: 'Thống kê sản lượng',
          fields: [
            {
              name: 'productionStats',
              label: 'Thống Kê Sản Xuất',
              type: 'array',
              labels: {
                singular: 'Thống kê',
                plural: 'Các thống kê',
              },
              fields: [
                {
                  name: 'product',
                  label: 'Sản Phẩm',
                  type: 'relationship',
                  relationTo: 'products',
                  filterOptions: ({ data, siblingData }) => {
                    if (!data) return false
                    const siblingProductID = siblingData as { product: string }
                    const productIDList = data.productionStats?.flatMap((dt: any) => dt.product)
                    return {
                      or: [
                        { id: { not_in: productIDList } },
                        { id: { equals: siblingProductID.product } },
                      ],
                    }
                  },
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
                    placeholder: 'Chọn ngày sản xuất',
                  },
                },
                {
                  name: 'dailyOutput',
                  label: 'Sản Lượng Trong Ngày',
                  type: 'array',
                  fields: [
                    {
                      name: 'soluong',
                      label: 'Số lượng',
                      type: 'number',
                      min: 0,
                      admin: {
                        placeholder: 'Nhập số lượng',
                      },
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
              ],
            },
          ],
        },
        {
          label: 'Kho hàng',
          fields: [
            {
              name: 'producInventory',
              label: 'Kho sản phẩm',
              type: 'join',
              collection: 'Products_Inventory',
              on: 'factories',
              admin: {
                allowCreate: false,
              },
            },
            {
              name: 'materialAndMachineInventory',
              label: 'kho vật liệu và máy móc',
              type: 'join',
              collection: 'MaterialsAndMachine_Inventory',
              on: 'factories',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      showTitle,
      generateFactoryId,
      preventDuplicateProductionAreas,
      noUndefindArena,
      noEmptyProductionStats,
      checkInfo,
    ],
  },
}

export default Factories
