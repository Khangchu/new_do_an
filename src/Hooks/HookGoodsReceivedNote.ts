/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionBeforeValidateHook,
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionAfterReadHook,
  APIError,
  Access,
} from 'payload'
import { v4 as uuidv4 } from 'uuid'
export const showTitle: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (data.goodsReceivedNoteId) {
    data.title = data.goodsReceivedNoteId
  }
}
export const rondomID: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  if (!data.goodsReceivedNoteId) {
    const numberOnly = uuidv4().replace(/\D/g, '')
    data.goodsReceivedNoteId = `NH${numberOnly.substring(0, 10)}`
  }
}
export const showPrice: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return
  if (data.chose === 'vatlieuvamaymoc') {
    const inventory = await req.payload.findByID({
      collection: 'MaterialsAndMachine_Inventory',
      id: data.inventory,
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
  if (data.chose === 'sanpham') {
    const inventoryProduce = await req.payload.findByID({
      collection: 'Products_Inventory',
      id: data.inventoryProduce,
    })
    if (data.produce.produce1.length !== 0) {
      if (operation === 'create') {
        data.produce.produce1.forEach((dt: any) => {
          inventoryProduce.catalogueOfGoods?.forEach((pc) => {
            const produceId =
              typeof pc.productId === 'object' && pc.productId !== null
                ? pc.productId.id
                : pc.productId
            if (produceId === dt.sanpham && pc.danhmuc?.unti === dt.unti) {
              dt.cost = pc.importPrice
              dt.rate = pc.unitPrice
            }
          })
        })
      }
      if (operation === 'update') {
        data.produce.produce1.forEach((dt: any) => {
          inventoryProduce.catalogueOfGoods?.forEach((pc) => {
            const originalDocs =
              originalDoc.produce.produce1.find((od: any) => od?.id === pc?.id) || null
            if (!originalDocs || originalDocs === null) {
              const produceId =
                typeof pc.productId === 'object' && pc.productId !== null
                  ? pc.productId.id
                  : pc.productId
              if (produceId === dt.sanpham && pc.danhmuc?.unti === dt.unti) {
                dt.cost = pc.importPrice
                dt.rate = pc.unitPrice
              }
            }
          })
        })
      }
    }
  }
}
export const totalPrice: CollectionAfterReadHook = async ({ doc }) => {
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
  if (doc.chose === 'vatlieuvamaymoc') {
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
  if (doc.chose === 'sanpham') {
    if (doc.produce.produce1.length !== 0) {
      doc.produce.produce1.forEach((dt: any) => {
        if (dt.soluong && dt.cost) {
          const totalProduce = convertToNumber(dt.cost) * dt.soluong
          dt.totalProduc = formatNumber(totalProduce)
        }
      })
    }
  }
}
export const setUpdateSoluong: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  if (!doc) return

  if (doc.chose === 'vatlieuvamaymoc') {
    const inventory = await req.payload.findByID({
      collection: 'MaterialsAndMachine_Inventory',
      id: doc.inventory,
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
            const remainingAmount = (dt.soluongMaterial || 0) + totalSoluong
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
          id: doc.inventory,
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
            const remainingAmount = (dt.soluongMaterial || 0) + totalNewSoluong
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
          id: doc.inventory,
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
            const remainingAmount = (dt.soluongMachine || 0) + totalSoluong
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
          id: doc.inventory,
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
            const newProducts = machinesProduce.filter(
              (pc: any) =>
                !previousDoc.machine.machinesProduce.some((prev: any) => prev.id === pc.id),
            )
            const totalSoluong = newProducts.reduce(
              (sum: number, value: any) => sum + value.soluongMachines,
              0,
            )
            if (!newProducts.length) return dt
            const remainingAmount = (dt.soluongMachine || 0) + totalSoluong
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
          id: doc.inventory,
          data: {
            machine: updateSoluong,
          },
        })
      }
    }
  }
  if (doc.chose === 'sanpham') {
    const inventoryProduce = await req.payload.findByID({
      collection: 'Products_Inventory',
      id: doc.inventoryProduce,
    })
    if (doc.produce.produce1.length && inventoryProduce.catalogueOfGoods?.length) {
      if (operation === 'create') {
        const updateSoluong = await Promise.all(
          inventoryProduce.catalogueOfGoods.map((dt) => {
            const produceId =
              typeof dt.productId === 'object' && dt.productId !== null
                ? dt.productId.id
                : dt.productId
            const findProduce = doc.produce.produce1.filter(
              (pc: any) => produceId === pc.sanpham && dt.danhmuc?.unti === pc.unti,
            )
            const matchingSoluong = findProduce.flatMap((mp: any) => mp.soluong)
            const totalSoluong = matchingSoluong.reduce(
              (sum: number, value: number) => sum + value,
              0,
            )
            const remainingAmount = (dt.danhmuc?.amount || 0) + totalSoluong
            if (remainingAmount < 0) {
              return dt
            }
            return {
              ...dt,
              danhmuc: {
                amount: remainingAmount,
              },
            }
          }),
        )
        await req.payload.update({
          collection: 'Products_Inventory',
          id: doc.inventoryProduce,
          data: {
            catalogueOfGoods: updateSoluong,
          },
        })
      }
      if (operation === 'update') {
        const updateSoluong = await Promise.all(
          inventoryProduce.catalogueOfGoods.map((dt) => {
            const produceId =
              typeof dt.productId === 'object' && dt.productId !== null
                ? dt.productId.id
                : dt.productId
            const findProduce = doc.produce.produce1.filter(
              (pc: any) => produceId === pc.sanpham && dt.danhmuc?.unti === pc.unti,
            )
            const newProducts = findProduce.filter(
              (pc: any) => !previousDoc.produce.produce1.some((prev: any) => prev.id === pc.id),
            )
            if (!newProducts.length) return dt
            const totalNewSoluong = newProducts.reduce(
              (sum: number, np: any) => sum + np.soluong,
              0,
            )
            const remainingAmount = (dt.danhmuc?.amount || 0) + totalNewSoluong
            if (remainingAmount < 0) {
              return dt
            }
            return {
              ...dt,
              danhmuc: {
                amount: remainingAmount,
              },
            }
          }),
        )
        await req.payload.update({
          collection: 'Products_Inventory',
          id: doc.inventoryProduce,
          data: {
            catalogueOfGoods: updateSoluong,
          },
        })
      }
    }
  }
}
export const showReport: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return
  if (doc.materials.materialsProduce.length !== 0) {
    const reportData: {
      [key: string]: {
        reportMaterialName: string
        report: { reportMaterialUnits: string; reportMaterialSoLuong: number }[]
      }
    } = {}
    doc.materials.materialsProduce.forEach((dt: any) => {
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
    doc.report.reportMaterial = Object.values(reportData)
  }
  if (doc.machine.machinesProduce.length !== 0) {
    const reportData: {
      [key: string]: {
        reportMachinesName: string
        report: { reportMachinesUnits: string; reportMachinesSoLuong: number }[]
      }
    } = {}
    doc.machine.machinesProduce.forEach((dt: any) => {
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
    doc.report.reportMachines = Object.values(reportData)
  }
  if (doc.produce.produce1.length !== 0) {
    const reportData: {
      [key: string]: { nameProduct: string; report: { unit: string; soluong: number }[] }
    } = {}
    doc.produce.produce1.forEach((dt: any) => {
      if (!dt.sanpham || !dt.soluong || !dt.unti) return
      if (!reportData[dt.sanpham]) {
        reportData[dt.sanpham] = {
          nameProduct: dt.sanpham,
          report: [],
        }
      }
      const existingUnit = reportData[dt.sanpham].report.find((r) => r.unit === dt.unti)
      if (existingUnit) {
        existingUnit.soluong += dt.soluong
      }
      reportData[dt.sanpham].report.push({
        unit: dt.unti,
        soluong: dt.soluong,
      })
    })
    doc.report.total = Object.values(reportData)
  }
  return doc
}
export const reportTotalPrice: CollectionAfterReadHook = ({ doc }) => {
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
  if (
    doc.materials.materialsProduce.length ||
    doc.machine?.machinesProduce.length ||
    doc.produce.produce1.length
  ) {
    const exchangeRate = 25000
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
    const totalProduceVnd = doc.produce.produce1
      .filter((dt: any) => dt.rate === 'VND')
      .flatMap((pc: any) => pc.totalProduc)
    const totalProduceUsd = doc.produce.produce1
      .filter((dt: any) => dt.rate === 'USD')
      .flatMap((pc: any) => pc.totalProduc)
    if (doc.report.rateValue === 'VND') {
      const totalValueMateria = [
        ...totalValueMaterialVnd.map((value: any) => convertToNumber(value)),
        ...totalValueMaterialUsd.map((value: any) => convertToNumber(value) * exchangeRate),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValueMachine = [
        ...totalMachineVnd.map((value: any) => convertToNumber(value)),
        ...totalMachineUsd.map((value: any) => convertToNumber(value) * exchangeRate),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValueProduce = [
        ...totalProduceVnd.map((value: any) => convertToNumber(value)),
        ...totalProduceUsd.map((value: any) => convertToNumber(value) * exchangeRate),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValue = totalValueMachine + totalValueMateria + totalValueProduce
      doc.report.totalValue = formatNumber(totalValue)
      return doc
    }
    if (doc.report.rateValue === 'USD') {
      const totalValueMateria = [
        ...totalValueMaterialVnd.map((value: any) => convertToNumber(value) / exchangeRate),
        ...totalValueMaterialUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValueMachine = [
        ...totalMachineVnd.map((value: any) => convertToNumber(value) / exchangeRate),
        ...totalMachineUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValueProduce = [
        ...totalProduceVnd.map((value: any) => convertToNumber(value) / exchangeRate),
        ...totalProduceUsd.map((value: any) => convertToNumber(value)),
      ].reduce((sum: number, value: number) => sum + value, 0)
      const totalValue = totalValueMachine + totalValueMateria + totalValueProduce
      doc.report.totalValue = formatNumber(totalValue)
      return doc
    }
  }
}
export const checkSoluong: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return
  const inventoryMap = new Map()
  const errorSet = new Set<string>()
  const nameMaterialMap = new Map()
  const nameProductMap = new Map()
  const error: string[] = []
  const errorCount = new Map<string, number>()
  if (data.chose === 'vatlieuvamaymoc') {
    const inventory = await req.payload.findByID({
      collection: 'MaterialsAndMachine_Inventory',
      id: data.inventory,
    })
    if (data.materials?.materialsProduce?.length) {
      const optionsMaterial = [
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
          const dt = inventoryMap.get(key)
          const name = nameMaterialMap.get(keyName)
          const KeyCheckEmty = pc.id
          let count = errorCount.get(KeyCheckEmty) || 0
          const label = optionsMaterial.find((u) => u === pc.unitsMaterials)?.label
          if (!dt) {
            if (name) {
              errorSet.add(
                `Vật liệu ${name.materialName} đơn vị ${label} với nhà cung cấp ${name.materialSupplierName} không có trong kho`,
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
            const label = optionsMaterial.find((u) => u === pc.unitsMaterials)?.label
            if (!dt)
              if (name) {
                errorSet.add(
                  `Vật liệu ${name.materialName} đơn vị ${label} với nhà cung cấp ${name.materialSupplierName} không có trong kho`,
                )
              }
          } else {
            if (
              originalDocs.soluongMaterials !== pc.soluongMaterials ||
              originalDocs.materialsName !== pc.materialsName ||
              originalDocs.suppliersMaterials !== pc.suppliersMaterials ||
              originalDocs.unitsMaterials !== pc.unitsMaterials
            ) {
              errorMaterials.add('Không được chỉnh sửa phiểu đã tạo')
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
            }
          } else {
            if (
              originalDocs.soluongMachines !== pc.soluongMachines ||
              originalDocs.machinesName !== pc.machinesName ||
              originalDocs.suppliersMachines !== pc.suppliersMachines ||
              originalDocs.unitsMachines !== pc.unitsMachines
            ) {
              errorMaterials.add('Không được chỉnh sửa phiểu đã tạo')
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
  if (data.chose === 'sanpham') {
    const inventoryProduce = await req.payload.findByID({
      collection: 'Products_Inventory',
      id: data.inventoryProduce,
    })
    inventoryProduce.catalogueOfGoods?.forEach((dt) => {
      const productId =
        typeof dt.productId === 'object' && dt.productId !== null ? dt.productId.id : dt.productId
      const productName =
        typeof dt.productId === 'object' && dt.productId !== null
          ? dt.productId.nameProduct
          : 'Sản phẩm không xác định'
      inventoryMap.set(`${productId}-${dt.danhmuc?.unti}`, { ...dt, productName })
    })
    inventoryProduce.catalogueOfGoods?.forEach((inven) => {
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
      data?.produce.produce1.map(async (pc: any, index: number) => {
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
      })
      if (error.length > 0) {
        throw new APIError(`Lỗi thiếu thông tin sản phẩm: ${error.join(', ')}`, 400)
      }
      if (errorSet.size > 0) {
        throw new APIError(`Lỗi Sản phẩm: ${Array.from(errorSet).join('; ')}`, 400)
      }
    }
    if (operation === 'update') {
      const errorMaterials = new Set<string>()
      await Promise.all(
        data?.produce.produce1.map(async (pc: any, index: number) => {
          const originalDocs = originalDoc?.produce.produce1.find((od: any) => od?.id === pc?.id)
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
              errorMaterials.add('Không được chỉnh sửa phiểu đã tạo')
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
    }
    return data
  }
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
export const checkInfo: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return
  const requiredFields = {
    date: 'Ngày nhập',
    shipper: 'Người giao hàng',
    chose: 'Loại xuất',
  }

  const error = Object.entries(requiredFields)
    .filter(([key]) => !data[key])
    .map(([, label]) => label)

  if (error.length > 0) {
    throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
  }
  if (data.chose === 'vatlieuvamaymoc') {
    const requiredFields = {
      date: 'Ngày nhập',
      shipper: 'Người giao hàng',
      inventory: 'Kho hàng',
    }

    const error = Object.entries(requiredFields)
      .filter(([key]) => !data[key])
      .map(([, label]) => label)

    if (error.length > 0) {
      throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
    }
    if (data.materials.materialsProduce.length === 0 && data.machine.machinesProduce.length === 0) {
      throw new APIError('Không được để trống cả vật liệu lẫn máy móc', 400)
    }
  }
  if (data.chose === 'sanpham') {
    const requiredFields = {
      date: 'Ngày nhập',
      shipper: 'Người giao hàng',
      inventoryProduce: 'Kho hàng',
    }

    const error = Object.entries(requiredFields)
      .filter(([key]) => !data[key])
      .map(([, label]) => label)

    if (error.length > 0) {
      throw new APIError(`Không được để trống: ${error.join(', ')}`, 400)
    }
    if (data.produce.produce1.length === 0) {
      throw new APIError('Không được để trống san phẩm', 400)
    }
  }
}
export const autoEmployee: CollectionBeforeValidateHook = ({ req, data }) => {
  if (!data) return
  const user = req.user
  if (!data.voucherMaker) {
    data.voucherMaker = user?.id
  }
}
export const canRead: Access = async ({ req }) => {
  const user = req?.user
  if (!user) return false
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
