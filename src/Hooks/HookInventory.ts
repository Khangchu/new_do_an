/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
  APIError,
  CollectionBeforeChangeHook,
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
}

export const checkValue: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    inventoryName: 'Tên kho',
    location: 'Địa chỉchỉ',
    managerInventory: 'Người quản lý',
    phoneInventory: 'Số điện thoại',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
  if (data.material.length === 0 || data.machine.length === 0) {
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
