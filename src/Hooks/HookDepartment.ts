/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionBeforeValidateHook, CollectionAfterChangeHook, APIError, Access } from 'payload'
export const beforeValidate: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data.idDepartment) {
    data.idDepartment = `ID-${Date.now()}${Math.floor(Math.random() * 10000)}`
  }
  data.title = `${data.idDepartment}-${data.nameDepartment || 'Unknown'}`
}
export const Change: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.skipDepartmentHook) return
  if (doc.idDepartment) {
    const departmentQuery = await req.payload.find({
      collection: 'department',
      where: { idDepartment: { equals: doc.idDepartment } },
    })
    const departmentId = departmentQuery.docs.length > 0 ? departmentQuery.docs[0].id : null
    if (doc?.Os_Field?.manager && departmentId) {
      const managerId = doc.Os_Field.manager

      await req.payload.update({
        collection: 'users',
        id: managerId,
        data: {
          employee: {
            department: departmentId,
          },
        },
        context: { skipUserHook: true },
      })
    }
    if (doc?.Os_Field?.deputyManager && departmentId) {
      const deputyManagerID = doc.Os_Field.deputyManager
      await req.payload.update({
        collection: 'users',
        id: deputyManagerID,
        data: {
          employee: {
            department: departmentId,
          },
        },
        context: { skipUserHook: true },
      })
    }
    if (doc?.Os_Field?.employees && departmentId) {
      const employeesIDs = doc.Os_Field.employees
      const updatePromises = employeesIDs.map(async (employeeId: any) => {
        return req.payload.update({
          collection: 'users',
          id: employeeId,
          data: {
            employee: {
              department: departmentId,
            },
          },
          context: { skipUserHook: true },
        })
      })
      await Promise.all(updatePromises)
    }
  }
}
export const afterDelete: CollectionAfterChangeHook = async ({
  doc,
  req,
  previousDoc,
  operation,
}) => {
  if (req.context?.skipDepartmentHook) return
  if (operation === 'update') {
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
                department: null,
              },
            },
            context: { skipUserHook: true },
          })
        }
      }
    }
    if (previousDoc?.Os_Field?.deputyManager && departmentId) {
      if (previousDoc?.Os_Field?.deputyManager !== doc?.Os_Field?.deputyManager) {
        const deputyManagerID = previousDoc.Os_Field.deputyManager
        if (deputyManagerID) {
          await req.payload.update({
            collection: 'users',
            id: deputyManagerID,
            data: {
              employee: {
                department: null,
              },
            },
            context: { skipUserHook: true },
          })
        }
      }
    }
    if (previousDoc?.Os_Field?.employees && departmentId) {
      if (previousDoc?.Os_Field?.employees !== doc?.Os_Field?.employees) {
        const employeesIDs = previousDoc.Os_Field.employees
        if (employeesIDs) {
          const updateEmployee = employeesIDs
            .filter((id: any) => id && !doc?.Os_Field?.employees.includes(id))
            .map(async (id: any) => {
              return req.payload.update({
                collection: 'users',
                id: id,
                data: {
                  employee: {
                    department: null,
                  },
                },
                context: { skipUserHook: true },
              })
            })
          await Promise.all(updateEmployee)
          console.log(updateEmployee)
        }
      }
    }
  }
}
export const noEmtyValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    typeDepartment: 'Loại phòng ban',
    nameDepartment: 'Tên phòng ban',
    establishedDate: 'Ngày thành lập',
    'Os_Field.manager': 'Trưởng phòng',
    'Os_Field.deputyManager': 'Phó phòng',
    'Os_Field.employees': 'Nhân viên',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => {
      const value = key.split('.').reduce((obj, keyPart) => obj?.[keyPart], data)
      return value === undefined || value === null || (Array.isArray(value) && value.length === 0)
    })
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
}
export const canReadDepartment: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.department || (user.employee?.regionalManagement?.docs ?? []).length > 0) {
    return {
      typeDepartment: { equals: user.employee?.typeDepartment },
    }
  }
  return false
}
export const canUpdateDepartment: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.position === 'director') {
    return true
  }
  return false
}
