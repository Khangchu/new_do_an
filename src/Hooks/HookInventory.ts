/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'
import {
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
  APIError,
  CollectionBeforeChangeHook,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const showTitle: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return
  if (operation === 'create') {
    if (data.inventoryId) {
      data.title = data.inventoryId
    }
  }
}
export const rondomID: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return
  if (operation === 'create') {
    if (!data.inventoryId) {
      const numberOnly = uuidv4().replace(/\D/g, '')
      data.inventoryId = `NH${numberOnly.substring(0, 10)}`
    }
  }
}
export const totalPrice: CollectionAfterReadHook = ({ doc }) => {
  const convertToNumber = (str: any) => {
    if (str == null || str === '') return 0
    const numberValue = parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '.'))
    return isNaN(numberValue) ? 0 : numberValue
  }
  const formatNumber = (value: any) => {
    if (value == null || value === '') return '0'
    if (typeof value === 'number') {
      return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }).format(value)
    }
    const normalizedValue = value.toString().replace(/\./g, '').replace(/,/g, '.')
    const numberValue = parseFloat(normalizedValue)
    if (isNaN(numberValue)) return '0'
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    }).format(numberValue)
  }
  if (doc.material.length !== 0) {
    doc.material.forEach((dc: any) => {
      if (dc.soluongMaterial && dc.priceMaterial) {
        const totalPrice = convertToNumber(dc.priceMaterial) * dc.soluongMaterial
        dc.totalPriceMaterial = formatNumber(totalPrice)
      }
    })
  }
  if (doc.machine.length !== 0) {
    doc.machine.forEach((dc: any) => {
      if (dc.soluongMachine && dc.priceMachine) {
        const totalPrice = convertToNumber(dc.priceMachine) * dc.soluongMachine
        dc.totalPriceMachine = formatNumber(totalPrice)
      }
    })
  }
  if (doc.machine.length !== 0 || doc.material.length !== 0) {
    const totalValueMaterialUsd = doc.material
      .filter((dt: any) => dt.typePriceMaterial === 'USD')
      .flatMap((pc: any) => pc.totalPriceMaterial)
    const totalValueMaterialVnd = doc.material
      .filter((dt: any) => dt.typePriceMaterial === 'VND')
      .flatMap((pc: any) => pc.totalPriceMaterial)
    const totalMachineUsd = doc.machine
      .filter((dt: any) => dt.typePriceMachine === 'USD')
      .flatMap((pc: any) => pc.totalPriceMachine)
    const totalMachineVnd = doc.machine
      .filter((dt: any) => dt.typePriceMachine === 'VND')
      .flatMap((pc: any) => pc.totalPriceMachine)
    if (doc.rateValue === 'VND') {
      const totalMachines = [
        ...totalMachineVnd.map((value: any) => convertToNumber(value)),
        ...totalMachineUsd.map((value: any) => convertToNumber(value) * 25000),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalMaterials = [
        ...totalValueMaterialVnd.map((value: any) => convertToNumber(value)),
        ...totalValueMaterialUsd.map((value: any) => convertToNumber(value) * 25000),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValue = totalMachines + totalMaterials
      doc.totalValue = formatNumber(totalValue)
    }
    if (doc.rateValue === 'USD') {
      const totalMachines = [
        ...totalMachineVnd.map((value: any) => convertToNumber(value) / 25000),
        ...totalMachineUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalMaterials = [
        ...totalValueMaterialVnd.map((value: any) => convertToNumber(value) / 25000),
        ...totalValueMaterialUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValue = totalMachines + totalMaterials
      doc.totalValue = formatNumber(totalValue)
    }
  }
}
export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    inventoryName: 'Tên kho',
    location: 'Địa chỉchỉ',
    managerInventory: 'Phòng ban quản lý',
    phoneInventory: 'Số điện thoại',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
  if (data.material.length === 0 && data.machine.length === 0) {
    throw new APIError('Không được để trống cả 2 mục vật liệu và máy móc', 400)
  }
}
export const showPrice: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return
  if (operation === 'create') {
    for (const dc of data.material) {
      const findMaterial = await req.payload.find({
        collection: 'materialAndMachinePrice',
        where: {
          materialName: dc.materialName,
        },
      })
      findMaterial.docs
        .flatMap((dt) => dt.price)
        .forEach((pc) => {
          const supplierId =
            typeof pc?.supplier === 'object' && pc.supplier !== null ? pc.supplier.id : pc?.supplier
          if (dc.suppliersMaterial === supplierId && dc.unitMaterial === pc?.unitMaterial) {
            dc.priceMaterial = pc?.price
            dc.typePriceMaterial = pc?.typePrice
          }
        })
    }
    for (const dc of data.machine) {
      for (const pc of originalDoc.machine) {
        if (dc.id !== pc.id) {
          const findMaterial = await req.payload.find({
            collection: 'materialAndMachinePrice',
            where: {
              machineName: dc.machineName,
            },
          })
          findMaterial.docs
            .flatMap((dt) => dt.price)
            .forEach((pc) => {
              const supplierId =
                typeof pc?.supplier === 'object' && pc.supplier !== null
                  ? pc.supplier.id
                  : pc?.supplier
              if (dc.suppliersMachine === supplierId && dc.unitMachine === pc?.unitMachine) {
                dc.priceMachine = pc?.price
                dc.typePriceMachine = pc?.typePrice
              }
            })
        }
      }
    }
  }
  if (operation === 'update') {
    for (const dc of data.material) {
      const originalDocs = originalDoc.material.find((od: any) => od?.id === dc?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findMaterial = await req.payload.find({
          collection: 'materialAndMachinePrice',
          where: {
            materialName: dc.materialName,
          },
        })
        findMaterial.docs
          .flatMap((dt) => dt.price)
          .forEach((pc) => {
            const supplierId =
              typeof pc?.supplier === 'object' && pc.supplier !== null
                ? pc.supplier.id
                : pc?.supplier
            if (dc.suppliersMaterial === supplierId && dc.unitMaterial === pc?.unitMaterial) {
              dc.priceMaterial = pc?.price
              dc.typePriceMaterial = pc?.typePrice
            }
          })
      }
    }
    for (const dc of data.machine) {
      const originalDocs = originalDoc.machine.find((od: any) => od?.id === dc?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findMaterial = await req.payload.find({
          collection: 'materialAndMachinePrice',
          where: {
            machineName: dc.machineName,
          },
        })
        findMaterial.docs
          .flatMap((dt) => dt.price)
          .forEach((pc) => {
            const supplierId =
              typeof pc?.supplier === 'object' && pc.supplier !== null
                ? pc.supplier.id
                : pc?.supplier
            if (dc.suppliersMachine === supplierId && dc.unitMachine === pc?.unitMachine) {
              dc.priceMachine = pc?.price
              dc.typePriceMachine = pc?.typePrice
            }
          })
      }
    }
  }
}
export const changeTypePrice: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (operation === 'update') {
    const EXCHANGE_RATE = 25000
    const convertToNumber = (str: any) => {
      if (str == null || str === '') return 0
      const numberValue = parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '.'))
      return isNaN(numberValue) ? 0 : numberValue
    }
    const formatNumber = (value: any) => {
      if (value == null || value === '') return '0'
      if (typeof value === 'number') {
        return new Intl.NumberFormat('vi-VN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 10,
        }).format(value)
      }
      const normalizedValue = value.toString().replace(/\./g, '').replace(/,/g, '.')
      const numberValue = parseFloat(normalizedValue)
      if (isNaN(numberValue)) return '0'
      return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }).format(numberValue)
    }
    data.material.forEach((dc: any) => {
      originalDoc.material.forEach((pc: any) => {
        if (pc.id === dc.id) {
          if (dc.typePriceMaterial !== pc.typePriceMaterial) {
            if (dc.typePriceMaterial === 'VND' && pc.typePriceMaterial === 'USD') {
              const price = convertToNumber(dc.priceMaterial) * EXCHANGE_RATE
              const totalPrice = convertToNumber(dc.totalPriceMaterial) * EXCHANGE_RATE
              dc.totalPriceMaterial = formatNumber(totalPrice)
              dc.priceMaterial = formatNumber(price)
            }
            if (dc.typePriceMaterial === 'USD' && pc.typePriceMaterial === 'VND') {
              const price = convertToNumber(dc.priceMaterial) / EXCHANGE_RATE
              const totalPrice = convertToNumber(dc.totalPriceMaterial) / EXCHANGE_RATE
              dc.totalPriceMaterial = formatNumber(totalPrice)
              dc.priceMaterial = formatNumber(price)
            }
          }
        }
      })
    })
  }
}
export const noEmtyValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const error: string[] = []
  const errorCount = new Map<string, number>()
  if (data.material.length > 0) {
    console.log('run')
    data.material.forEach((dt: any, index: number) => {
      const key = dt.it
      let count = errorCount.get(key) || 0
      if (!dt.materialName || !dt.suppliersMaterial || !dt.soluongMaterial || !dt.unitMaterial) {
        count++
      }
      errorCount.set(key, count)
      if (count > 0) {
        const message = `vật liệu ${index + 1} thiếu thông tin`
        if (!error.includes(message)) {
          error.push(message)
        }
      }
    })
  }
  if (data.material.length > 0) {
    data.machine.forEach((dt: any, index: number) => {
      const key = dt.it
      let count = errorCount.get(key) || 0
      if (!dt.machineName || !dt.suppliersMachine || !dt.soluongMachine || !dt.unitMachine) {
        count++
      }
      errorCount.set(key, count)
      if (count > 0) {
        const message = `Máy móc ${index + 1} thiếu thông tin`
        if (!error.includes(message)) {
          error.push(message)
        }
      }
    })
  }
  if (error.length > 0) {
    throw new APIError(`Lỗi giá: ${error.join(', ')}`, 400)
  }
}
export const updateReport: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data) return data
  if (data.material.length !== 0) {
    const reportData: {
      [key: string]: {
        reportMaterialName: string
        report: { reportMaterialUnits: string; reportMaterialSoLuong: number }[]
      }
    } = {}
    data.material.forEach((dt: any) => {
      if (!dt.materialName || !dt.soluongMaterial || !dt.unitMaterial) return
      if (!reportData[dt.materialName]) {
        reportData[dt.materialName] = {
          reportMaterialName: dt.materialName,
          report: [],
        }
      }
      const existingUnit = reportData[dt.materialName].report.find(
        (r) => r.reportMaterialUnits === dt.unitMaterial,
      )
      if (existingUnit) {
        existingUnit.reportMaterialSoLuong += dt.soluongMaterial
      }
      reportData[dt.materialName].report.push({
        reportMaterialSoLuong: dt.soluongMaterial,
        reportMaterialUnits: dt.unitMaterial,
      })
    })
    data.reportMaterial = Object.values(reportData)
  }
  if (data.machine.length !== 0) {
    const reportData: {
      [key: string]: {
        reportMachinesName: string
        report: { reportMachinesUnits: string; reportMachinesSoLuong: number }[]
      }
    } = {}
    data.machine.forEach((dt: any) => {
      if (!dt.machineName || !dt.soluongMachine || !dt.unitMachine) return
      if (!reportData[dt.machineName]) {
        reportData[dt.machineName] = {
          reportMachinesName: dt.machineName,
          report: [],
        }
      }
      const existingUnit = reportData[dt.machineName].report.find(
        (r) => r.reportMachinesUnits === dt.unitMachine,
      )
      if (existingUnit) {
        existingUnit.reportMachinesSoLuong += dt.soluongMachine
      }
      reportData[dt.machineName].report.push({
        reportMachinesSoLuong: dt.soluongMachine,
        reportMachinesUnits: dt.unitMachine,
      })
    })
    data.reportMachines = Object.values(reportData)
  }
  return data
}
export const canReadInventory: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
  const referer = (await headers()).get('referer')
  const isFromMedicalRecodsAdmin = referer?.includes('/admin/collections/materials') || false
  if (isFromMedicalRecodsAdmin) {
    return true
  }
  const isFromMedicalRecodsA = referer?.includes('/admin/collections/machine') || false
  if (isFromMedicalRecodsA) {
    return true
  }
  const isFromMedicalRecodsAdmin1 = referer?.includes('/admin/collections/factories') || false
  if (isFromMedicalRecodsAdmin1) {
    return true
  }
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'warehouse') return true
  return false
}
export const canUpdateInventory: Access = ({ req, data }) => {
  const user = req.user
  if (!data) return false
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'warehouse') {
    if (user?.employee.position !== 'employees') {
      const idDepartment =
        typeof user.employee.department === 'object' && user.employee.department !== null
          ? user.employee.department.id
          : user.employee.department
      if (idDepartment === data.managerInventory) {
        return true
      }
    }
  }
  return false
}
