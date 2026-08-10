import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../lib/api";

import type {
  Recipe,
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


export default function Recipes() {
  const [
    recipes,
    setRecipes,
  ] = useState<Recipe[]>([]);

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


    const fetchRecipes = async () => {
      try {
        setError("");

        const response =
          await api.get<Recipe[]>(
            "/recipes"
          );

        if (!ignore) {
          setRecipes(
            response.data
          );
        }

      } catch {
        if (!ignore) {
          setError(
            "Unable to load recipes."
          );
        }

      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };


    fetchRecipes();


    return () => {
      ignore = true;
    };
  }, []);


  return (
    <div>

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-emerald-600">
          Meal Ideas
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Recipes
        </h1>

        <p className="mt-2 text-slate-500">
          Browse meals and see what
          ingredients each recipe needs.
        </p>
      </div>


      {/* Loading */}
      {isLoading && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <p className="text-slate-500">
            Loading recipes...
          </p>

        </div>
      )}


      {/* Error */}
      {!isLoading && error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

          <p className="font-medium text-red-700">
            Something went wrong
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* Empty */}
      {!isLoading &&
        !error &&
        recipes.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <p className="font-medium text-slate-800">
              No recipes yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Recipes will appear here
              once they are added to
              PantryFuel.
            </p>

          </div>
        )}


      {/* Catalog */}
      {!isLoading &&
        !error &&
        recipes.length > 0 && (
          <>

            <div className="mt-8">
              <p className="text-sm text-slate-500">
                {recipes.length}{" "}
                {recipes.length === 1
                  ? "recipe"
                  : "recipes"}
              </p>
            </div>


            <div className="mt-4 grid gap-5 lg:grid-cols-2">

              {recipes.map(
                (recipe) => (
                  <article
                    key={recipe.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          {recipe.name}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {recipe.description ??
                            "No description available."}
                        </p>
                      </div>


                      <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-center">

                        <p className="text-lg font-semibold text-emerald-700">
                          {recipe.servings}
                        </p>

                        <p className="text-xs text-emerald-600">
                          {recipe.servings === 1
                            ? "serving"
                            : "servings"}
                        </p>

                      </div>

                    </div>


                    {/* Time */}
                    <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">

                      <span>
                        Prep:{" "}
                        <strong className="font-medium text-slate-700">
                          {recipe.prep_minutes} min
                        </strong>
                      </span>

                      <span>
                        Cook:{" "}
                        <strong className="font-medium text-slate-700">
                          {recipe.cook_minutes} min
                        </strong>
                      </span>

                      <span>
                        Total:{" "}
                        <strong className="font-medium text-slate-700">
                          {recipe.prep_minutes +
                            recipe.cook_minutes}{" "}
                          min
                        </strong>
                      </span>

                    </div>


                    {/* Ingredients preview */}
                    <div className="mt-6">

                      <p className="text-sm font-medium text-slate-700">
                        Ingredients
                      </p>


                      <div className="mt-3 flex flex-wrap gap-2">

                        {recipe.recipe_ingredients
                          .slice(0, 4)
                          .map(
                            (item) => (
                              <span
                                key={item.id}
                                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                              >
                                {formatIngredientName(
                                  item.ingredient.name
                                )}
                              </span>
                            )
                          )}


                        {recipe.recipe_ingredients
                          .length > 4 && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">

                            +
                            {recipe
                              .recipe_ingredients
                              .length - 4}{" "}
                            more

                          </span>
                        )}

                      </div>

                    </div>


                    <div className="mt-6 border-t border-slate-100 pt-5">

                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        View Recipe
                      </Link>

                    </div>

                  </article>
                )
              )}

            </div>

          </>
        )}

    </div>
  );
}