/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'
import {
  CollectionBeforeChangeHook,
  CollectionAfterReadHook,
  CollectionAfterChangeHook,
  APIError,
  CollectionBeforeValidateHook,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'

export const priceProduct: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
  operation,
}) => {
  if (!data) return
  if (
    data.chose === 'order' ||
    data.chose === 'chuyenkhosanpham' ||
    data.chose === 'tieuhuysanpham'
  ) {
    if (data.produce.length !== 0) {
      if (operation === 'create') {
        for (const item of data.produce) {
          const findPrice = await req.payload.find({
            collection: 'productprices',
            where: {
              product: item.sanpham,
            },
          })
          findPrice.docs.forEach((item1) => {
            item1.price?.forEach((item2) => {
              if (item2.unti === item.unti) {
                item.cost = item2.priceProduct
                item.rate = item2.currency
              }
            })
          })
        }
      }
      if (operation === 'update') {
        for (const item of data.produce) {
          const originalDocs = originalDoc.produce.find((od: any) => od?.id === item?.id) || null
          if (!originalDocs || originalDocs === null) {
            const findPrice = await req.payload.find({
              collection: 'productprices',
              where: {
                product: item.sanpham,
              },
            })
            findPrice.docs.forEach((item1) => {
              item1.price?.forEach((item2) => {
                if (item2.unti === item.unti) {
                  item.cost = item2.priceProduct
                  item.rate = item2.currency
                }
              })
            })
          }
        }
      }
    }
  }
  if (data.chose === 'sanxuat' || data.chose === 'chuyenkho' || data.chose === 'tieuhuy') {
    const inventory = await req.payload.findByID({
      collection: 'MaterialsAndMachine_Inventory',
      id: data.inventoryM,
    })
    if (data.materials.materialsProduce.length !== 0) {
      if (operation === 'create') {
        data.materials.materialsProduce.forEach((dt: any) => {
          inventory.material?.forEach((pc) => {
            const materialId =
              typeof pc.materialName === 'object' && pc.materialName !== null
                ? pc.materialName.id
                : pc.materialName
            const materialSupplier =
              typeof pc.suppliersMaterial === 'object' && pc.suppliersMaterial !== null
                ? pc.suppliersMaterial.id
                : pc.suppliersMaterial
            if (
              dt.materialsName === materialId &&
              dt.suppliersMaterials === materialSupplier &&
              pc.unitMaterial === dt.unitsMaterials
            ) {
              dt.priceMaterials = pc.priceMaterial
              dt.typePriceMaterials = pc.typePriceMaterial
            }
          })
        })
      }
      if (operation === 'update') {
        data.materials.materialsProduce.forEach((dt: any) => {
          inventory.material?.forEach((pc) => {
            const originalDocs =
              originalDoc.materials?.materialsProduce.find((od: any) => od?.id === pc?.id) || null
            if (!originalDocs || originalDocs === null) {
              const materialId =
                typeof pc.materialName === 'object' && pc.materialName !== null
                  ? pc.materialName.id
                  : pc.materialName
              const materialSupplier =
                typeof pc.suppliersMaterial === 'object' && pc.suppliersMaterial !== null
                  ? pc.suppliersMaterial.id
                  : pc.suppliersMaterial
              if (
                dt.materialsName === materialId &&
                dt.suppliersMaterials === materialSupplier &&
                pc.unitMaterial === dt.unitsMaterials
              ) {
                dt.priceMaterials = pc.priceMaterial
                dt.typePriceMaterials = pc.typePriceMaterial
              }
            }
          })
        })
      }
    }
    if (data.machine.machinesProduce.length !== 0) {
      if (operation === 'create') {
        data.machine.machinesProduce.forEach((dt: any) => {
          inventory.machine?.forEach((pc) => {
            const machineId =
              typeof pc.machineName === 'object' && pc.machineName !== null
                ? pc.machineName.id
                : pc.machineName
            const machineSupplier =
              typeof pc.suppliersMachine === 'object' && pc.suppliersMachine !== null
                ? pc.suppliersMachine.id
                : pc.suppliersMachine
            if (
              machineId === dt.machinesName &&
              machineSupplier === dt.suppliersMachines &&
              dt.unitsMachines === pc.unitMachine
            ) {
              dt.priceMachines = pc.priceMachine
              dt.typePriceMachines = pc.typePriceMachine
              dt.typePriceMachines = pc.typePriceMachine
            }
          })
        })
      }
      if (operation === 'update') {
        data.machine.machinesProduce.forEach((dt: any) => {
          inventory.machine?.forEach((pc) => {
            const originalDocs =
              originalDoc.machine?.machinesProduce.find((od: any) => od?.id === pc?.id) || null
            if (!originalDocs || originalDocs === null) {
              const machineId =
                typeof pc.machineName === 'object' && pc.machineName !== null
                  ? pc.machineName.id
                  : pc.machineName
              const machineSupplier =
                typeof pc.suppliersMachine === 'object' && pc.suppliersMachine !== null
                  ? pc.suppliersMachine.id
                  : pc.suppliersMachine
              if (
                machineId === dt.machinesName &&
                machineSupplier === dt.suppliersMachines &&
                dt.unitsMachines === pc.unitMachine
              ) {
                dt.priceMachines = pc.priceMachine
                dt.typePriceMachines = pc.typePriceMachine
              }
            }
          })
        })
      }
    }
  }
}
export const totalValueProduce: CollectionAfterReadHook = async ({ doc }) => {
  if (!doc?.produce) return doc
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
  if (doc.chose === 'order' || doc.chose === 'chuyenkhosanpham' || doc.chose === 'tieuhuysanpham') {
    doc.produce.forEach((pc: any) => {
      if (pc.cost && pc.soluong) {
        const total = convertToNumber(pc.cost) * pc.soluong
        pc.totalProduc = formatNumber(total)
      }
    })
  }
  if (doc.chose === 'sanxuat' || doc.chose === 'chuyenkho' || doc.chose === 'tieuhuy') {
    if (doc.materials.materialsProduce.length !== 0) {
      doc.materials.materialsProduce.map((dt: any) => {
        if (dt.priceMaterials && dt.soluongMaterials) {
          const totalMaterials = convertToNumber(dt.priceMaterials) * dt.soluongMaterials
          dt.totalMaterials = formatNumber(totalMaterials)
          return dt
        }
      })
    }
    if (doc.machine.machinesProduce.length !== 0) {
      doc.machine.machinesProduce.map((dt: any) => {
        if (dt.priceMachines && dt.soluongMachines) {
          const totalMachines = convertToNumber(dt.priceMachines) * dt.soluongMachines
          dt.totalMachines = formatNumber(totalMachines)
          return dt
        }
      })
    }
  }
  const exchangeRate = 25000
  const totalValuesVnd = doc.produce
    .filter((pc: any) => pc.rate === 'VND')
    .flatMap((dc: any) => dc.totalProduc)
  const totalValuesUsd = doc.produce
    .filter((pc: any) => pc.rate === 'USD')
    .flatMap((dc: any) => dc.totalProduc)
  const totalValueMaterialUsd = doc.materials.materialsProduce
    .filter((dt: any) => dt.typePriceMaterials === 'USD')
    .flatMap((pc: any) => pc.totalMaterials)
  const totalValueMaterialVnd = doc.materials.materialsProduce
    .filter((dt: any) => dt.typePriceMaterials === 'VND')
    .flatMap((pc: any) => pc.totalMaterials)
  const totalMachineUsd = doc.machine?.machinesProduce
    .filter((dt: any) => dt.typePriceMachines === 'USD')
    .flatMap((pc: any) => pc.totalMachines)
  const totalMachineVnd = doc.machine?.machinesProduce
    .filter((dt: any) => dt.typePriceMachines === 'VND')
    .flatMap((pc: any) => pc.totalMachines)

  if (doc.rateValue === 'VND') {
    const totalValueProduce = [
      ...totalValuesVnd.map((value: any) => convertToNumber(value)),
      ...totalValuesUsd.map((value: any) => convertToNumber(value) * 25000),
    ].reduce((sum: number, value: number) => sum + value, 0)
    const totalValueMateria = [
      ...totalValueMaterialVnd.map((value: any) => convertToNumber(value)),
      ...totalValueMaterialUsd.map((value: any) => convertToNumber(value) * exchangeRate),
    ].reduce((sum: number, value: number) => sum + value, 0)
    const totalValueMachine = [
      ...totalMachineVnd.map((value: any) => convertToNumber(value)),
      ...totalMachineUsd.map((value: any) => convertToNumber(value) * exchangeRate),
    ].reduce((sum: number, value: number) => sum + value, 0)
    const totalValue = totalValueMachine + totalValueMateria + totalValueProduce
    doc.totalValue = formatNumber(totalValue)
  }
  if (doc.rateValue === 'USD') {
    const totalValueProduce = [
      ...totalValuesVnd.map((value: any) => convertToNumber(value) / 25000),
      ...totalValuesUsd.map((value: any) => convertToNumber(value)),
    ].reduce((sum: number, value: number) => sum + value, 0)
    const totalValueMateria = [
      ...totalValueMaterialVnd.map((value: any) => convertToNumber(value) / exchangeRate),
      ...totalValueMaterialUsd.map((value: any) => convertToNumber(value)),
    ].reduce((sum: number, value: number) => sum + value, 0)
    const totalValueMachine = [
      ...totalMachineVnd.map((value: any) => convertToNumber(value) / exchangeRate),
      ...totalMachineUsd.map((value: any) => convertToNumber(value)),
    ].reduce((sum: number, value: number) => sum + value, 0)
    const totalValue = totalValueMachine + totalValueMateria + totalValueProduce
    doc.totalValue = formatNumber(totalValue)
  }

  return doc
}
export const setUpdateSoluong: CollectionAfterChangeHook = async ({
  doc,
  req,
  previousDoc,
  operation,
}) => {
  if (doc.chose === 'order' || doc.chose === 'chuyenkhosanpham' || doc.chose === 'tieuhuysanpham') {
    const inventory = await req.payload.findByID({
      collection: 'Products_Inventory',
      id: doc.inventory,
    })
    if (operation === 'update') {
      const updatedCatalogue = await Promise.all(
        inventory.catalogueOfGoods?.map(async (dt) => {
          const matchingProduct = doc?.produce.filter((pc: any) =>
            typeof dt.productId === 'object' && dt.productId !== null
              ? dt.productId.id === pc.sanpham && dt.danhmuc?.unti === pc.unti
              : dt.productId === pc.sanpham,
          )
          if (!matchingProduct.length) return dt
          const newProducts = matchingProduct.filter(
            (pc: any) => !previousDoc.produce.some((prev: any) => prev.id === pc.id),
          )

          if (!newProducts.length) return dt
          const totalNewSoluong = newProducts.reduce((sum: number, np: any) => sum + np.soluong, 0)
          const remainingAmount = (dt.danhmuc?.amount || 0) - totalNewSoluong
          if (remainingAmount < 0) {
            return dt
          }
          return {
            ...dt,
            danhmuc: {
              ...dt.danhmuc,
              amount: remainingAmount,
            },
          }
        }) || [],
      )
      const validCatalogue = updatedCatalogue.filter(Boolean)

      await req.payload.update({
        collection: 'Products_Inventory',
        id: doc.inventory,
        data: {
          catalogueOfGoods: validCatalogue,
        },
      })
    }
    if (operation === 'create') {
      const updatedCatalogue = await Promise.all(
        inventory.catalogueOfGoods?.map(async (dt) => {
          const matchingProduct = doc?.produce.filter((pc: any) =>
            typeof dt.productId === 'object' && dt.productId !== null
              ? dt.productId.id === pc.sanpham && dt.danhmuc?.unti === pc.unti
              : dt.productId === pc.sanpham,
          )
          const matchingSoluong = matchingProduct.flatMap((mp: any) => mp.soluong)
          const totalSoluong = matchingSoluong.reduce(
            (sum: number, value: number) => sum + value,
            0,
          )
          const remainingAmount = (dt.danhmuc?.amount || 0) - totalSoluong
          if (remainingAmount < 0) {
            return dt
          }
          return {
            ...dt,
            danhmuc: {
              ...dt.danhmuc,
              amount: remainingAmount,
            },
          }
        }) || [],
      )
      await req.payload.update({
        collection: 'Products_Inventory',
        id: doc.inventory,
        data: {
          catalogueOfGoods: updatedCatalogue,
        },
      })
    }
  }
  if (doc.chose === 'sanxuat' || doc.chose === 'chuyenkho' || doc.chose === 'tieuhuy') {
    const inventory = await req.payload.findByID({
      collection: 'MaterialsAndMachine_Inventory',
      id: doc.inventoryM,
    })
    if (doc.materials?.materialsProduce?.length && inventory?.material?.length) {
      if (operation === 'create') {
        const updateSoluong = await Promise.all(
          inventory.material.map((dt) => {
            const materialId =
              typeof dt.materialName === 'object' && dt.materialName !== null
                ? dt.materialName.id
                : dt.materialName
            const materialSupplier =
              typeof dt.suppliersMaterial === 'object' && dt.suppliersMaterial !== null
                ? dt.suppliersMaterial.id
                : dt.suppliersMaterial
            const materialProduce = doc.materials.materialsProduce.filter(
              (pc: any) =>
                materialId === pc.materialsName &&
                materialSupplier === pc.suppliersMaterials &&
                dt.unitMaterial === pc.unitsMaterials,
            )
            const matchingSoluong = materialProduce.flatMap((mp: any) => mp.soluongMaterials)
            const totalSoluong = matchingSoluong.reduce(
              (sum: number, value: number) => sum + value,
              0,
            )
            const remainingAmount = (dt.soluongMaterial || 0) - totalSoluong
            if (remainingAmount < 0) {
              return dt
            }
            return {
              ...dt,
              soluongMaterial: remainingAmount,
            }
          }),
        )
        await req.payload.update({
          collection: 'MaterialsAndMachine_Inventory',
          id: doc.inventoryM,
          data: {
            material: updateSoluong,
          },
        })
      }
      if (operation === 'update') {
        const updateSoluong = await Promise.all(
          inventory.material.map((dt) => {
            const materialId =
              typeof dt.materialName === 'object' && dt.materialName !== null
                ? dt.materialName.id
                : dt.materialName
            const materialSupplier =
              typeof dt.suppliersMaterial === 'object' && dt.suppliersMaterial !== null
                ? dt.suppliersMaterial.id
                : dt.suppliersMaterial
            const materialProduce = doc.materials.materialsProduce.filter(
              (pc: any) =>
                materialId === pc.materialsName &&
                materialSupplier === pc.suppliersMaterials &&
                dt.unitMaterial === pc.unitsMaterials,
            )
            const newProducts = materialProduce.filter(
              (pc: any) =>
                !previousDoc.materials?.materialsProduce.some((prev: any) => prev.id === pc.id),
            )
            if (!newProducts.length) return dt
            const totalNewSoluong = newProducts.reduce(
              (sum: number, np: any) => sum + np.soluongMaterials,
              0,
            )
            const remainingAmount = (dt.soluongMaterial || 0) - totalNewSoluong
            if (remainingAmount < 0) {
              return dt
            }
            return {
              ...dt,
              soluongMaterial: remainingAmount,
            }
          }),
        )
        await req.payload.update({
          collection: 'MaterialsAndMachine_Inventory',
          id: doc.inventoryM,
          data: {
            material: updateSoluong,
          },
        })
      }
    }
    if (doc.machine.machinesProduce.length && inventory.machine?.length) {
      if (operation === 'create') {
        const updateSoluong = await Promise.all(
          inventory.machine.map((dt) => {
            const machineId =
              typeof dt.machineName === 'object' && dt.machineName !== null
                ? dt.machineName.id
                : dt.machineName
            const machineSupplier =
              typeof dt.suppliersMachine === 'object' && dt.suppliersMachine !== null
                ? dt.suppliersMachine.id
                : dt.suppliersMachine
            const machinesProduce = doc.machine.machinesProduce.filter(
              (pc: any) =>
                machineId === pc.machinesName &&
                machineSupplier === pc.suppliersMachines &&
                dt.unitMachine === pc.unitsMachines,
            )
            const totalSoluong = machinesProduce.reduce(
              (sum: number, value: any) => sum + value.soluongMachines,
              0,
            )
            const remainingAmount = (dt.soluongMachine || 0) - totalSoluong
            if (remainingAmount < 0) {
              return dt
            }
            return {
              ...dt,
              soluongMachine: remainingAmount,
            }
          }),
        )
        await req.payload.update({
          collection: 'MaterialsAndMachine_Inventory',
          id: doc.inventoryM,
          data: {
            machine: updateSoluong,
          },
        })
      }
      if (operation === 'update') {
        const updateSoluong = await Promise.all(
          inventory.machine.map((dt) => {
            const machineId =
              typeof dt.machineName === 'object' && dt.machineName !== null
                ? dt.machineName.id
                : dt.machineName
            const machineSupplier =
              typeof dt.suppliersMachine === 'object' && dt.suppliersMachine !== null
                ? dt.suppliersMachine.id
                : dt.suppliersMachine
            const machinesProduce = doc.machine.machinesProduce.filter(
              (pc: any) =>
                machineId === pc.machinesName &&
                machineSupplier === pc.suppliersMachines &&
                dt.unitMachine === pc.unitsMachines,
            )
            const machinesProduceOld = previousDoc.machine.machinesProduce.filter(
              (pc: any) =>
                machineId === pc.machinesName &&
                machineSupplier === pc.suppliersMachines &&
                dt.unitMachine === pc.unitsMachines,
            )
            const totalSoluong = machinesProduce.reduce(
              (sum: number, value: any) => sum + value.soluongMachines,
              0,
            )
            const totalOldSoluong = machinesProduceOld.reduce(
              (sum: number, value: any) => sum + value.soluongMachines,
              0,
            )
            const remainingAmount = (dt.soluongMachine || 0) - (totalSoluong - totalOldSoluong)
            console.log(remainingAmount)
            if (remainingAmount < 0) {
              return dt
            }
            return {
              ...dt,
              soluongMachine: remainingAmount,
            }
          }),
        )
        await req.payload.update({
          collection: 'MaterialsAndMachine_Inventory',
          id: doc.inventoryM,
          data: {
            machine: updateSoluong,
          },
        })
      }
    }
  }
  return doc
}
export const checkValueSoluong: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return
  const errorSet = new Set<string>()
  const errorMaterials = new Set<string>()
  const inventoryMap = new Map()
  const nameProductMap = new Map()
  const nameMaterialMap = new Map()
  const error: string[] = []
  const errorCount = new Map<string, number>()
  if (
    data.chose === 'order' ||
    data.chose === 'chuyenkhosanpham' ||
    data.chose === 'tieuhuysanpham'
  ) {
    const inventory = await req.payload.findByID({
      collection: 'Products_Inventory',
      id: data.inventory,
    })

    inventory.catalogueOfGoods?.forEach((dt) => {
      const productId =
        typeof dt.productId === 'object' && dt.productId !== null ? dt.productId.id : dt.productId
      const productName =
        typeof dt.productId === 'object' && dt.productId !== null
          ? dt.productId.nameProduct
          : 'Sản phẩm không xác định'
      inventoryMap.set(`${productId}-${dt.danhmuc?.unti}`, { ...dt, productName })
    })

    inventory.catalogueOfGoods?.forEach((inven) => {
      const nameProductId =
        typeof inven.productId === 'object' && inven.productId !== null
          ? inven.productId.id
          : inven.productId
      const nameProduct =
        typeof inven.productId === 'object' && inven.productId !== null
          ? inven.productId.nameProduct
          : 'Sản phẩm không xác định'
      nameProductMap.set(`${nameProductId}`, { ...inven, nameProduct })
    })
    if (operation === 'create') {
      await Promise.all(
        data?.produce.map(async (pc: any, index: number) => {
          const key = `${pc.sanpham}-${pc.unti}`
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          const dt = inventoryMap.get(key)
          const keyName = `${pc.sanpham}`
          const name = nameProductMap.get(keyName)
          if (!dt) {
            if (pc.unti === 'cai') {
              errorSet.add(`Sản phẩm ${name.nameProduct} với đơn vị la cái không có trong kho`)
            } else if (pc.unti === 'bo') {
              errorSet.add(`Sản phẩm ${name.nameProduct} với đơn vị la bộ không có trong kho`)
            } else if (pc.unti === 'doi') {
              errorSet.add(`Sản phẩm ${name.nameProduct} với đơn vị la đôi không có trong kho`)
            }
          } else {
            dt.danhmuc.amount -= pc.soluong
            if (dt.danhmuc.amount < 0) {
              if (pc.unti === 'cai') {
                errorSet.add(
                  `Sản phẩm ${dt.productName} với đơn vị la cái trong kho không đủ số lượng`,
                )
              } else if (pc.unti === 'bo') {
                errorSet.add(
                  `Sản phẩm ${dt.productName} với đơn vị la bo trong kho không đủ số lượng`,
                )
              } else if (pc.unti === 'doi') {
                errorSet.add(
                  `Sản phẩm ${dt.productName} với đơn vị la doi trong kho không đủ số lượng`,
                )
              }
            }
          }
          if (!pc.sanpham || !pc.soluong || !pc.unti) {
            count++
          }
          errorCount.set(KeyCheckEmty, count)
          if (count > 0) {
            const message = `Sản phẩm ${index + 1}`
            if (!error.includes(message)) {
              error.push(message)
            }
          }
        }) || [],
      )
      if (error.length > 0) {
        throw new APIError(`Lỗi thiếu thông tin sản phẩm: ${error.join(', ')}`, 400)
      }
      if (errorSet.size > 0) {
        throw new APIError(`Lỗi Sản phẩm: ${Array.from(errorSet).join('; ')}`, 400)
      }
      return data
    }
    if (operation === 'update') {
      await Promise.all(
        data?.produce.map(async (pc: any, index: number) => {
          const originalDocs = originalDoc?.produce.find((od: any) => od?.id === pc?.id)
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          if (!originalDocs) {
            const key = `${pc.sanpham}-${pc.unti}`
            const dt = inventoryMap.get(key)
            const keyName = `${pc.sanpham}`
            const name = nameProductMap.get(keyName)
            if (!dt) {
              if (pc.unti === 'cai') {
                errorSet.add(`Sản phẩm ${name.nameProduct} với đơn vị la cái không có trong kho`)
              } else if (pc.unti === 'bo') {
                errorSet.add(`Sản phẩm ${name.nameProduct} với đơn vị la bộ không có trong kho`)
              } else if (pc.unti === 'doi') {
                errorSet.add(`Sản phẩm ${name.nameProduct} với đơn vị la đôi không có trong kho`)
              }
            } else {
              dt.danhmuc.amount -= pc.soluong
              if (dt.danhmuc.amount < 0) {
                if (pc.unti === 'cai') {
                  errorSet.add(
                    `Sản phẩm ${dt.productName} với đơn vị la cái trong kho không đủ số lượng`,
                  )
                } else if (pc.unti === 'bo') {
                  errorSet.add(
                    `Sản phẩm ${dt.productName} với đơn vị la bo trong kho không đủ số lượng`,
                  )
                } else if (pc.unti === 'doi') {
                  errorSet.add(
                    `Sản phẩm ${dt.productName} với đơn vị la doi trong kho không đủ số lượng`,
                  )
                }
              }
            }
          } else {
            if (
              originalDocs.sanpham !== pc.sanpham ||
              originalDocs.soluong !== pc.soluong ||
              originalDocs.unti !== pc.unti
            ) {
              errorMaterials.add(`Sản phẩm ${index + 1}`)
            }
          }
          if (!pc.sanpham || !pc.soluong || !pc.unti) {
            count++
          }
          errorCount.set(KeyCheckEmty, count)
          if (count > 0) {
            const message = `Sản phẩm ${index + 1}`
            if (!error.includes(message)) {
              error.push(message)
            }
          }
        }) || [],
      )
      if (error.length > 0) {
        throw new APIError(`Lỗi thiếu thông tin sản phẩm: ${error.join(', ')}`, 400)
      }
      if (errorMaterials.size > 0) {
        throw new APIError(`Lỗi chỉnh sửa sản phẩm: ${Array.from(errorMaterials).join('; ')}`, 400)
      }
      if (errorSet.size > 0) {
        throw new APIError(`Lỗi Sản phẩm: ${Array.from(errorSet).join('; ')}`, 400)
      }
      return data
    }
  }
  if (data.chose === 'sanxuat' || data.chose === 'chuyenkho' || data.chose === 'tieuhuy') {
    const inventory = await req.payload.findByID({
      collection: 'MaterialsAndMachine_Inventory',
      id: data.inventoryM,
    })
    if (data.materials?.materialsProduce?.length > 0) {
      const optionsMaterials = [
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
      const getMaterialDetails = (material: any) => {
        const materialId =
          typeof material.materialName === 'object' && material.materialName !== null
            ? material.materialName.id
            : material.materialName
        const materialSupplier =
          typeof material.suppliersMaterial === 'object' && material.suppliersMaterial !== null
            ? material.suppliersMaterial.id
            : material.suppliersMaterial
        const materialName =
          typeof material.materialName === 'object' && material.materialName !== null
            ? material.materialName.materialsName
            : material.materialName
        const materialSupplierName =
          typeof material.suppliersMaterial === 'object' && material.suppliersMaterial !== null
            ? material.suppliersMaterial.name
            : material.suppliersMaterial

        return { materialId, materialSupplier, materialName, materialSupplierName }
      }

      inventory.material?.forEach((dt) => {
        const { materialId, materialSupplier, materialName, materialSupplierName } =
          getMaterialDetails(dt)
        nameMaterialMap.set(`${materialId}-${materialSupplier}`, {
          ...dt,
          materialName,
          materialSupplierName,
        })
        inventoryMap.set(`${materialId}-${materialSupplier}-${dt.unitMaterial}`, {
          ...dt,
        })
      })
      if (operation === 'create') {
        data.materials?.materialsProduce.map((pc: any, index: number) => {
          const key = `${pc.materialsName}-${pc.suppliersMaterials}-${pc.unitsMaterials}`
          const keyName = `${pc.materialsName}-${pc.suppliersMaterials}`
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          const dt = inventoryMap.get(key)
          const name = nameMaterialMap.get(keyName)
          const label = optionsMaterials.find((u) => u === pc.unitsMaterials)?.label
          if (!dt) {
            if (name) {
              errorSet.add(
                `Vật liệu ${name.materialName} đơn vị ${label} với nhà cung cấp: ${name.materialSupplierName} không có trong kho`,
              )
            }
          } else {
            dt.soluongMaterial -= pc.soluongMaterials
            if (dt.soluongMaterial < 0) {
              errorSet.add(
                `Vật liệu ${name.materialName} đơn vị ${label} với nhà cung cấp: ${name.materialSupplierName} không đủ số lượng`,
              )
            }
          }
          if (
            !pc.unitsMaterials ||
            !pc.suppliersMaterials ||
            !pc.materialsName ||
            !pc.soluongMaterials
          ) {
            count++
          }
          errorCount.set(KeyCheckEmty, count)
          if (count > 0) {
            const message = `Vật liệu ${index + 1}`
            if (!error.includes(message)) {
              error.push(message)
            }
          }
        })
        if (error.length > 0) {
          throw new APIError(`Lỗi thiếu thông tin vật liệu: ${error.join(', ')}`, 400)
        }
        if (errorSet.size > 0) {
          throw new APIError(`Lỗi vật liệu: ${Array.from(errorSet).join('; ')}`, 400)
        }
        return data
      }
      if (operation === 'update') {
        const errorMaterials = new Set<string>()
        data.materials?.materialsProduce.map((pc: any, index: number) => {
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          const originalDocs =
            originalDoc.materials?.materialsProduce.find((od: any) => od?.id === pc?.id) || null
          if (!originalDocs || originalDocs === null) {
            const key = `${pc.materialsName}-${pc.suppliersMaterials}-${pc.unitsMaterials}`
            const keyName = `${pc.materialsName}-${pc.suppliersMaterials}`
            const dt = inventoryMap.get(key)
            const name = nameMaterialMap.get(keyName)
            const label = optionsMaterials.find((u) => u === pc.unitsMaterials)?.label
            if (!dt) {
              if (name) {
                errorSet.add(
                  `Vật liệu ${name.materialName} đơn vị ${label} với nhà cung cấp ${name.materialSupplierName} không có trong kho`,
                )
              }
            } else {
              dt.soluongMaterial -= pc.soluongMaterials
              if (dt.soluongMaterial < 0) {
                errorSet.add(
                  `Vật liệu ${name.materialName} đơn vị ${label} với nhà cung cấp ${name.materialSupplierName} không đủ số lượng`,
                )
              }
            }
          } else {
            if (
              originalDocs.soluongMaterials !== pc.soluongMaterials ||
              originalDocs.materialsName !== pc.materialsName ||
              originalDocs.suppliersMaterials !== pc.suppliersMaterials ||
              originalDocs.unitsMaterials !== pc.unitsMaterials
            ) {
              errorMaterials.add(`Vật liệu ${index + 1}`)
            }
          }
          if (
            !pc.unitsMaterials ||
            !pc.suppliersMaterials ||
            !pc.materialsName ||
            !pc.soluongMaterials
          ) {
            count++
          }
          errorCount.set(KeyCheckEmty, count)
          if (count > 0) {
            const message = `Vật liệu ${index + 1}`
            if (!error.includes(message)) {
              error.push(message)
            }
          }
        })
        if (error.length > 0) {
          throw new APIError(`Lỗi thiếu thông tin vật liệu: ${error.join(', ')}`, 400)
        }
        if (errorMaterials.size > 0) {
          throw new APIError(
            `Lỗi chỉnh sửa vật liệu: ${Array.from(errorMaterials).join('; ')}`,
            400,
          )
        }
        if (errorSet.size > 0) {
          throw new APIError(`Lỗi vật liệu: ${Array.from(errorSet).join('; ')}`, 400)
        }
        return data
      }
    }
    if (data.machine?.machinesProduce?.length !== 0) {
      const optionsMachine = [
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
      const getMachineDetails = (machine: any) => {
        const machineId =
          typeof machine.machineName === 'object' && machine.machineName !== null
            ? machine.machineName.id
            : machine.machineName
        const machineSupplier =
          typeof machine.suppliersMachine === 'object' && machine.suppliersMachine !== null
            ? machine.suppliersMachine.id
            : machine.suppliersMachine
        const machineName =
          typeof machine.machineName === 'object' && machine.machineName !== null
            ? machine.machineName.nameMachine
            : machine.machineName
        const machineSupplierName =
          typeof machine.suppliersMachine === 'object' && machine.suppliersMachine !== null
            ? machine.suppliersMachine.name
            : machine.suppliersMachine

        return { machineId, machineSupplier, machineName, machineSupplierName }
      }
      inventory.machine?.forEach((dt) => {
        const { machineId, machineSupplier, machineName, machineSupplierName } =
          getMachineDetails(dt)
        nameMaterialMap.set(`${machineId}-${machineSupplier}`, {
          ...dt,
          machineName,
          machineSupplierName,
        })
        inventoryMap.set(`${machineId}-${machineSupplier}-${dt.unitMachine}`, {
          ...dt,
        })
      })
      if (operation === 'create') {
        data.machine?.machinesProduce.map((pc: any, index: number) => {
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          const key = `${pc.machinesName}-${pc.suppliersMachines}-${pc.unitsMachines}`
          const keyName = `${pc.machinesName}-${pc.suppliersMachines}`
          const dt = inventoryMap.get(key)
          const name = nameMaterialMap.get(keyName)
          const label = optionsMachine.find((u) => u === pc.unitsMachines)?.label
          if (!dt) {
            if (name) {
              errorSet.add(
                `Máy móc ${name.machineName} đơn vị ${label} với nhà cung cấp ${name.machineSupplierName} không có trong kho`,
              )
            }
          } else {
            dt.soluongMachine -= pc.soluongMachines
            if (dt.soluongMachine < 0) {
              errorSet.add(
                `Máy móc ${name.machineName} đơn vị ${label} với nhà cung cấp ${name.machineSupplierName} không đủ số lượng`,
              )
            }
          }
          if (
            !pc.unitsMachines ||
            !pc.suppliersMachines ||
            !pc.machinesName ||
            !pc.soluongMachines
          ) {
            count++
          }
          errorCount.set(KeyCheckEmty, count)
          if (count > 0) {
            const message = `Máy móc ${index + 1}`
            if (!error.includes(message)) {
              error.push(message)
            }
          }
        })
        if (error.length > 0) {
          throw new APIError(`Lỗi thiếu thông tin Máy móc: ${error.join(', ')}`, 400)
        }
        if (errorSet.size > 0) {
          throw new APIError(`Lỗi máy móc:${Array.from(errorSet).join('; ')}`, 400)
        }
        return data
      }
      if (operation === 'update') {
        const errorMaterials = new Set<string>()
        data.machine?.machinesProduce.map((pc: any, index: number) => {
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          const originalDocs =
            originalDoc.machine?.machinesProduce.find((od: any) => od?.id === pc?.id) || null
          if (!originalDocs || originalDocs === null) {
            const key = `${pc.machinesName}-${pc.suppliersMachines}-${pc.unitsMachines}`
            const keyName = `${pc.machinesName}-${pc.suppliersMachines}`
            const dt = inventoryMap.get(key)
            const name = nameMaterialMap.get(keyName)
            const label = optionsMachine.find((u) => u === pc.unitsMachines)?.label
            if (!dt) {
              if (name) {
                errorSet.add(
                  `Máy móc ${name.machineName} đơn vị ${label} với nhà cung cấp ${name.machineSupplierName} không có trong kho`,
                )
              }
            } else {
              dt.soluongMachine -= pc.soluongMachines
              if (dt.soluongMachine < 0) {
                errorSet.add(
                  `Máy móc ${name.machineName} đơn vị ${label} với nhà cung cấp ${name.machineSupplierName} không đủ số lượng`,
                )
              }
            }
          } else {
            if (
              originalDocs.soluongMachines !== pc.soluongMachines ||
              originalDocs.machinesName !== pc.machinesName ||
              originalDocs.suppliersMachines !== pc.suppliersMachines ||
              originalDocs.unitsMachines !== pc.unitsMachines
            ) {
              errorMaterials.add(`Máy móc ${index + 1}`)
            }
          }
          if (
            !pc.unitsMachines ||
            !pc.suppliersMachines ||
            !pc.machinesName ||
            !pc.soluongMachines
          ) {
            count++
          }
          errorCount.set(KeyCheckEmty, count)
          if (count > 0) {
            const message = `Máy móc ${index + 1}`
            if (!error.includes(message)) {
              error.push(message)
            }
          }
        })
        if (error.length > 0) {
          throw new APIError(`Lỗi thiếu thông tin Máy móc: ${error.join(', ')}`, 400)
        }
        if (errorMaterials.size > 0) {
          throw new APIError(`Lỗi chỉnh sửa máy móc: ${Array.from(errorMaterials).join('; ')}`, 400)
        }
        if (errorSet.size > 0) {
          throw new APIError(`Lỗi máy móc: ${Array.from(errorSet).join('; ')}`, 400)
        }
        return data
      }
    }
  }
}
export const rondomID: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.goodsDeliveryNoteID) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.goodsDeliveryNoteID = `XH${numberOnly.substring(0, 10)}`
  }
}
export const checkValue: CollectionBeforeValidateHook = ({ data, operation, originalDoc }) => {
  if (!data) return
  const error = new Set<string>()
  const requiredFieldsMap = {
    default: ['date', 'chose', 'shipper', 'employee', 'voucherMaker'],
    tieuhuysanpham: ['date', 'inventory', 'shipper', 'employee', 'voucherMaker'],
    order: ['date', 'inventory', 'order', 'shipper', 'employee', 'voucherMaker'],
    chuyenkhosanpham: [
      'date',
      'inventory',
      'inventoryProduc',
      'shipper',
      'employee',
      'voucherMaker',
    ],
    sanxuat: ['date', 'inventoryM', 'shipper', 'employee', 'voucherMaker'],
    tieuhuy: ['date', 'inventoryM', 'shipper', 'employee', 'voucherMaker'],
    chuyenkho: ['date', 'inventoryM', 'inventoryMTo', 'shipper', 'employee', 'voucherMaker'],
  }

  const labels = {
    date: 'Ngày nhập',
    chose: 'Loại xuất',
    shipper: 'Người giao hàng',
    employee: 'Người nhận hàng',
    voucherMaker: 'Người lập phiếu',
    inventory: 'Kho hàng sản phẩm',
    inventoryProduc: 'Kho hàng sản phẩm đến',
    inventoryM: 'Kho vật liệu và máy móc',
    inventoryMTo: 'Kho vật liệu và máy móc đến',
    order: 'Đơn hàng',
  }

  const requiredFields =
    requiredFieldsMap[data.chose as keyof typeof requiredFieldsMap] || requiredFieldsMap.default
  const missingFields = requiredFields
    .filter((field) => !data[field])
    .map((field) => labels[field as keyof typeof labels])

  if (missingFields.length > 0) {
    throw new APIError(`Không được để trống: ${missingFields.join(', ')}`, 400)
  }
  if (
    data.chose === 'order' ||
    data.chose === 'chuyenkhosanpham' ||
    data.chose === 'tieuhuysanpham'
  ) {
    if (data.produce.length === 0) {
      throw new APIError('Không được để trống san phẩm', 400)
    }
  }
  if (data.chose === 'sanxuat' || data.chose === 'chuyenkho' || data.chose === 'tieuhuy') {
    if (data.materials.materialsProduce.length === 0 && data.machine.machinesProduce.length === 0) {
      throw new APIError('Không được để trống cả vật liệu lẫn máy móc', 400)
    }
  }
  if (operation === 'update') {
    if (operation === 'update') {
      if (data.chose !== originalDoc.chose) {
        error.add('Không thể thay đổi loại xuất')
        return
      }

      switch (data.chose) {
        case 'chuyenkhosanpham':
          if (
            data.inventory !== originalDoc.inventory ||
            data.inventoryProduc !== originalDoc.inventoryProduc
          ) {
            error.add('Không được thay đổi kho hàng')
          }
          break

        case 'order':
        case 'tieuhuysanpham':
          if (data.inventory !== originalDoc.inventory) {
            error.add('Không được thay đổi kho hàng')
          }
          break

        case 'chuyenkho':
          if (
            data.inventoryM !== originalDoc.inventoryM ||
            data.inventoryMTo !== originalDoc.inventoryMTo
          ) {
            error.add('Không được thay đổi kho hàng')
          }
          break

        case 'sanxuat':
        case 'tieuhuy':
          if (data.inventoryM !== originalDoc.inventoryM) {
            error.add('Không được thay đổi kho hàng')
          }
          break
      }
    }
  }
}
export const updateReport: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data.produce) return data
  if (
    data.chose === 'order' ||
    data.chose === 'chuyenkhosanpham' ||
    data.chose === 'tieuhuysanpham'
  ) {
    const reportData: {
      [key: string]: { nameProduct: string; report: { unit: string; soluong: number }[] }
    } = {}

    data.produce.forEach((item: any) => {
      if (!item.sanpham || !item.soluong || !item.unti) return
      if (!reportData[item.sanpham]) {
        reportData[item.sanpham] = {
          nameProduct: item.sanpham,
          report: [],
        }
      }
      const existingUnit = reportData[item.sanpham].report.find((r) => r.unit === item.unti)

      if (existingUnit) {
        existingUnit.soluong += item.soluong
      } else {
        reportData[item.sanpham].report.push({
          unit: item.unti,
          soluong: item.soluong,
        })
      }
    })
    data.total = Object.values(reportData)
  }
  if (data.chose === 'sanxuat' || data.chose === 'chuyenkho' || data.chose === 'tieuhuy') {
    if (data.materials.materialsProduce.length !== 0) {
      const reportData: {
        [key: string]: {
          reportMaterialName: string
          report: { reportMaterialUnits: string; reportMaterialSoLuong: number }[]
        }
      } = {}
      data.materials.materialsProduce.forEach((dt: any) => {
        if (!dt.materialsName || !dt.soluongMaterials || !dt.unitsMaterials) return
        if (!reportData[dt.materialsName]) {
          reportData[dt.materialsName] = {
            reportMaterialName: dt.materialsName,
            report: [],
          }
        }
        const existingUnit = reportData[dt.materialsName].report.find(
          (r) => r.reportMaterialUnits === dt.unitsMaterials,
        )
        if (existingUnit) {
          existingUnit.reportMaterialSoLuong += dt.soluongMaterials
        }
        reportData[dt.materialsName].report.push({
          reportMaterialSoLuong: dt.soluongMaterials,
          reportMaterialUnits: dt.unitsMaterials,
        })
      })
      data.reportMaterial = Object.values(reportData)
    }
    if (data.machine.machinesProduce.length !== 0) {
      const reportData: {
        [key: string]: {
          reportMachinesName: string
          report: { reportMachinesUnits: string; reportMachinesSoLuong: number }[]
        }
      } = {}
      data.machine.machinesProduce.forEach((dt: any) => {
        if (!dt.machinesName || !dt.soluongMachines || !dt.unitsMachines) return
        if (!reportData[dt.machinesName]) {
          reportData[dt.machinesName] = {
            reportMachinesName: dt.machinesName,
            report: [],
          }
        }
        const existingUnit = reportData[dt.machinesName].report.find(
          (r) => r.reportMachinesUnits === dt.unitsMachines,
        )
        if (existingUnit) {
          existingUnit.reportMachinesSoLuong += dt.soluongMachines
        }
        reportData[dt.machinesName].report.push({
          reportMachinesSoLuong: dt.soluongMachines,
          reportMachinesUnits: dt.unitsMachines,
        })
      })
      data.reportMachines = Object.values(reportData)
    }
  }
  return data
}
export const checkTime: CollectionBeforeValidateHook = ({ data, originalDoc, operation }) => {
  if (!data) return
  const error: string[] = []
  const today = new Date()
  const threeDaysAgo = new Date()
  const oneNextDay = new Date()
  const inputDate = new Date(data.date)
  const inputOriginalDate = new Date(originalDoc.date)
  threeDaysAgo.setDate(today.getDate() - 3)
  oneNextDay.setDate(inputDate.getDate() + 1)
  const formatDate = (date: any) => {
    return new Date(date).toISOString().split('T')[0]
  }
  if (operation === 'create') {
    if (formatDate(inputDate) > formatDate(today)) {
      error.push('Ngày nhập không được ở tương lai.')
    }
    if (formatDate(inputDate) < formatDate(threeDaysAgo)) {
      error.push('Chỉ có thể tạo phiếu trong vòng 3 ngày trước.')
    }
    if (error.length > 0) {
      throw new APIError(`${error.join('; ')}`, 400)
    }
  }
  if (operation === 'update') {
    if (formatDate(inputOriginalDate) === formatDate(inputDate)) {
      if (today > oneNextDay) {
        error.push('Chỉ có thể sửa phiếu trong ngày hoặc ngày hôm sau.')
      }
    } else {
      error.push('Không thể sửa ngày nhập.')
    }
    if (error.length > 0) {
      throw new APIError(`${error.join('; ')}`, 400)
    }
  }
}
export const changeStatus: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.order) {
    await req.payload.update({
      collection: 'orders',
      id: doc.order,
      data: {
        status: 'da_giao',
      },
    })
  }
}
export const autoEmployee: CollectionBeforeValidateHook = ({ req, data }) => {
  if (!data) return
  const user = req.user
  if (!data.voucherMaker) {
    if (user?.employee?.typeDepartment === 'warehouse') data.voucherMaker = user?.id
  }
}
export const canRead: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
  const referer = (await headers()).get('referer')
  const isFromMedicalRecodsAdmin = referer?.includes('/admin/collections/orders') || false
  if (isFromMedicalRecodsAdmin) {
    return true
  }
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'warehouse' || user.employee?.typeDepartment === 'business')
    return true
  return false
}
export const canUpdate: Access = ({ req }) => {
  const user = req.user
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.employee?.typeDepartment === 'warehouse') {
    return true
  }
  return false
}
