/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from 'payload'

export const Os_Field: Field = {
  name: 'Os_Field',
  label: '',
  type: 'group',
  fields: [
    {
      name: 'manager',
      type: 'relationship',
      label: 'Trưởng phòng',
      relationTo: 'users',
      filterOptions: async ({ req, data, siblingData }) => {
        const id: string[] = []
        const idManager = siblingData as { manager?: string }

        const department = await req.payload.find({
          collection: 'department',
        })

        department.docs.forEach((doc) => {
          const mng = doc.Os_Field?.manager
          if (mng) {
            id.push(typeof mng === 'object' && mng !== null ? mng.id : mng)
          }
        })

        const baseFilter: any = {
          'employee.statusWork': { equals: 'working' },
          'employee.position': { equals: 'manager' },
          'employee.typeDepartment': { equals: data.typeDepartment },
        }

        if (idManager?.manager) {
          baseFilter.or = [{ id: { not_in: id } }, { id: { equals: idManager.manager } }]
        } else {
          baseFilter.id = { not_in: id }
        }

        return baseFilter
      },
    },
    {
      name: 'deputyManager',
      type: 'relationship',
      label: 'Phó phòng (nếu có)',
      relationTo: 'users',
      filterOptions: async ({ req, data, siblingData }) => {
        const id: string[] = []

        const idDeputyManager = siblingData as { deputyManager?: string[] }

        const department = await req.payload.find({
          collection: 'department',
        })

        department.docs.forEach((doc) => {
          const dm = doc.Os_Field?.deputyManager
          if (dm) {
            id.push(typeof dm === 'object' && dm !== null ? dm.id : dm)
          }
        })
        const baseFilter: any = {
          'employee.statusWork': { equals: 'working' },
          'employee.position': { equals: 'deputyManager' },
          'employee.typeDepartment': { equals: data.typeDepartment },
        }
        if (idDeputyManager?.deputyManager) {
          baseFilter.or = [
            { id: { not_in: id } },
            { id: { equals: idDeputyManager.deputyManager } },
          ]
        } else {
          baseFilter.id = { not_in: id }
        }

        return baseFilter
      },
    },
    {
      name: 'employees',
      type: 'relationship',
      label: 'Nhân viên',
      relationTo: 'users',
      hasMany: true,
      filterOptions: async ({ req, data, siblingData }) => {
        const idEmployee = siblingData as { employees?: string[] }
        const id: string[] = []

        const department = await req.payload.find({
          collection: 'department',
        })

        department.docs.forEach((doc) => {
          doc.Os_Field?.employees?.forEach((emp) => {
            if (typeof emp === 'object' && emp !== null) {
              id.push(emp.id)
            } else if (typeof emp === 'string') {
              id.push(emp)
            }
          })
        })

        const baseFilter: any = {
          'employee.statusWork': { equals: 'working' },
          'employee.position': { equals: 'employees' },
          'employee.typeDepartment': { equals: data.typeDepartment },
        }

        if (idEmployee?.employees && idEmployee.employees.length > 0) {
          baseFilter.or = [{ id: { not_in: id } }, { id: { in: idEmployee.employees } }]
        } else {
          baseFilter.id = { not_in: id }
        }

        return baseFilter
      },
    },
  ],
}
