export type Ingredient = {
  id: string;
  name: string;
  category: string | null;
  default_unit: string;
};


export type PantryItem = {
  id: string;
  quantity: number;
  unit: string;
  expiration_date: string | null;
  ingredient: Ingredient;
  created_at: string;
  updated_at: string;
};