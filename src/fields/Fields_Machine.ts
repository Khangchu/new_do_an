import { Field } from 'payload'

export const tsMachine: Field = {
  name: 'tsMachine',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'capacity',
      label: 'Công suất',
      type: 'text',
    },
    {
      name: 'voltage',
      label: 'Điện áp',
      type: 'text',
    },
    {
      name: 'dimension',
      label: 'Kích thước',
      type: 'text',
    },
    {
      name: 'function',
      label: 'Chức năng chính',
      type: 'textarea',
    },
    {
      name: 'velocity',
      label: 'Tốc độ vận hành',
      type: 'text',
    },
    {
      name: 'power',
      label: 'Mức tiêu thụ năng lượng',
      type: 'text',
    },
  ],
}

export const maintenance: Field = {
  name: 'maintenance',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'cycle',
      label: 'Chu kỳ',
      type: 'select',
      options: [
        { label: 'Hàng tháng', value: 'hangthang' },
        { label: 'Hàng quý', value: 'hangquy' },
        { label: 'Hàng năm', value: 'hangnam' },
      ],
    },
    {
      name: 'lastCycle',
      label: 'Lần bảo trì gần nhất',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        readOnly: true,
      },
    },
    {
      name: 'nextCycle',
      label: 'Lần bảo trì tiếp theo',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        readOnly: true,
      },
    },
    {
      name: 'employee',
      label: 'Người phụ trách bảo trì',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: async ({ req }) => {
        const checkEmployee = await req.payload.find({
          collection: 'department',
          where: {
            id: { equals: '67ac4c7e0b03840aa5beaa7a' },
          },
        })
        const pickEmployee = checkEmployee.docs.flatMap((ep) =>
          ep.Os_Field?.employees?.map((employee) =>
            typeof employee === 'object' && 'id' in employee ? employee.id : employee,
          ),
        )
        return {
          id: { in: pickEmployee },
        }
      },
    },
  ],
}

export const performance: Field = {
  name: 'performance',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'status',
      label: 'Tình trạng hiện tại',
      type: 'select',
      options: [
        { label: 'Đang hoạt động', value: 'active' },
        { label: 'Tạm ngừng', value: 'pause' },
        { label: 'Sửa chữa', value: 'fix' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'averagePerformance',
      label: 'Hiệu suất trung bình',
      type: 'text',
    },
    {
      name: 'incidents',
      label: 'Các sự cố đã gặp',
      type: 'array',
      fields: [
        {
          name: 'nameIncidents',
          label: 'Tên sự cố',
          type: 'text',
        },
        {
          name: 'cause',
          label: 'nguyên nhân',
          type: 'textarea',
        },
      ],
    },
  ],
}

export const regulation: Field = {
  name: 'regulation',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'operatingInstructions',
      label: 'Hướng dẫn vận hành',
      type: 'textarea',
    },
    {
      name: 'safetyRequirements',
      label: 'Yêu cầu an toàn',
      type: 'textarea',
    },
    {
      name: 'employee',
      label: 'Người được phép vận hành',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'suly',
      label: 'Biện pháp xử lý khi có sự cố',
      type: 'textarea',
    },
  ],
}
