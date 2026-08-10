import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../lib/api";

import type {
  Recipe,
  RecipeNutrition,
} from "../types/recipe";


function formatIngredientName(
  name: string
) {
  return name
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}


function formatNumber(
  value: number | string
) {
  return Number(
    value
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 1,
    }
  );
}


export default function RecipeDetails() {
  const { recipeId } = useParams();


  const [
    recipe,
    setRecipe,
  ] = useState<Recipe | null>(
    null
  );

  const [
    nutrition,
    setNutrition,
  ] = useState<RecipeNutrition | null>(
    null
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    let ignore = false;


    const fetchRecipe = async () => {
      if (!recipeId) {
        setError(
          "Recipe ID is missing."
        );

        setIsLoading(false);

        return;
      }


      try {
        setError("");


        const [
          recipeResponse,
          nutritionResponse,
        ] = await Promise.all([
          api.get<Recipe>(
            `/recipes/${recipeId}`
          ),

          api.get<RecipeNutrition>(
            `/recipes/${recipeId}/nutrition`
          ),
        ]);


        if (!ignore) {
          setRecipe(
            recipeResponse.data
          );

          setNutrition(
            nutritionResponse.data
          );
        }

      } catch {
        if (!ignore) {
          setError(
            "Unable to load recipe."
          );
        }

      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };


    fetchRecipe();


    return () => {
      ignore = true;
    };
  }, [recipeId]);


  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

        <p className="text-slate-500">
          Loading recipe...
        </p>

      </div>
    );
  }


  if (
    error ||
    !recipe
  ) {
    return (
      <div>

        <Link
          to="/recipes"
          className="text-sm font-medium text-emerald-600"
        >
          ← Back to Recipes
        </Link>


        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">

          <p className="font-medium text-red-700">
            Recipe unavailable
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error ||
              "Recipe could not be found."}
          </p>

        </div>

      </div>
    );
  }


  return (
    <div>

      <Link
        to="/recipes"
        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        ← Back to Recipes
      </Link>


      {/* Recipe Header */}
      <div className="mt-6">

        <p className="text-sm font-medium text-emerald-600">
          Recipe
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {recipe.name}
        </h1>

        {recipe.description && (
          <p className="mt-3 max-w-3xl leading-7 text-slate-500">
            {recipe.description}
          </p>
        )}

      </div>


      {/* Recipe information */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Servings
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {recipe.servings}
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Prep Time
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {recipe.prep_minutes} min
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Cook Time
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {recipe.cook_minutes} min
          </p>
        </div>

      </div>


      {/* Nutrition */}
      <section className="mt-8">

        <h2 className="text-xl font-semibold text-slate-900">
          Nutrition
        </h2>


        {nutrition?.nutrition_available &&
        nutrition.per_serving ? (

          <>

            <p className="mt-1 text-sm text-slate-500">
              Estimated per serving
            </p>


            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Calories
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatNumber(
                    nutrition
                      .per_serving
                      .calories
                  )}
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Protein
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatNumber(
                    nutrition
                      .per_serving
                      .protein
                  )}{" "}
                  g
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Carbs
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatNumber(
                    nutrition
                      .per_serving
                      .carbs
                  )}{" "}
                  g
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Fat
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatNumber(
                    nutrition
                      .per_serving
                      .fat
                  )}{" "}
                  g
                </p>
              </div>

            </div>

          </>

        ) : (

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <p className="font-medium text-amber-800">
              Nutrition data incomplete
            </p>

            <p className="mt-2 text-sm text-amber-700">
              PantryFuel needs nutrition
              information for:
            </p>


            <div className="mt-3 flex flex-wrap gap-2">

              {nutrition
                ?.missing_ingredients
                .map(
                  (ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-full bg-white px-3 py-1 text-sm text-amber-700"
                    >
                      {formatIngredientName(
                        ingredient
                      )}
                    </span>
                  )
                )}

            </div>

          </div>

        )}

      </section>


      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">

        {/* Ingredients */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold text-slate-900">
            Ingredients
          </h2>


          <div className="mt-5 divide-y divide-slate-100">

            {recipe.recipe_ingredients.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >

                  <p className="font-medium text-slate-800">
                    {formatIngredientName(
                      item.ingredient.name
                    )}
                  </p>


                  <p className="shrink-0 text-sm text-slate-500">
                    {formatNumber(
                      item.quantity
                    )}{" "}
                    {item.unit}
                  </p>

                </div>
              )
            )}

          </div>

        </section>


        {/* Instructions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold text-slate-900">
            Instructions
          </h2>

          <p className="mt-5 whitespace-pre-line leading-7 text-slate-600">
            {recipe.instructions}
          </p>

        </section>

      </div>

    </div>
  );
}