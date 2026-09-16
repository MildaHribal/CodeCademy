export type Tag = 'maso' | 'bezmasa' | 'ryba' | 'moucnik';

export type Ingredient = {
  name: string;
  amount: number;
  unit: string;
};

export type Recipe = {
  id: number;
  name: string;
  tag: Tag;
  minutes: number;
  portions: number;
  ingredients: Ingredient[];
};

export type RecipeFilter = {
  query?: string;
  tag?: string;
  maxMinutes?: number;
};

/** Klíč je den (`po`…`ne`), hodnota jsou id receptů na ten den. */
export type Plan = Record<string, number[]>;

export type ShoppingItem = {
  name: string;
  amount: number;
  unit: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
};
