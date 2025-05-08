/* eslint-disable @typescript-eslint/no-explicit-any */
import { Access, APIError, CollectionBeforeValidateHook } from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const generateFactoryId: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data?.info?.idFactory) {
    data.info = {
      ...data.info,
      idFactory: `NM-${uuidv4().slice(0, 8).toUpperCase()}`,
    }
  }
  return data
}
export const showTitle: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (data.info.name) {
    data.title = data.info.name
  }
  if (data.info.idFactory) {
    data.idf = data.info.idFactory
  }
  if (data.info.region) {
    data.regionFactory = data.info.region
  }
  if (data.info.manager) {
    data.managerFactory = data.info.manager
  }
  return data
}
export const preventDuplicateProductionAreas: CollectionBeforeValidateHook = ({ data }) => {
  if (!data?.productionAreas) return data

  const options = [
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
  ]

  const find = new Map<string, number>()
  const duplicates: string[] = []

  data.productionAreas.forEach((area: any) => {
    const key = area?.typeArea
    if (!key) return
    const count = find.get(key) || 0
    find.set(key, count + 1)
  })

  find.forEach((count, key) => {
    if (count > 1) {
      const label = options.find((opt) => opt.value === key)?.label || key
      duplicates.push(label)
    }
  })

  if (duplicates.length > 0) {
    throw new APIError(`Khu vực bị trùng: ${duplicates.join(', ')}`, 400)
  }
  return data
}
export const noUndefindArena: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const find = new Map<string, number>()
  const duplicates: string[] = []

  data?.productionAreas.forEach((item: any, index: number) => {
    const key = item.id
    const count = find.get(key) || 0
    if (!item.typeArea) {
      find.set(key, count + 1)
    }
    item.areaCore.forEach((item1: any) => {
      console.log('run')
      if (
        !item1.areaName ||
        !item1.supervisor ||
        !item1.maxWorkers ||
        !item1.employee ||
        !item1.workShifts ||
        !item1.machines
      ) {
        find.set(key, count + 1)
        item1.workShifts.forEach((item2: any) => {
          if (!item2.shiftName || !item2.start || !item2.end) {
            find.set(key, count + 1)
          }
        })
        item1.machines.forEach((item3: any) => {
          if (!item3.machineName) {
            find.set(key, count + 1)
          }
        })
      }
    })
    find.forEach((count) => {
      console.log(count)
      if (count > 0) {
        if (!duplicates.includes(`Khu Vực ${index + 1} thiếu thông tin`)) {
          duplicates.push(`Khu Vực ${index + 1} thiếu thông tin`)
        }
      }
    })
  })
  if (duplicates.length > 0) {
    throw new APIError(`Lỗi để trống : ${duplicates.join(', ')}`, 400)
  }
  return data
}
export const noEmptyProductionStats: CollectionBeforeValidateHook = ({ data }) => {
  if (!data || !Array.isArray(data.productionStats)) return data

  const find = new Map<string, number>()
  const duplicates: string[] = []

  data.productionStats.forEach((stat: any, index: number) => {
    const key = stat?.id || `stat-${index}`
    let count = find.get(key) || 0

    if (!stat.product) count++
    if (!stat.date) count++

    if (!Array.isArray(stat.dailyOutput) || stat.dailyOutput.length === 0) {
      count++
    } else {
      stat.dailyOutput.forEach((output: any) => {
        if (output.soluong === undefined || output.soluong === null || !output.unit) {
          count++
        }
      })
    }

    find.set(key, count)

    if (count > 0) {
      const message = `Thống kê ${index + 1} thiếu thông tin`
      if (!duplicates.includes(message)) {
        duplicates.push(message)
      }
    }
  })
  if (data)
    if (duplicates.length > 0) {
      throw new APIError(`Lỗi thống kê sản xuất: ${duplicates.join(', ')}`, 400)
    }

  return data
}
export const checkInfo: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    idFactory: 'Mã Nhà Máy',
    name: 'Tên Nhà Máy',
    location: 'Địa Chỉ',
    region: 'Khu vực',
    department: 'Phòng Ban Quản lý',
    manager: 'Người Quản Lý',
    phone: 'Số điện thoại',
    email: 'email',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data.info[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
  if (data.productionAreas.length === 0) {
    throw new APIError('Không được để trống Khu vực sản xuất', 400)
  }
  if (data.productionStats.length === 0) {
    throw new APIError('Không được để trống thống kê ', 400)
  }
}
export const canRead: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (
    user.employee?.position === 'deputyManager' ||
    user.employee?.position === 'employees' ||
    user.employee?.position === 'manager'
  ) {
    const idDepartment =
      typeof user.employee?.department === 'object' && user.employee?.department !== null
        ? user.employee?.department.id
        : user.employee?.department
    const find = await req.payload.find({
      collection: 'factories',
      where: {
        'info.department': { in: idDepartment },
      },
    })
    if (find.docs.length > 0) {
      const idFactory = find.docs[0].id
      if (idFactory) {
        return {
          id: { in: idFactory },
        }
      }
    }
  }
  if (user.employee?.position === 'director') {
    const idFactory: string[] = []
    const idDepartment = user.employee.regionalManagement?.docs?.map((dt) =>
      typeof dt === 'object' && dt !== null ? dt.id : dt,
    )
    const find = await req.payload.find({
      collection: 'factories',
      where: {
        'info.department': { in: idDepartment },
      },
    })
    find.docs.forEach((dt) => {
      idFactory.push(dt.id)
    })
    return {
      id: { in: idFactory },
    }
  }
  return false
}
export const canUpdate: Access = async ({ req, data }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (data?.managerFactory === user.id) {
    return true
  }
  return false
}
