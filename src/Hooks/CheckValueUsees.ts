/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'
import {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionBeforeLoginHook,
  AuthenticationError,
  APIError,
  CollectionAfterChangeHook,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const CheckValueUsers: CollectionBeforeChangeHook = async ({ data, req, originalDoc }) => {
  const error: string[] = []
  const errorDuplicate: string[] = []

  const { ID, phone } = data
  if (originalDoc.ID !== ID) {
    const checkID = await req.payload.find({
      collection: 'users',
      where: { ID: { equals: ID } },
    })
    if (checkID.docs.length > 0) {
      errorDuplicate.push('Căn cước công dân bị trùng')
    }
  }
  if (originalDoc.phone !== phone) {
    const checkPhone = await req.payload.find({
      collection: 'users',
      where: { phone: { equals: phone } },
    })
    if (checkPhone.docs.length > 0) {
      errorDuplicate.push('Số điện thoại bị trùng')
    }
  }

  if (errorDuplicate.length > 0) {
    throw new APIError(
      `Lỗi trùng giá trị:${errorDuplicate.map((err, index) => `${index + 1}. ${err}`).join('\n')}`,
      400,
    )
  }
  if (!ID) {
    error.push('khong duoc de trong ID')
  }
  if (!data.fullName) {
    error.push('Họ và tên')
  }
  if (!data.sex) {
    error.push('Giới tính')
  }
  if (!data.ID) {
    error.push('Căn cước công dân')
  }
  if (!data.Date_of_birth) {
    error.push('Ngày sinh')
  }
  if (!data.address) {
    error.push('Địa chỉ')
  }
  if (!data.phone) {
    error.push('Số điện thoại')
  }
  const throwError = error.map((err) => err).join(',')
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${throwError}`, 400)
  }
  const birthDate = new Date(data.Date_of_birth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const dayDiff = today.getDate() - birthDate.getDate()
  if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
    throw new APIError('Bạn phải đủ 18 tuổi', 400)
  }
}
export const BeforeValidateUser: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data.userID) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.userID = `NS${numberOnly.substring(0, 10)}`
  }
  return data
}
export const BeforeLoginUser: CollectionBeforeLoginHook = async ({ user }) => {
  if (user.status === 'approved') {
    throw new AuthenticationError(() => 'Tài khoản của bạn đã bị khóa bởi quản trị viên')
  }
}
export const checkValueDegree: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const error: string[] = []
  const errorCount = new Map<string, number>()

  data.hocvan.degree.forEach((dt: any, index: number) => {
    const key = dt.id
    let count = errorCount.get(key) || 0
    if (!dt.Namedegree || !dt.university || !dt.specialization || !dt.img) {
      count++
    }
    errorCount.set(key, count)

    if (count > 0) {
      const message = `Bằng cấp ${index + 1} thiếu thông tin`
      if (!error.includes(message)) {
        error.push(message)
      }
    }
  })
  if (error.length > 0) {
    throw new APIError(`Lỗi bằng cấp: ${error.join(', ')}`, 400)
  }
}
export const checkValueCertificate: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const error: string[] = []
  const errorCount = new Map<string, number>()

  data.hocvan.Certificate.forEach((dt: any, index: number) => {
    const key = dt.id
    let count = errorCount.get(key) || 0
    if (!dt.nameCertificate || !dt.img) {
      count++
    }
    errorCount.set(key, count)

    if (count > 0) {
      const message = `chứng chỉ ${index + 1} thiếu thông tin`
      if (!error.includes(message)) {
        error.push(message)
      }
    }
  })
  if (error.length > 0) {
    throw new APIError(`Lỗi chứng chỉ: ${error.join(', ')}`, 400)
  }
}
export const employeeOut: CollectionAfterChangeHook = async ({ req, doc, operation }) => {
  if (req.context?.skipUserHook) return
  if (operation === 'update') {
    if (doc.employee.statusWork === 'working') return doc
    const find = await req.payload.find({
      collection: 'users',
      where: {
        userID: { equals: doc.userID },
      },
    })
    const regionalManagement = find.docs.flatMap((dt) => dt.employee?.regionalManagement?.docs)
    if (doc.employee.position === 'director') {
      for (const item of regionalManagement) {
        const idDepartment =
          typeof item === 'object' && typeof item.id === 'string' && item.id.length === 24
            ? item.id
            : typeof item === 'string' && item.length === 24
              ? item
              : null

        if (idDepartment) {
          try {
            await req.payload.update({
              collection: 'department',
              id: idDepartment,
              data: {
                manager: null, // reset về null đúng chuẩn MongoDB
              },
              context: {
                skipDepartmentHook: true,
              },
            })
          } catch (err) {
            console.error(`❌ Error updating department ID ${idDepartment}:`, err)
          }
        } else {
          console.warn('⚠️ Skipped invalid department reference:', item)
        }
      }
    }
    if (doc.employee.department) {
      const findDepartment = await req.payload.findByID({
        collection: 'department',
        id: doc.employee.department,
      })
      const idManager =
        typeof findDepartment.Os_Field?.manager === 'object' &&
        findDepartment.Os_Field?.manager !== null
          ? findDepartment.Os_Field?.manager.userID
          : findDepartment.Os_Field?.manager
      const idDepartment =
        typeof findDepartment.Os_Field?.deputyManager === 'object' &&
        findDepartment.Os_Field?.deputyManager !== null
          ? findDepartment.Os_Field?.deputyManager.userID
          : findDepartment.Os_Field?.deputyManager
      const manager =
        typeof findDepartment.Os_Field?.manager === 'object' &&
        findDepartment.Os_Field?.manager !== null
          ? findDepartment.Os_Field?.manager.id
          : findDepartment.Os_Field?.manager
      const Department =
        typeof findDepartment.Os_Field?.deputyManager === 'object' &&
        findDepartment.Os_Field?.deputyManager !== null
          ? findDepartment.Os_Field?.deputyManager.id
          : findDepartment.Os_Field?.deputyManager
      const newEmPloyee = findDepartment.Os_Field?.employees
        ?.filter((dt) => {
          const idEmplayee = typeof dt === 'object' ? dt.userID : dt
          return idEmplayee !== doc.userID
        })
        .map((dt) => (typeof dt === 'object' ? dt.id : dt))
      await req.payload.update({
        collection: 'department',
        id: doc.employee.department,
        data: {
          Os_Field: {
            manager: idManager === doc.userID ? null : manager,
            deputyManager: idDepartment === doc.userID ? null : Department,
            employees: newEmPloyee,
          },
        },
        context: {
          skipDepartmentHook: true,
        },
      })
    }
  }
}
export const canReadUser: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
  const referer = (await headers()).get('referer')
  const isFromMedicalRecodsAdmin = referer?.includes('/admin/collections/department') || false
  if (isFromMedicalRecodsAdmin) {
    return true
  }
  if (user.role === 'admin') return true
  if (
    user.employee?.position === 'manager' ||
    user.employee?.position === 'deputyManager' ||
    user.employee?.position === 'employees'
  ) {
    if (user.employee.department) {
      const department: string[] = []
      try {
        const find = await req.payload.findByID({
          collection: 'department',
          id:
            typeof user.employee.department === 'object'
              ? (user.employee.department?.id ?? '')
              : (user.employee.department ?? ''),
        })
        if (!find) {
          return {
            id: { equals: user.id },
          }
        }
        if (find) {
          const idDirector =
            typeof find.manager === 'object' && find.manager !== null
              ? find.manager.id
              : find.manager
          const idManager =
            typeof find.Os_Field?.manager === 'object' && find.Os_Field?.manager !== null
              ? find.Os_Field?.manager.id
              : find.Os_Field?.manager
          const idDeputyManager =
            typeof find.Os_Field?.deputyManager === 'object' &&
            find.Os_Field?.deputyManager !== null
              ? find.Os_Field?.deputyManager.id
              : find.Os_Field?.deputyManager
          find.Os_Field?.employees?.forEach((dt) => {
            const idEmployee = typeof dt === 'object' && dt !== null ? dt.id : dt
            department.push(idEmployee)
          })
          if (idDirector) {
            department.push(idDirector)
          }
          if (idDeputyManager) {
            department.push(idDeputyManager)
          }
          if (idManager) {
            department.push(idManager)
          }
        }
        return {
          id: { in: department },
        }
      } catch (error) {
        console.error('Error fetching department data:', error)
        return {
          id: { equals: user.id },
        }
      }
    } else {
      return {
        id: { equals: user.id },
      }
    }
  }
  if (user.employee?.position === 'director') {
    if ((user.employee.regionalManagement?.docs ?? []).length > 0) {
      const idDepartment: string[] = []
      const id: string[] = []
      user.employee.regionalManagement?.docs?.forEach((dt) => {
        const id = typeof dt === 'object' && dt !== null ? dt.id : dt
        idDepartment.push(id)
      })
      for (const item of idDepartment) {
        const find = await req.payload.findByID({
          collection: 'department',
          id: item,
        })
        const idDirector =
          typeof find.manager === 'object' && find.manager !== null ? find.manager.id : find.manager
        const idManager =
          typeof find.Os_Field?.manager === 'object' && find.Os_Field?.manager !== null
            ? find.Os_Field?.manager.id
            : find.Os_Field?.manager
        const idDeputyManager =
          typeof find.Os_Field?.deputyManager === 'object' && find.Os_Field?.deputyManager !== null
            ? find.Os_Field?.deputyManager.id
            : find.Os_Field?.deputyManager
        find.Os_Field?.employees?.forEach((dt) => {
          const idEmployee = typeof dt === 'object' && dt !== null ? dt.id : dt
          id.push(idEmployee)
        })
        if (idDirector) {
          id.push(idDirector)
        }
        if (idDeputyManager) {
          id.push(idDeputyManager)
        }
        if (idManager) {
          id.push(idManager)
        }
      }
      return {
        id: { in: id },
      }
    } else {
      return {
        id: { equals: user.id },
      }
    }
  }
  return {
    id: { equals: user.id },
  }
}
export const canUpdateUser: Access = ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.role === 'admin') return true
  return {
    id: {
      equals: user.id,
    },
  }
}
