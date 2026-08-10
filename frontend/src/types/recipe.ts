export type RecipeIngredientDetail = {
  id: string;
  name: string;
  category: string | null;
  default_unit: string;
};


export type RecipeIngredient = {
  id: string;
  quantity: number;
  unit: string;
  position: number;
  ingredient: RecipeIngredientDetail;
};


export type Recipe = {
  id: string;

  name: string;
  description: string | null;
  instructions: string;

  servings: number;
  prep_minutes: number;
  cook_minutes: number;

  recipe_ingredients: RecipeIngredient[];

  created_at: string;
  updated_at: string;
};


export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};


export type RecipeNutrition = {
  recipe_id: string;
  recipe_name: string;
  servings: number;

  nutrition_available: boolean;
  missing_ingredients: string[];

  total: MacroTotals | null;
  per_serving: MacroTotals | null;
};