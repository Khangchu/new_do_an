import { APIError, CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'
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
