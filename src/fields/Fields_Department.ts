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
        const siblingDataId = siblingData as { manager: string } | undefined
        const id = []
        const department = await req.payload.find({
          collection: 'department',
        })
        department.docs.forEach((doc) => {
          if (doc.Os_Field?.manager) {
            id.push(
              typeof doc.Os_Field?.manager === 'object' && doc.Os_Field?.manager !== null
                ? doc.Os_Field?.manager?.id
                : doc.Os_Field?.manager,
            )
          }
          if (doc.Os_Field?.employees) {
            doc.Os_Field?.employees.forEach((emp) => {
              if (typeof emp === 'object' && emp !== null) {
                id.push(emp.id)
              }
            })
          }
          if (doc.Os_Field?.deputyManager) {
            id.push(
              typeof doc.Os_Field?.deputyManager === 'object' &&
                doc.Os_Field?.deputyManager !== null
                ? doc.Os_Field?.deputyManager?.id
                : doc.Os_Field?.deputyManager,
            )
          }
        })
        if (data?.Os_Field?.manager) {
          id.push(data?.Os_Field?.manager)
        }
        if (data?.Os_Field?.deputyManager) {
          id.push(data?.Os_Field?.deputyManager)
        }
        if (data?.Os_Field?.employees) {
          data?.Os_Field?.employees.forEach((emp: any) => {
            if (typeof emp === 'object' && emp !== null) {
              id.push(emp.id)
            }
          })
        }
        return {
          or: [
            { id: { not_in: id !== undefined ? id : null } },
            { id: { equals: siblingDataId?.manager } },
          ],
        }
      },
    },
    {
      name: 'deputyManager',
      type: 'relationship',
      label: 'Phó phòng (nếu có)',
      relationTo: 'users',
      filterOptions: async ({ req, data, siblingData }) => {
        const siblingDataId = siblingData as { deputyManager: string } | undefined
        const id = []
        const department = await req.payload.find({
          collection: 'department',
        })
        department.docs.forEach((doc) => {
          if (doc.Os_Field?.manager) {
            id.push(
              typeof doc.Os_Field?.manager === 'object' && doc.Os_Field?.manager !== null
                ? doc.Os_Field?.manager?.id
                : doc.Os_Field?.manager,
            )
          }
          if (doc.Os_Field?.employees) {
            doc.Os_Field?.employees.forEach((emp) => {
              if (typeof emp === 'object' && emp !== null) {
                id.push(emp.id)
              }
            })
          }
          if (doc.Os_Field?.deputyManager) {
            id.push(
              typeof doc.Os_Field?.deputyManager === 'object' &&
                doc.Os_Field?.deputyManager !== null
                ? doc.Os_Field?.deputyManager?.id
                : doc.Os_Field?.deputyManager,
            )
          }
        })
        if (data?.Os_Field?.manager) {
          id.push(data?.Os_Field?.manager)
        }
        if (data?.Os_Field?.deputyManager) {
          id.push(data?.Os_Field?.deputyManager)
        }
        if (data?.Os_Field?.employees) {
          data?.Os_Field?.employees.forEach((emp: any) => {
            if (typeof emp === 'object' && emp !== null) {
              id.push(emp.id)
            }
          })
        }
        return {
          or: [
            { id: { not_in: id !== undefined ? id : null } },
            { id: { equals: siblingDataId?.deputyManager } },
          ],
        }
      },
    },
    {
      name: 'employees',
      type: 'relationship',
      label: 'Nhân viên',
      relationTo: 'users',
      hasMany: true,
      filterOptions: async ({ req, data, siblingData }) => {
        const siblingDataId = siblingData as { employees: string[] } | undefined
        const id = []
        const department = await req.payload.find({
          collection: 'department',
        })
        department.docs.forEach((doc) => {
          if (doc.Os_Field?.manager) {
            id.push(
              typeof doc.Os_Field?.manager === 'object' && doc.Os_Field?.manager !== null
                ? doc.Os_Field?.manager?.id
                : doc.Os_Field?.manager,
            )
          }
          if (doc.Os_Field?.employees) {
            doc.Os_Field?.employees.forEach((emp) => {
              if (typeof emp === 'object' && emp !== null) {
                id.push(emp.id)
              }
            })
          }
          if (doc.Os_Field?.deputyManager) {
            id.push(
              typeof doc.Os_Field?.deputyManager === 'object' &&
                doc.Os_Field?.deputyManager !== null
                ? doc.Os_Field?.deputyManager?.id
                : doc.Os_Field?.deputyManager,
            )
          }
        })
        if (data?.Os_Field?.manager) {
          id.push(data?.Os_Field?.manager)
        }
        if (data?.Os_Field?.deputyManager) {
          id.push(data?.Os_Field?.deputyManager)
        }
        if (data?.Os_Field?.employees) {
          data?.Os_Field?.employees.forEach((emp: any) => {
            if (typeof emp === 'object' && emp !== null) {
              id.push(emp.id)
            }
          })
        }
        return {
          or: [
            { id: { not_in: id !== undefined ? id : null } },
            { id: { in: siblingDataId?.employees } },
          ],
        }
      },
    },
  ],
}
