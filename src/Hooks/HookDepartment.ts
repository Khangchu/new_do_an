/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionBeforeValidateHook, CollectionBeforeChangeHook } from 'payload'

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
  console.log('check1 - Department ID:', departmentId)
  if (data?.Os_Field?.manager && departmentId) {
    const managerId = data.Os_Field.manager
    await req.payload.update({
      collection: 'users',
      id: managerId,
      data: {
        employee: {
          department: departmentId,
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
          department: departmentId,
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
            department: departmentId,
          },
        },
      })
    })
    await Promise.all(updatePromises)
  }
}
