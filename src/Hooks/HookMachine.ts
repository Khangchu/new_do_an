import {
  APIError,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
} from 'payload'

export const checkValue: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    nameMachine: 'Tên máy',
    machineType: 'Loại máy',
    origin: 'Xuất xứ',
    yearOfManufacture: 'Năm sản xuất',
    dateUser: 'Ngày đưa vào sử dụng',
    install: 'Vị trí lắp đặt',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(',')}`, 400)
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
