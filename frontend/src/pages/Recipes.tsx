import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../lib/api";

import type {
  RecipeMatch,
} from "../types/recipe";


type RecipeFilter =
  | "all"
  | "cookable";


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


function formatPercentage(
  value: number | string
) {
  return Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 0,
    }
  );
}


function formatQuantity(
  value: number | string
) {
  return Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
}


export default function Recipes() {
  const [
    matches,
    setMatches,
  ] = useState<RecipeMatch[]>([]);

  const [
    filter,
    setFilter,
  ] = useState<RecipeFilter>("all");

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


    const fetchRecipeMatches =
      async () => {
        try {
          setError("");

          const response =
            await api.get<
              RecipeMatch[]
            >(
              "/recipes/pantry-matches"
            );


          if (!ignore) {
            setMatches(
              response.data
            );
          }

        } catch {
          if (!ignore) {
            setError(
              "Unable to load recipe matches."
            );
          }

        } finally {
          if (!ignore) {
            setIsLoading(false);
          }
        }
      };


    fetchRecipeMatches();


    return () => {
      ignore = true;
    };
  }, []);


  const cookableCount =
    matches.filter(
      (match) =>
        match.can_cook
    ).length;


  const visibleMatches =
    filter === "cookable"
      ? matches.filter(
          (match) =>
            match.can_cook
        )
      : matches;


  return (
    <div>

      {/* ===================== */}
      {/* Header */}
      {/* ===================== */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-emerald-600">
            Pantry Recommendations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Recipes
          </h1>

          <p className="mt-2 text-slate-500">
            Discover meals based on
            the ingredients currently
            in your pantry.
          </p>
        </div>

      </div>


      {/* ===================== */}
      {/* Loading */}
      {/* ===================== */}

      {isLoading && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <p className="text-slate-500">
            Comparing recipes with
            your pantry...
          </p>

        </div>
      )}


      {/* ===================== */}
      {/* Error */}
      {/* ===================== */}

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


      {/* ===================== */}
      {/* Empty catalog */}
      {/* ===================== */}

      {!isLoading &&
        !error &&
        matches.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <p className="font-medium text-slate-800">
              No recipes available
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add recipes to the
              PantryFuel catalog first.
            </p>

          </div>
        )}


      {/* ===================== */}
      {/* Recipe Catalog */}
      {/* ===================== */}

      {!isLoading &&
        !error &&
        matches.length > 0 && (
          <>

            {/* Summary */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-sm text-slate-500">
                  Recipes
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {matches.length}
                </p>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-sm text-slate-500">
                  Can Cook Now
                </p>

                <p className="mt-2 text-2xl font-semibold text-emerald-600">
                  {cookableCount}
                </p>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-sm text-slate-500">
                  Need Ingredients
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {matches.length -
                    cookableCount}
                </p>

              </div>

            </div>


            {/* Filters */}
            <div className="mt-8 flex flex-wrap items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium",
                  filter === "all"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                All Recipes
              </button>


              <button
                type="button"
                onClick={() =>
                  setFilter(
                    "cookable"
                  )
                }
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium",
                  filter === "cookable"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Can Cook
                {" "}
                ({cookableCount})
              </button>

            </div>


            {/* No cookable recipes */}
            {visibleMatches.length ===
              0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <p className="font-medium text-slate-800">
                  Nothing is fully
                  cookable yet
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Add more ingredients
                  to your pantry and
                  check again.
                </p>


                <Link
                  to="/pantry"
                  className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Open Pantry
                </Link>

              </div>
            )}


            {/* Cards */}
            {visibleMatches.length >
              0 && (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">

                {visibleMatches.map(
                  (match) => {
                    const recipe =
                      match.recipe;

                    const missingIds =
                      new Set(
                        match
                          .missing_ingredients
                          .map(
                            (
                              ingredient
                            ) =>
                              ingredient.id
                          )
                      );


                    return (
                      <article
                        key={
                          recipe.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6"
                      >

                        {/* Top */}
                        <div className="flex items-start justify-between gap-5">

                          <div>

                            <h2 className="text-xl font-semibold text-slate-900">
                              {
                                recipe.name
                              }
                            </h2>


                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {recipe.description ??
                                "No description available."}
                            </p>

                          </div>


                          {match.can_cook ? (

                            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              ✓ CAN COOK
                            </span>

                          ) : (

                            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">

                              {formatPercentage(
                                match
                                  .match_percentage
                              )}
                              % MATCH

                            </span>

                          )}

                        </div>


                        {/* Match */}
                        <div className="mt-5">

                          <div className="flex items-center justify-between gap-4">

                            <p className="text-sm font-medium text-slate-700">
                              Pantry Match
                            </p>


                            <p className="text-sm text-slate-500">

                              {
                                match.matched_ingredients
                              }
                              {" / "}
                              {
                                match.total_ingredients
                              }
                              {" ingredients"}

                            </p>

                          </div>


                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className={[
                                "h-full rounded-full",
                                match.can_cook
                                  ? "bg-emerald-500"
                                  : "bg-amber-400",
                              ].join(
                                " "
                              )}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(
                                      match
                                        .match_percentage
                                    )
                                  )
                                )}%`,
                              }}
                            />

                          </div>


                          <p className="mt-2 text-right text-sm font-medium text-slate-600">
                            {formatPercentage(
                              match
                                .match_percentage
                            )}
                            %
                          </p>

                        </div>


                        {/* Times */}
                        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">

                          <span>
                            Prep:{" "}
                            <strong className="font-medium text-slate-700">
                              {
                                recipe.prep_minutes
                              }
                              {" min"}
                            </strong>
                          </span>


                          <span>
                            Cook:{" "}
                            <strong className="font-medium text-slate-700">
                              {
                                recipe.cook_minutes
                              }
                              {" min"}
                            </strong>
                          </span>


                          <span>
                            Serves:{" "}
                            <strong className="font-medium text-slate-700">
                              {
                                recipe.servings
                              }
                            </strong>
                          </span>

                        </div>


                        {/* Ingredients */}
                        <div className="mt-6">

                          <p className="text-sm font-medium text-slate-700">
                            Ingredients
                          </p>


                          <div className="mt-3 space-y-2">

                            {recipe
                              .recipe_ingredients
                              .map(
                                (
                                  item
                                ) => {
                                  const
                                    isMissing =
                                      missingIds.has(
                                        item
                                          .ingredient
                                          .id
                                      );


                                  return (
                                    <div
                                      key={
                                        item.id
                                      }
                                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
                                    >

                                      <div className="flex items-center gap-3">

                                        <span
                                          className={
                                            isMissing
                                              ? "text-red-500"
                                              : "text-emerald-600"
                                          }
                                        >
                                          {isMissing
                                            ? "✕"
                                            : "✓"}
                                        </span>


                                        <p className="text-sm font-medium text-slate-700">
                                          {formatIngredientName(
                                            item
                                              .ingredient
                                              .name
                                          )}
                                        </p>

                                      </div>


                                      <p className="text-sm text-slate-500">

                                        {formatQuantity(
                                          item.quantity
                                        )}{" "}
                                        {
                                          item.unit
                                        }

                                      </p>

                                    </div>
                                  );
                                }
                              )}

                          </div>

                        </div>


                        {/* Missing */}
                        {!match.can_cook &&
                          match
                            .missing_ingredients
                            .length >
                            0 && (
                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                              <p className="text-sm font-medium text-amber-800">
                                Missing
                              </p>


                              <div className="mt-2 flex flex-wrap gap-2">

                                {match
                                  .missing_ingredients
                                  .map(
                                    (
                                      ingredient
                                    ) => (
                                      <span
                                        key={
                                          ingredient.id
                                        }
                                        className="rounded-full bg-white px-3 py-1 text-sm text-amber-700"
                                      >

                                        {formatIngredientName(
                                          ingredient.name
                                        )}

                                      </span>
                                    )
                                  )}

                              </div>

                            </div>
                          )}


                        {/* Footer */}
                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                          <p className="text-sm text-slate-400">
                            {match.can_cook
                              ? "Everything you need is in your pantry."
                              : `${match.missing_ingredients.length} ${
                                  match
                                    .missing_ingredients
                                    .length ===
                                  1
                                    ? "ingredient"
                                    : "ingredients"
                                } missing`}
                          </p>


                          <Link
                            to={`/recipes/${recipe.id}`}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                          >
                            View Recipe
                          </Link>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </>
        )}

    </div>
  );
}