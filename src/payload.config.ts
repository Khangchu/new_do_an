// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { department } from './collections/Department'
import { Tasks } from './collections/Tasks'
import { WorkTime } from './collections/WorkTime'
import { SubCategories } from './collections/SubCategories'
import { Products } from './collections/Products'
import { Materials } from './collections/Materials'
import { machine } from './collections/Machine'
import { Categories } from './collections/ParentCategories'
import { Colors } from './collections/Colors'
import { Products_Inventory } from './collections/Products_Inventory'
import { Suppliers } from './collections/Suppliers'
import { MaterialsAndMachine_Inventory } from './collections/MaterialsAndMachine_Inventory'
import { goodsDeliveryNote } from './collections/GoodsDeliveryNote'
import { goodsReceivedNote } from './collections/GoodsReceivedNote'
import { Orders } from './collections/Orders'
import { ProductionPlans } from './collections/ProductionPlans'
import { MaterialPrices } from './collections/MaterialPrices'
import { customers } from './collections/Customers'
import { ProductPrices } from './collections/ProductPrices'
import Transactions from './collections/Transactions'
import Factories from './collections/Factories'
import { en } from 'payload/i18n/en'
import { vi } from 'payload/i18n/vi'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: '/components/Dashboard#Dashboard',
        },
      },
      graphics: {
        Icon: '/components/Logo#Icon',
        Logo: '/components/Logo#Logo',
      },
      beforeLogin: ['/components/BeforeLogin#BeforeLogin'],
      Nav: '/components/Nav#Nav',
    },
    avatar: {
      Component: '/components/Avatar#Avatar',
    },
    theme: 'dark',
  },
  i18n: {
    supportedLanguages: { vi, en }, // <-- Corrected to use objects matching the expected type
  },
  collections: [
    Users,
    Media,
    department,
    Tasks,
    WorkTime,
    SubCategories,
    Categories,
    Products,
    machine,
    Materials,
    Colors,
    Suppliers,
    MaterialsAndMachine_Inventory,
    goodsDeliveryNote,
    goodsReceivedNote,
    Orders,
    ProductionPlans,
    MaterialPrices,
    customers,
    ProductPrices,
    Transactions,
    Products_Inventory,
    Factories,
  ],

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
