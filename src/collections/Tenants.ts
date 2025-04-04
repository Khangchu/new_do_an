import { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: 'Tenant',
    plural: 'Tenants',
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Tên Tenant',
      type: 'text',
      required: true,
    },
    {
      name: 'domains',
      label: 'Tên miền',
      type: 'array',
      fields: [{ name: 'domain', type: 'text', required: true }],
    },
  ],
}

export default Tenants
