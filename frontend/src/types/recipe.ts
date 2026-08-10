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

export type IngredientIssueReason =
  | "missing"
  | "insufficient"
  | "conversion_unavailable";


export type MissingIngredient = {
  id: string;
  name: string;

  quantity: number | string;
  unit: string;

  required_grams: number | string | null;
  available_grams: number | string | null;
  shortage_grams: number | string | null;

  reason: IngredientIssueReason;
};


export type RecipeMatch = {
  recipe: Recipe;

  total_ingredients: number;
  matched_ingredients: number;

  match_percentage: number | string;

  can_cook: boolean;

  missing_ingredients: MissingIngredient[];

  expiration_score: number | string;

  expiring_ingredients: ExpiringIngredient[];
};

export type ExpiringIngredient = {
  id: string;
  name: string;

  expiration_date: string;
  days_until_expiration: number;

  quantity_used_grams: number | string;
  urgency_score: number | string;
};