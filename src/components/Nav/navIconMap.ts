import { CollectionSlug, GlobalSlug } from 'payload'
import {
  BookCopy,
  Image,
  List,
  User,
  ShieldUser,
  Palette,
  Building2,
  Factory,
  AlignLeft,
  Package,
  NotepadText,
  SquarePercent,
  BadgePercent,
  Boxes,
  Truck,
} from 'lucide-react'
import { IconPackageExport, IconPackageImport, IconBuildingWarehouse } from '@tabler/icons-react'
import { GrTask } from 'react-icons/gr'
import { FaBusinessTime } from 'react-icons/fa'
import { MdOutlineWarehouse, MdPrecisionManufacturing } from 'react-icons/md'
import { TbTransactionDollar } from 'react-icons/tb'
type LucideIcon = React.FC<React.ComponentProps<typeof BookCopy>>
type TablerIcon = typeof IconPackageExport
type NavIcon = LucideIcon | TablerIcon

export const navIconMap: Partial<Record<CollectionSlug | GlobalSlug, NavIcon>> = {
  colors: Palette,
  categories: List,
  subCategories: AlignLeft,
  customers: ShieldUser,
  media: Image,
  orders: BookCopy,
  users: User,
  department: Building2,
  factories: Factory,
  goodsDeliveryNote: IconPackageExport,
  goodsReceiveNote: IconPackageImport,
  products: Package,
  tasks: GrTask,
  WorkTime: FaBusinessTime,
  ProductionPlans: NotepadText,
  Products_Inventory: IconBuildingWarehouse,
  MaterialsAndMachine_Inventory: MdOutlineWarehouse,
  transactions: TbTransactionDollar,
  materialAndMachinePrice: SquarePercent,
  productprices: BadgePercent,
  machine: MdPrecisionManufacturing,
  materials: Boxes,
  Suppliers: Truck,
}
export const getNavIcon = (slug: string): NavIcon | undefined =>
  Object.hasOwn(navIconMap, slug) ? navIconMap[slug as CollectionSlug | GlobalSlug] : undefined
