import { authLayerTables } from './tables'
import { authLayerFunctions } from './functions'
import { authLayerViews } from './views'
import { authLayerPolicies } from './policies'
import { authLayerSeed } from './seed'
import { authLayerGrants } from './grant'

export const authLayerMigrations = [
    ...authLayerTables,
    ...authLayerFunctions,
    ...authLayerViews,
    ...authLayerPolicies,
    ...authLayerSeed,
    ...authLayerGrants,
]
