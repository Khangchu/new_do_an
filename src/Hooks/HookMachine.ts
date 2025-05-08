/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'
import {
  APIError,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const checkValue: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    nameMachine: 'Tên máy',
    machineType: 'Loại máy',
    origin: 'Xuất xứ',
    yearOfManufacture: 'Năm sản xuất',
    dateUser: 'Ngày đưa vào sử dụng',
    'tsMachine.capacity': 'Công suất',
    'tsMachine.voltage': 'Điện áp',
    'tsMachine.dimension': 'Kích thước',
    'tsMachine.function': 'Chức năng chính',
    'tsMachine.velocity': 'Tốc độ vận hành',
    'tsMachine.power': 'Mức tiêu thụ năng lượng',
    'maintenance.cycle': 'Chu kỳ',
    'maintenance.employee': 'Người phụ trách bảo trì',
    'performance.averagePerformance': 'Hiệu suất trung bình',
    'regulation.operatingInstructions': 'Hướng dẫn vận hành',
    'regulation.safetyRequirements': 'Yêu cầu an toàn',
    'regulation.suly': 'Biện pháp xử lý khi có sự cố',
  }
  const error1: string[] = []
  const errorCount = new Map<string, number>()

  data.performance.incidents.forEach((dt: any, index: number) => {
    const key = dt.id
    let count = errorCount.get(key) || 0
    if (!dt.nameIncidents || !dt.cause) {
      count++
    }
    errorCount.set(key, count)

    if (count > 0) {
      const message = `sự cố  ${index + 1} thiếu thông tin`
      if (!error.includes(message)) {
        error.push(message)
      }
    }
  })
  if (error1.length > 0) {
    throw new APIError(`Lỗi sự cố : ${error1.join(', ')}`, 400)
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
export const dateMaintenance: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return
  if (operation === 'create') {
    if (!data?.maintenance?.lastCycle) {
      data.maintenance.lastCycle = data.dateUser
    }
    if (data?.maintenance?.cycle && data?.maintenance?.lastCycle) {
      const nextDate = new Date(data.maintenance.lastCycle)
      if (data.maintenance.cycle === 'hangthang') {
        nextDate.setMonth(nextDate.getMonth() + 1)
      } else if (data.maintenance.cycle === 'hangquy') {
        nextDate.setMonth(nextDate.getMonth() + 3)
      } else if (data.maintenance.cycle === 'hangnam') {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
      }
      data.maintenance.nextCycle = nextDate.toDateString()
    }
    return data
  }
  if (operation === 'update') {
    const { cycle, lastCycle } = data.maintenance
    if (lastCycle) {
      const nextDate = new Date(lastCycle)
      if (cycle === 'hangthang') {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      if (cycle === 'hangquy') {
        nextDate.setMonth(nextDate.getMonth() + 3)
      }
      if (cycle === 'hangnam') {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
      }
      data.maintenance.nextCycle = nextDate.toDateString()
    }
    return data
  }
}
export const date: CollectionAfterReadHook = ({ doc }) => {
  if (!doc.maintenance) return
  const { cycle, lastCycle, nextCycle } = doc.maintenance
  const today = new Date()
  if (lastCycle && nextCycle) {
    const newNextCycle = new Date(nextCycle)
    if (newNextCycle <= today) {
      doc.maintenance.lastCycle = doc.maintenance.nextCycle
      if (cycle === 'hangthang') {
        newNextCycle.setMonth(newNextCycle.getMonth() + 1)
      }
      if (cycle === 'hangquy') {
        newNextCycle.setMonth(newNextCycle.getMonth() + 3)
      }
      if (cycle === 'hangnam') {
        newNextCycle.setFullYear(newNextCycle.getFullYear() + 1)
      }
      doc.maintenance.nextCycle = newNextCycle.toISOString()
      doc.performance.status = 'fix'
    }
  }
}
export const randomId: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return
  if (!data.machineId) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.machineId = `MC${numberOnly.substring(0, 10)}`
  }
  return data
}
export const canReadMachine: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
  const referer = (await headers()).get('referer')
  const isFromMedicalRecodsAdmin = referer?.includes('/admin/collections/factories') || false
  if (isFromMedicalRecodsAdmin) {
    return true
  }
  if (user.role === 'admin') return true
  if (
    user.employee?.typeDepartment === 'business' ||
    user.employee?.typeDepartment === 'productDevelopment' ||
    user.employee?.typeDepartment === 'warehouse'
  )
    return true
  return false
}
export const canUpdateCreateDeleteMachine: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'productDevelopment') return true
  return false
}
