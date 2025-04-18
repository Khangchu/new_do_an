/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeValidateHook,
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
} from 'payload'

export const beforeValidate: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data.idDepartment) {
    data.idDepartment = `ID-${Date.now()}${Math.floor(Math.random() * 10000)}`
  }
  data.title = `${data.idDepartment}-${data.nameDepartment || 'Unknown'}`
}
export const beforeChange: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return
  const departmentQuery = await req.payload.find({
    collection: 'department',
    where: { idDepartment: { equals: data.idDepartment } },
  })
  const departmentId = departmentQuery.docs.length > 0 ? departmentQuery.docs[0].id : null
  if (data?.Os_Field?.manager && departmentId) {
    const managerId = data.Os_Field.manager
    await req.payload.update({
      collection: 'users',
      id: managerId,
      data: {
        employee: {
          department: departmentId,
          position: 'manager',
          typeDepartment: data.typeDepartment,
        },
      },
    })
  }
  if (data?.Os_Field?.deputyManager && departmentId) {
    const deputyManagerID = data.Os_Field.deputyManager
    await req.payload.update({
      collection: 'users',
      id: deputyManagerID,
      data: {
        employee: {
          position: 'deputyManager',
          department: departmentId,
          typeDepartment: data.typeDepartment,
        },
      },
    })
  }
  if (data?.Os_Field?.employees && departmentId) {
    const employeesIDs = data.Os_Field.employees
    const updatePromises = employeesIDs.map(async (employeeId: any) => {
      return req.payload.update({
        collection: 'users',
        id: employeeId,
        data: {
          employee: {
            position: 'employees',
            department: departmentId,
            typeDepartment: data.typeDepartment,
          },
        },
      })
    })
    await Promise.all(updatePromises)
  }
}
export const afterDelete: CollectionAfterChangeHook = async ({ doc, req, previousDoc }) => {
  const departmentQuery = await req.payload.find({
    collection: 'department',
    where: { idDepartment: { equals: doc.idDepartment } },
  })
  const departmentId = departmentQuery.docs.length > 0 ? departmentQuery.docs[0].id : null
  if (previousDoc?.Os_Field?.manager && departmentId) {
    if (previousDoc?.Os_Field?.manager !== doc?.Os_Field?.manager) {
      const managerId = previousDoc.Os_Field.manager
      if (managerId) {
        await req.payload.update({
          collection: 'users',
          id: managerId,
          data: {
            employee: {
              position: 'employees',
              department: null,
              typeDepartment: null,
            },
          },
        })
      }
    }
  }
  if (previousDoc?.Os_Field?.deputyManager && departmentId) {
    if (previousDoc?.Os_Field?.deputyManager !== doc?.Os_Field?.deputyManager) {
      console.log('Deleting manager:', previousDoc?.Os_Field?.deputyManager)
      const deputyManagerID = previousDoc.Os_Field.deputyManager
      if (deputyManagerID) {
        await req.payload.update({
          collection: 'users',
          id: deputyManagerID,
          data: {
            employee: {
              position: 'employees',
              department: null,
              typeDepartment: null,
            },
          },
        })
      }
    }
  }
  if (previousDoc?.Os_Field?.employees && departmentId) {
    if (previousDoc?.Os_Field?.employees !== doc?.Os_Field?.employees) {
      const employeesIDs = previousDoc.Os_Field.employees
      if (employeesIDs) {
        const updateEmployee = employeesIDs
          .filter((id: any) => id !== doc?.Os_Field?.employees)
          .map(async (id: any) => {
            return req.payload.update({
              collection: 'users',
              id: id,
              data: {
                employee: {
                  position: 'employees',
                  department: null,
                  typeDepartment: null,
                },
              },
            })
          })
        await Promise.all(updateEmployee)
      }
    }
  }
}
