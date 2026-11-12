import type { ProductNaming } from '@mixo-geocore/editing/project';

/*
 * This app's own name and project extension, in one place.
 *
 * GEO-011: these were the literals "mixoDental" and ".mixodental" inside i18n KEYS in the shared
 * editing package, so the other consuming app would have had to ship a locale entry saying
 * "mixoDental" in order to translate its own Open/Save hints. The packages now take them as data
 * and the app passes them once - here. The hint keys read `{ext}`, so changing this file changes
 * what every one of those hints says, in all three languages, with no locale edit.
 */
export const PRODUCT_NAMING: ProductNaming = { product: 'mixoDental', ext: '.mixodental' };
