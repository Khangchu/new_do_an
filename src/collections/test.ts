import { getTenantAccess } from '@payloadcms/plugin-multi-tenant/utilities'
import { CollectionConfig } from 'payload'

export const test: CollectionConfig = {
  slug: 'test',
  fields: [
    {
      name: 'isShared',
      type: 'checkbox',
      defaultValue: false,
      // you likely want to set access control on fields like this
      // to prevent just any user from modifying it
    },
  ],
}
