/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeValidateHook,
  CollectionBeforeChangeHook,
  APIError,
  CollectionAfterReadHook,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const rondomID: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.orderId) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.orderId = `DH${numberOnly.substring(0, 10)}`
  }
}
export const checkTime: CollectionBeforeValidateHook = ({ data, originalDoc, operation }) => {
  if (!data) return
  const error: string[] = []
  const today = new Date()
  const threeDaysAgo = new Date()
  const oneNextDay = new Date()
  const inputDateMake = new Date(data.dateMake)
  const inputOriginalDateMake = new Date(originalDoc.dateMake)
  const inputDateShip = new Date(data.dateShip)
  threeDaysAgo.setDate(today.getDate() - 3)
  oneNextDay.setDate(inputDateMake.getDate() + 1)
  const formatDate = (date: any) => {
    return new Date(date).toISOString().split('T')[0]
  }
  if (operation === 'create') {
    if (formatDate(inputDateMake) > formatDate(today)) {
      error.push('Ngày lập không được ở tương lai.')
    }
    if (formatDate(inputDateMake) < formatDate(threeDaysAgo)) {
      error.push('Chỉ có thể tạo phiếu trong vòng 3 ngày trước.')
    }
    if (formatDate(inputDateShip) < formatDate(today)) {
      error.push('Không thể chọn ngày ơ quá khứ')
    }
    if (error.length > 0) {
      throw new APIError(`${error.join('; ')}`, 400)
    }
  }
  if (operation === 'update') {
    if (formatDate(inputOriginalDateMake) !== formatDate(inputDateMake)) {
      error.push('Không thể sửa ngày nhập.')
    }
    if (error.length > 0) {
      throw new APIError(`${error.join('; ')}`, 400)
    }
  }
}
export const priceProduct: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
  operation,
}) => {
  if (!data) return
  const findBestPrice = (tieredPricing: any[], quantity: number) => {
    let bestPrice = null
    tieredPricing.forEach((tier) => {
      if (quantity >= (tier.minQuantity ?? 0)) {
        bestPrice = tier.discountedPrice
      }
    })
    return bestPrice
  }
  if (operation === 'create') {
    for (const item of data.products) {
      const findPrice = await req.payload.find({
        collection: 'productprices',
        where: {
          product: { equals: item.productId },
        },
      })
      findPrice.docs.forEach((item1) => {
        item1.price?.forEach((item2) => {
          if (item2.unti === item.unti) {
            const bestPrice = findBestPrice(item2.tieredPricing || [], item.quantity)
            if (bestPrice !== null) {
              item.price = bestPrice
            } else {
              item.price = item2.priceProduct
            }
            item.currency = item2.currency
          }
        })
      })
    }
  }
  if (operation === 'update') {
    for (const item of data.products) {
      const originalDocs = originalDoc.products.find((od: any) => od?.id === item?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findPrice = await req.payload.find({
          collection: 'productprices',
          where: {
            product: { equals: item.productId },
          },
        })
        findPrice.docs.forEach((item1) => {
          item1.price?.forEach((item2) => {
            if (item2.unti === item.unti) {
              const bestPrice = findBestPrice(item2.tieredPricing || [], item.quantity)
              if (bestPrice !== null) {
                item.price = bestPrice
              } else {
                item.price = item2.priceProduct
              }
              item.currency = item2.currency
            }
          })
        })
      }
    }
  }
}
export const updateReport: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data) return data
  if (data.products.length > 0) {
    const reportData: {
      [key: string]: { productId: string; report: { unti: string; quantity: number }[] }
    } = {}

    data.products.forEach((item: any) => {
      if (!item.productId || !item.quantity || !item.unti) return
      if (!reportData[item.productId]) {
        reportData[item.productId] = {
          productId: item.productId,
          report: [],
        }
      }
      const existingUnit = reportData[item.productId].report.find((r) => r.unti === item.unti)

      if (existingUnit) {
        existingUnit.quantity += item.quantity
      } else {
        reportData[item.productId].report.push({
          unti: item.unti,
          quantity: item.quantity,
        })
      }
    })
    data.productsReport = Object.values(reportData)
  }
  if (data.material.length > 0) {
    const reportData: {
      [key: string]: { materialId: string; report: { unti: string; quantity: number }[] }
    } = {}
    data.material.forEach((item: any) => {
      if (!item.materialName || !item.soluongMaterial || !item.unitMaterial) return
      if (!reportData[item.materialName]) {
        reportData[item.materialName] = {
          materialId: item.materialName,
          report: [],
        }
      }
      const existingUnit = reportData[item.materialName].report.find(
        (r) => r.unti === item.unitMaterial,
      )

      if (existingUnit) {
        existingUnit.quantity += item.soluongMaterial
      } else {
        reportData[item.materialName].report.push({
          unti: item.unitMaterial,
          quantity: item.soluongMaterial,
        })
      }
    })
    data.materialReport = Object.values(reportData)
  }
  if (data.machine.length > 0) {
    const reportData: {
      [key: string]: { machineId: string; report: { unti: string; quantity: number }[] }
    } = {}
    data.machine.forEach((item: any) => {
      if (!item.machineName || !item.soluongMachine || !item.unitMachine) return
      if (!reportData[item.machineName]) {
        reportData[item.machineName] = {
          machineId: item.machineName,
          report: [],
        }
      }
      const existingUnit = reportData[item.machineName].report.find(
        (r) => r.unti === item.unitMachine,
      )

      if (existingUnit) {
        existingUnit.quantity += item.soluongMachine
      } else {
        reportData[item.machineName].report.push({
          unti: item.unitMachine,
          quantity: item.soluongMachine,
        })
      }
    })
    data.machineReport = Object.values(reportData)
  }
  return data
}
export const totalValueProduce: CollectionAfterReadHook = async ({ doc }) => {
  if (!doc?.products) return doc
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
  if (doc.products.length > 0) {
    doc.products.forEach((pc: any) => {
      if (pc.price && pc.quantity) {
        const total = convertToNumber(pc.price) * pc.quantity
        pc.totalPrice = formatNumber(total)
      }
    })
    const totalValuesVnd = doc.products
      .filter((pc: any) => pc.currency === 'VND')
      .flatMap((dc: any) => dc.totalPrice)

    const totalValuesUsd = doc.products
      .filter((pc: any) => pc.currency === 'USD')
      .flatMap((dc: any) => dc.totalPrice)
    if (doc.currency === 'VND') {
      const totalValue = [
        ...totalValuesVnd.map((value: any) => convertToNumber(value)),
        ...totalValuesUsd.map((value: any) => convertToNumber(value) * 25000),
      ].reduce((sum: number, value: number) => sum + value, 0)
      doc.totalPrice = formatNumber(totalValue)
    }
    if (doc.currency === 'USD') {
      const totalValue = [
        ...totalValuesVnd.map((value: any) => convertToNumber(value) / 25000),
        ...totalValuesUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      doc.totalPrice = formatNumber(totalValue)
    }
  }
  if (doc.material.length > 0) {
    doc.material.forEach((pc: any) => {
      if (pc.soluongMaterial && pc.price) {
        const total = convertToNumber(pc.price) * pc.soluongMaterial
        pc.totalPrice = formatNumber(total)
      }
    })
  }
  if (doc.machine.length > 0) {
    doc.machine.forEach((pc: any) => {
      if (pc.soluongMachine && pc.price) {
        const total = convertToNumber(pc.price) * pc.soluongMachine
        pc.totalPrice = formatNumber(total)
      }
    })
  }
  if (doc.material.length > 0 || doc.machine.length > 0) {
    const totalMaterialVnd = doc.material
      .filter((pc: any) => pc.currency === 'VND')
      .flatMap((dc: any) => dc.totalPrice)

    const totalMaterialUsd = doc.material
      .filter((pc: any) => pc.currency === 'USD')
      .flatMap((dc: any) => dc.totalPrice)
    const totalMachineVnd = doc.machine
      .filter((pc: any) => pc.currency === 'VND')
      .flatMap((dc: any) => dc.totalPrice)

    const totalMachineUsd = doc.machine
      .filter((pc: any) => pc.currency === 'USD')
      .flatMap((dc: any) => dc.totalPrice)
    if (doc.currency === 'VND') {
      const totalValue = [
        ...totalMaterialVnd.map((value: any) => convertToNumber(value)),
        ...totalMaterialUsd.map((value: any) => convertToNumber(value) * 25000),
        ...totalMachineVnd.map((value: any) => convertToNumber(value)),
        ...totalMachineUsd.map((value: any) => convertToNumber(value) * 25000),
      ].reduce((sum: number, value: number) => sum + value, 0)
      doc.totalPrice = formatNumber(totalValue)
    }
    if (doc.currency === 'USD') {
      const totalValue = [
        ...totalMaterialVnd.map((value: any) => convertToNumber(value) / 25000),
        ...totalMaterialUsd.map((value: any) => convertToNumber(value)),
        ...totalMachineVnd.map((value: any) => convertToNumber(value) / 25000),
        ...totalMachineUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      doc.totalPrice = formatNumber(totalValue)
    }
  }
  return doc
}
export const checkValueSanPham: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
  originalDoc,
}) => {
  if (!data) return
  const errorSet = new Set<string>()
  const error = new Set<string>()
  const priceMap = new Map()
  const nameProduceMap = new Map()
  if (operation === 'create') {
    for (const item of data.products) {
      const findPrice = await req.payload.find({
        collection: 'productprices',
        where: {
          product: item.productId,
        },
      })

      findPrice.docs.forEach((item1) => {
        const ProduceId =
          typeof item1.product === 'object' && item1.product !== null
            ? item1.product.id
            : item1.product
        const ProduceName =
          typeof item1.product === 'object' && item1.product !== null
            ? item1.product.nameProduct
            : item1.product
        item1.price?.forEach((dt) => {
          priceMap.set(`${ProduceId}-${dt.unti}`, ProduceId)
          nameProduceMap.set(`${ProduceId}`, ProduceName)
        })
      })
      const key = `${item.productId}-${item.unti}`
      const keyName = `${item.productId}`
      const dt = priceMap.get(key)
      const name = nameProduceMap.get(keyName)
      if (!dt) {
        if (item.unti === 'cai') {
          errorSet.add(`Sản phẩm ${name} với đơn vị la cái chưa có giá`)
        } else if (item.unti === 'bo') {
          errorSet.add(`Sản phẩm ${name} với đơn vị la bộ chưa có giá`)
        } else if (item.unti === 'doi') {
          errorSet.add(`Sản phẩm ${name} với đơn vị la đôi chưa có giá`)
        }
      }
    }
    if (errorSet.size > 0) {
      throw new APIError(Array.from(errorSet).join(','), 400)
    }
  }
  if (operation === 'update') {
    for (const item of data.products) {
      const originalDocs = originalDoc.products.find((od: any) => od?.id === item?.id) || null
      if (!originalDocs || originalDocs === null) {
        const findPrice = await req.payload.find({
          collection: 'productprices',
          where: {
            product: item.productId,
          },
        })

        findPrice.docs.forEach((item1) => {
          const ProduceId =
            typeof item1.product === 'object' && item1.product !== null
              ? item1.product.id
              : item1.product
          const ProduceName =
            typeof item1.product === 'object' && item1.product !== null
              ? item1.product.nameProduct
              : item1.product
          item1.price?.forEach((dt) => {
            priceMap.set(`${ProduceId}-${dt.unti}`, ProduceId)
            nameProduceMap.set(`${ProduceId}`, ProduceName)
          })
        })
        const key = `${item.productId}-${item.unti}`
        const keyName = `${item.productId}`
        const dt = priceMap.get(key)
        const name = nameProduceMap.get(keyName)
        if (!dt) {
          if (item.unti === 'cai') {
            errorSet.add(`Sản phẩm ${name} với đơn vị la cái chưa có giá`)
          } else if (item.unti === 'bo') {
            errorSet.add(`Sản phẩm ${name} với đơn vị la bộ chưa có giá`)
          } else if (item.unti === 'doi') {
            errorSet.add(`Sản phẩm ${name} với đơn vị la đôi chưa có giá`)
          }
        }
      } else {
        if (
          item.productId !== originalDocs.productId ||
          item.quantity !== originalDocs.quantity ||
          item.unti !== originalDocs.unti
        ) {
          error.add('Không được chỉnh sửa phiểu đã tạo')
        }
      }
    }

    if (errorSet.size > 0) {
      throw new APIError(Array.from(errorSet).join(','), 400)
    }
    if (error.size > 0) {
      throw new APIError(Array.from(error).join(','), 400)
    }
  }
}
export const checkInfo: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const errorArray: string[] = []
  const errorCount = new Map<string, number>()
  const requiredFields = {
    dateMake: 'Ngày lập',
    adderssShip: 'Địa chỉ giao hàng',
    dateShip: 'Ngày giao hàng dự kiến',
  }
  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)
  if (!data.customerName && data.typeOrder === 'customer') {
    error.push('Tên khách hàng')
  }
  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(',')}`, 400)
  }
  if (data.products.length === 0 && data.typeOrder === 'customer') {
    throw new APIError('Không được để trống sản phẩm', 400)
  }
  if (data.typeOrder === 'company') {
    if (data.material.length === 0 && data.machine.length === 0) {
      throw new APIError('Không được để trống cả Vật liệu và Máy móc', 400)
    }
  }
  if (data.products.length > 0) {
    data.products.forEach((dt: any, index: number) => {
      const key = dt.id
      let count = errorCount.get(key) || 0
      if (!dt.productId || !dt.quantity || !dt.unti) {
        count++
      }
      errorCount.set(key, count)
      if (count > 0) {
        const message = `Sản phẩm ${index + 1} thiếu thông tin`
        if (!error.includes(message)) {
          errorArray.push(message)
        }
      }
    })
  }
  if (data.material.length > 0 || data.machine.length > 0) {
    data.material.forEach((dt: any, index: number) => {
      const key = dt.id
      let count = errorCount.get(key) || 0
      if (!dt.materialName || !dt.soluongMaterial || !dt.unitMaterial) {
        count++
      }
      errorCount.set(key, count)
      if (count > 0) {
        const message = `Vật liệu ${index + 1} thiếu thông tin`
        if (!error.includes(message)) {
          errorArray.push(message)
        }
      }
    })
    data.machine.forEach((dt: any, index: number) => {
      const key = dt.id
      let count = errorCount.get(key) || 0
      if (!dt.machineName || !dt.soluongMachine || !dt.unitMachine) {
        count++
      }
      errorCount.set(key, count)
      if (count > 0) {
        const message = `Máy móc ${index + 1} thiếu thông tin`
        if (!error.includes(message)) {
          errorArray.push(message)
        }
      }
    })
  }
  if (errorArray.length > 0) {
    throw new APIError(`Lỗi thiếu thông tin: ${errorArray.join(', ')}`, 400)
  }
}
export const autoVoucherMaker: CollectionBeforeChangeHook = ({ data, req }) => {
  const user = req.user
  if (!data.voucherMaker) {
    data.voucherMaker = user?.id
  }
  return data
}
export const priceMaterialAndMachine: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
  operation,
}) => {
  if (!data) return
  if (data.material.length > 0) {
    if (operation === 'create') {
      for (const item of data.material) {
        const find = await req.payload.find({
          collection: 'materialAndMachinePrice',
          where: {
            materialName: { equals: item.materialName },
          },
        })
        find.docs.forEach((item1) => {
          item1.price?.forEach((item2) => {
            const idSupplier =
              typeof item2.supplier === 'object' && item2.supplier !== null
                ? item2.supplier.id
                : item2.supplier
            if (data.suppliers === idSupplier && item2.unitMaterial === item.unitMaterial) {
              item.price = item2.price
              item.currency = item2.typePrice
            }
          })
        })
      }
    }
    if (operation === 'update') {
      for (const item of data.material) {
        const originalDocs = originalDoc.material.find((od: any) => od?.id === item?.id) || null
        if (!originalDocs || originalDocs === null) {
          const find = await req.payload.find({
            collection: 'materialAndMachinePrice',
            where: {
              materialName: { equals: item.materialName },
            },
          })
          find.docs.forEach((item1) => {
            item1.price?.forEach((item2) => {
              const idSupplier =
                typeof item2.supplier === 'object' && item2.supplier !== null
                  ? item2.supplier.id
                  : item2.supplier
              if (data.suppliers === idSupplier && item2.unitMaterial === item.unitMaterial) {
                item.price = item2.price
                item.currency = item2.typePrice
              }
            })
          })
        }
      }
    }
  }
  if (data.machine.length > 0) {
    if (operation === 'create') {
      for (const item of data.machine) {
        const find = await req.payload.find({
          collection: 'materialAndMachinePrice',
          where: {
            machineName: { equals: item.machineName },
          },
        })
        find.docs.forEach((item1) => {
          item1.price?.forEach((item2) => {
            const idSupplier =
              typeof item2.supplier === 'object' && item2.supplier !== null
                ? item2.supplier.id
                : item2.supplier
            if (data.suppliers === idSupplier && item2.unitMachine === item.unitMachine) {
              item.price = item2.price
              item.currency = item2.typePrice
            }
          })
        })
      }
    }
    if (operation === 'update') {
      for (const item of data.machine) {
        const originalDocs = originalDoc.machine.find((od: any) => od?.id === item?.id) || null
        if (!originalDocs || originalDocs === null) {
          const find = await req.payload.find({
            collection: 'materialAndMachinePrice',
            where: {
              machineName: { equals: item.machineName },
            },
          })
          find.docs.forEach((item1) => {
            item1.price?.forEach((item2) => {
              const idSupplier =
                typeof item2.supplier === 'object' && item2.supplier !== null
                  ? item2.supplier.id
                  : item2.supplier
              if (data.suppliers === idSupplier && item2.unitMachine === item.unitMachine) {
                item.price = item2.price
                item.currency = item2.typePrice
              }
            })
          })
        }
      }
    }
  }
}
export const checkValueMaterialAndMachine: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return
  if (data.material.length > 0) {
    const unitMaterial = [
      { label: 'Kilogram (Kg)', value: 'kg' },
      { label: 'Gram (g)', value: 'g' },
      { label: 'Tấn (T)', value: 't' },
      { label: 'Mét (m)', value: 'm' },
      { label: 'Cuộn', value: 'cuon' },
      { label: 'Lít (L)', value: 'l' },
      { label: 'Cái', value: 'cai' },
      { label: 'Bộ', value: 'bo' },
      { label: 'Thùng', value: 'thung' },
      { label: 'Hộp', value: 'hop' },
      { label: 'Bao', value: 'bao' },
      { label: 'Pallet', value: 'pallet' },
    ]
    const errorMaterials = new Set<string>()
    if (operation === 'create') {
      for (const [index, item] of data.material.entries()) {
        const find = await req.payload.find({
          collection: 'materialAndMachinePrice',
          where: {
            materialName: { equals: item.materialName },
          },
        })
        const unitLabel = unitMaterial.find((u) => u.value === item.unitMaterial)?.label
        find.docs.forEach((item1) => {
          const nameMaterial =
            typeof item1.materialName === 'object' && item1.materialName !== null
              ? item1.materialName.materialsName
              : item1.materialName
          item1.price?.forEach((item2) => {
            const idSupplier =
              typeof item2.supplier === 'object' && item2.supplier !== null
                ? item2.supplier.id
                : item2.supplier
            const nameSupplier =
              typeof item2.supplier === 'object' && item2.supplier !== null
                ? item2.supplier.name
                : item2.supplier
            if (idSupplier === data.suppliers) {
              if (item.unitMaterial !== item2.unitMaterial) {
                errorMaterials.add(
                  `Vật liệu ${index + 1} {Vật liệu ${nameMaterial} với đơn vị là ${unitLabel} của nhà cung cấp ${nameSupplier} chưa có giá}`,
                )
              }
            }
          })
        })
      }
      if (errorMaterials.size > 0) {
        throw new APIError(`Lỗi vật liêu: ${Array.from(errorMaterials).join('; ')}`, 400)
      }
    }
    if (operation === 'update') {
      for (const [index, item] of data.material.entries()) {
        const originalDocs = originalDoc.material.find((od: any) => od?.id === item?.id) || null
        if (!originalDocs || originalDocs === null) {
          const find = await req.payload.find({
            collection: 'materialAndMachinePrice',
            where: {
              materialName: { equals: item.materialName },
            },
          })
          const unitLabel = unitMaterial.find((u) => u.value === item.unitMaterial)?.label
          find.docs.forEach((item1) => {
            const nameMaterial =
              typeof item1.materialName === 'object' && item1.materialName !== null
                ? item1.materialName.materialsName
                : item1.materialName
            item1.price?.forEach((item2) => {
              const idSupplier =
                typeof item2.supplier === 'object' && item2.supplier !== null
                  ? item2.supplier.id
                  : item2.supplier
              const nameSupplier =
                typeof item2.supplier === 'object' && item2.supplier !== null
                  ? item2.supplier.name
                  : item2.supplier
              if (idSupplier === data.suppliers) {
                if (item.unitMaterial !== item2.unitMaterial) {
                  errorMaterials.add(
                    `Vật liệu ${index + 1} {Vật liệu ${nameMaterial} với đơn vị là ${unitLabel} của nhà cung cấp ${nameSupplier} chưa có giá}`,
                  )
                }
              }
            })
          })
        }
        if (errorMaterials.size > 0) {
          throw new APIError(`Lỗi vật liêu: ${Array.from(errorMaterials).join('; ')}`, 400)
        }
      }
    }
  }
  if (data.machine.length > 0) {
    const unitMachine = [
      { label: 'Cái', value: 'cai' },
      { label: 'Bộ', value: 'bo' },
      { label: 'Chiếc', value: 'chiec' },
      { label: 'Hệ thống', value: 'he-thong' },
      { label: 'Máy', value: 'may' },
      { label: 'Tấn (T)', value: 't' },
      { label: 'Kilogram (Kg)', value: 'kg' },
      { label: 'Thùng', value: 'thung' },
      { label: 'Hộp', value: 'hop' },
      { label: 'Bao', value: 'bao' },
      { label: 'Pallet', value: 'pallet' },
      { label: 'Lô', value: 'lo' },
      { label: 'Cuộn', value: 'cuon' },
      { label: 'Mét (m)', value: 'm' },
    ]
    const errorMachine = new Set<string>()
    if (operation === 'create') {
      for (const [index, item] of data.machine.entries()) {
        const find = await req.payload.find({
          collection: 'materialAndMachinePrice',
          where: {
            machineName: { equals: item.machineName },
          },
        })
        const unitLabel = unitMachine.find((u) => u.value === item.unitMachine)?.label
        find.docs.forEach((item1) => {
          const nameMachine =
            typeof item1.machineName === 'object' && item1.machineName !== null
              ? item1.machineName.nameMachine
              : item1.machineName
          item1.price?.forEach((item2) => {
            const idSupplier =
              typeof item2.supplier === 'object' && item2.supplier !== null
                ? item2.supplier.id
                : item2.supplier
            const nameSupplier =
              typeof item2.supplier === 'object' && item2.supplier !== null
                ? item2.supplier.name
                : item2.supplier
            if (idSupplier === data.suppliers) {
              if (item.unitMachine !== item2.unitMachine) {
                errorMachine.add(
                  `Máy móc ${index + 1} {Máy móc ${nameMachine} với đơn vị là ${unitLabel} của nhà cung cấp ${nameSupplier} chưa có giá}`,
                )
              }
            }
          })
        })
      }
      if (errorMachine.size > 0) {
        throw new APIError(`Lỗi vật liêu: ${Array.from(errorMachine).join('; ')}`, 400)
      }
    }
    if (operation === 'update') {
      for (const [index, item] of data.machine.entries()) {
        const originalDocs = originalDoc.machine.find((od: any) => od?.id === item?.id) || null
        if (!originalDocs || originalDocs === null) {
          const find = await req.payload.find({
            collection: 'materialAndMachinePrice',
            where: {
              machineName: { equals: item.machineName },
            },
          })
          const unitLabel = unitMachine.find((u) => u.value === item.unitMachine)?.label
          find.docs.forEach((item1) => {
            const nameMachine =
              typeof item1.machineName === 'object' && item1.machineName !== null
                ? item1.machineName.nameMachine
                : item1.machineName
            item1.price?.forEach((item2) => {
              const idSupplier =
                typeof item2.supplier === 'object' && item2.supplier !== null
                  ? item2.supplier.id
                  : item2.supplier
              const nameSupplier =
                typeof item2.supplier === 'object' && item2.supplier !== null
                  ? item2.supplier.name
                  : item2.supplier
              if (idSupplier === data.suppliers) {
                if (item.unitMachine !== item2.unitMachine) {
                  errorMachine.add(
                    `Máy móc ${index + 1} {Máy móc ${nameMachine} với đơn vị là ${unitLabel} của nhà cung cấp ${nameSupplier} chưa có giá}`,
                  )
                }
              }
            })
          })
        }
        if (errorMachine.size > 0) {
          throw new APIError(`Lỗi vật liêu: ${Array.from(errorMachine).join('; ')}`, 400)
        }
      }
    }
  }
}
export const noChangeTypeOrder: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data) return
  if (operation === 'update') {
    if (data.typeOrder !== originalDoc.typeOrder) {
      throw new APIError('Không được chỉnh sửa loại đơn hàng', 400)
    }
  }
}
export const canRead: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (
    user.role === 'admin' ||
    user.employee?.typeDepartment === 'business' ||
    user.employee?.typeDepartment === 'warehouse'
  )
    return true
  return false
}
export const canUpdateCreateDelete: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin' || user.employee?.typeDepartment === 'business') return true
  return false
}
