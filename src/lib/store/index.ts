import type { TIconName } from '@/icons';

export type TProductCategory = `food` | `merch` | `perks` | `learning`;

export const PRODUCT_CATEGORIES: readonly TProductCategory[] = [
  `food`,
  `merch`,
  `perks`,
  `learning`,
];

/** Store category registry (Flyweight): the icon of each category. */
export const productCategoryIcons: Record<TProductCategory, TIconName> = {
  food: `coffee`,
  merch: `shirt`,
  perks: `gift`,
  learning: `book`,
};
