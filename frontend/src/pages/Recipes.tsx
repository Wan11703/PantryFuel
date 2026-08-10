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


function formatGrams(
  value: number | string | null
) {
  if (value === null) {
    return "Unknown";
  }

  return `${Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  )} g`;
}

function formatExpirationDate(
  value: string
) {
  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


function formatExpirationLabel(
  days: number
) {
  if (days === 0) {
    return "Expires today";
  }

  if (days === 1) {
    return "Expires tomorrow";
  }

  return `Expires in ${days} days`;
}


function getExpirationPriorityLabel(
  score: number | string
) {
  const numericScore =
    Number(score);

  if (numericScore >= 50) {
    return "High priority";
  }

  if (numericScore >= 25) {
    return "Use soon";
  }

  if (numericScore > 0) {
    return "Expiring";
  }

  return null;
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
      {/* Empty Catalog */}
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
                Can Cook{" "}
                ({cookableCount})
              </button>

            </div>


            {/* No Cookable Recipes */}
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


            {/* Recipe Cards */}
            {visibleMatches.length >
              0 && (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">

                {visibleMatches.map(
                  (match) => {
                    const recipe =
                      match.recipe;


                    const issuesByIngredient =
                      new Map(
                        match.missing_ingredients.map(
                          (ingredient) => [
                            ingredient.id,
                            ingredient,
                          ]
                        )
                      );

                      const expirationScore =
                        Number(
                            match.expiration_score
                        );


                        const expirationPriority =
                        getExpirationPriorityLabel(
                            match.expiration_score
                        );


                        const earliestExpiringIngredient =
                        match.expiring_ingredients[0];


                    return (
                      <article
                        key={
                          recipe.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6"
                      >

                        {/* ================= */}
                        {/* Top */}
                        {/* ================= */}

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


                          <div className="flex shrink-0 flex-col items-end gap-2">

                            {match.can_cook ? (

                                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                ✓ CAN COOK
                                </span>

                            ) : (

                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">

                                {formatPercentage(
                                    match.match_percentage
                                )}
                                % MATCH

                                </span>

                            )}


                            {expirationPriority && (
                                <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                                ⏱ {expirationPriority.toUpperCase()}
                                </span>
                            )}

                            </div>

                        </div>


                        {/* ================= */}
                        {/* Pantry Match */}
                        {/* ================= */}

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

                        {/* ================= */}
                        {/* Expiration Priority */}
                        {/* ================= */}

                        {match.expiring_ingredients.length >
                        0 && (

                        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">

                            <div className="flex flex-wrap items-start justify-between gap-4">

                            <div>

                                <p className="text-sm font-semibold text-orange-800">
                                Use Soon
                                </p>

                                <p className="mt-1 text-xs text-orange-700">
                                This recipe can help use
                                ingredients before they
                                expire.
                                </p>

                            </div>


                            <div className="text-right">

                                <p className="text-xs text-orange-600">
                                Expiration Priority
                                </p>

                                <p className="mt-1 text-lg font-semibold text-orange-800">

                                {expirationScore.toLocaleString(
                                    undefined,
                                    {
                                    maximumFractionDigits: 1,
                                    }
                                )}

                                </p>

                            </div>

                            </div>


                            <div className="mt-4 space-y-2">

                            {match.expiring_ingredients.map(
                                (
                                ingredient,
                                index
                                ) => (

                                <div
                                    key={`${ingredient.id}-${ingredient.expiration_date}-${index}`}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5"
                                >

                                    <div>

                                    <p className="text-sm font-medium text-slate-800">

                                        {formatIngredientName(
                                        ingredient.name
                                        )}

                                    </p>


                                    <p className="mt-0.5 text-xs text-orange-700">

                                        {formatExpirationLabel(
                                        ingredient.days_until_expiration
                                        )}

                                    </p>

                                    </div>


                                    <div className="text-right">

                                    <p className="text-xs text-slate-500">

                                        {formatExpirationDate(
                                        ingredient.expiration_date
                                        )}

                                    </p>


                                    <p className="mt-0.5 text-xs text-slate-400">

                                        Uses{" "}
                                        {formatGrams(
                                        ingredient.quantity_used_grams
                                        )}

                                    </p>

                                    </div>

                                </div>

                                )
                            )}

                            </div>

                        </div>
                        )}


                        {/* ================= */}
                        {/* Times */}
                        {/* ================= */}

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


                        {/* ================= */}
                        {/* Ingredients */}
                        {/* ================= */}

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
                                  const issue =
                                    issuesByIngredient.get(
                                      item
                                        .ingredient
                                        .id
                                    );


                                  const isAvailable =
                                    !issue;


                                  const isMissing =
                                    issue?.reason ===
                                    "missing";


                                  const isInsufficient =
                                    issue?.reason ===
                                    "insufficient";


                                  const conversionUnavailable =
                                    issue?.reason ===
                                    "conversion_unavailable";


                                  return (
                                    <div
                                      key={
                                        item.id
                                      }
                                      className="rounded-xl bg-slate-50 px-4 py-3"
                                    >

                                      <div className="flex items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                          {/* Status */}
                                          <span
                                            className={
                                              isAvailable
                                                ? "text-emerald-600"
                                                : isInsufficient ||
                                                  conversionUnavailable
                                                ? "text-amber-500"
                                                : "text-red-500"
                                            }
                                          >

                                            {isAvailable
                                              ? "✓"
                                              : isMissing
                                              ? "✕"
                                              : "!"}

                                          </span>


                                          {/* Name */}
                                          <p className="text-sm font-medium text-slate-700">

                                            {formatIngredientName(
                                              item
                                                .ingredient
                                                .name
                                            )}

                                          </p>

                                        </div>


                                        {/* Recipe requirement */}
                                        <p className="shrink-0 text-sm text-slate-500">

                                          {formatQuantity(
                                            item.quantity
                                          )}{" "}
                                          {
                                            item.unit
                                          }

                                        </p>

                                      </div>


                                      {/* Insufficient */}
                                      {isInsufficient &&
                                        issue && (

                                          <div className="mt-3 ml-7 grid gap-2 text-sm sm:grid-cols-3">

                                            <div>

                                              <p className="text-xs text-slate-400">
                                                Need
                                              </p>

                                              <p className="font-medium text-slate-700">
                                                {formatGrams(
                                                  issue.required_grams
                                                )}
                                              </p>

                                            </div>


                                            <div>

                                              <p className="text-xs text-slate-400">
                                                Have
                                              </p>

                                              <p className="font-medium text-amber-700">
                                                {formatGrams(
                                                  issue.available_grams
                                                )}
                                              </p>

                                            </div>


                                            <div>

                                              <p className="text-xs text-slate-400">
                                                Short
                                              </p>

                                              <p className="font-medium text-red-600">
                                                {formatGrams(
                                                  issue.shortage_grams
                                                )}
                                              </p>

                                            </div>

                                          </div>
                                        )}


                                      {/* Completely missing */}
                                      {isMissing &&
                                        issue && (

                                          <p className="mt-2 ml-7 text-xs text-red-500">
                                            Not currently in
                                            your pantry.
                                          </p>

                                        )}


                                      {/* Conversion unavailable */}
                                      {conversionUnavailable &&
                                        issue && (

                                          <p className="mt-2 ml-7 text-xs text-amber-600">
                                            PantryFuel cannot
                                            compare this quantity
                                            because a unit conversion
                                            is unavailable.
                                          </p>

                                        )}

                                    </div>
                                  );
                                }
                              )}

                          </div>

                        </div>


                        {/* ================= */}
                        {/* Needs Attention */}
                        {/* ================= */}

                        {!match.can_cook &&
                          match
                            .missing_ingredients
                            .length >
                            0 && (

                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                              <p className="text-sm font-medium text-amber-800">
                                Needs Attention
                              </p>


                              <div className="mt-3 space-y-3">

                                {match
                                  .missing_ingredients
                                  .map(
                                    (
                                      ingredient
                                    ) => {

                                      if (
                                        ingredient.reason ===
                                        "missing"
                                      ) {
                                        return (
                                          <div
                                            key={
                                              ingredient.id
                                            }
                                            className="flex items-center justify-between gap-4"
                                          >

                                            <p className="text-sm text-amber-800">

                                              {formatIngredientName(
                                                ingredient.name
                                              )}

                                            </p>


                                            <span className="text-xs font-medium text-red-600">
                                              Missing
                                            </span>

                                          </div>
                                        );
                                      }


                                      if (
                                        ingredient.reason ===
                                        "insufficient"
                                      ) {
                                        return (
                                          <div
                                            key={
                                              ingredient.id
                                            }
                                          >

                                            <div className="flex items-center justify-between gap-4">

                                              <p className="text-sm font-medium text-amber-800">

                                                {formatIngredientName(
                                                  ingredient.name
                                                )}

                                              </p>


                                              <span className="text-xs font-medium text-amber-700">
                                                Not enough
                                              </span>

                                            </div>


                                            <p className="mt-1 text-xs text-amber-700">

                                              Have{" "}
                                              {formatGrams(
                                                ingredient.available_grams
                                              )}

                                              {" · "}

                                              Need{" "}
                                              {formatGrams(
                                                ingredient.required_grams
                                              )}

                                              {" · "}

                                              Short{" "}
                                              {formatGrams(
                                                ingredient.shortage_grams
                                              )}

                                            </p>

                                          </div>
                                        );
                                      }


                                      return (
                                        <div
                                          key={
                                            ingredient.id
                                          }
                                          className="flex items-center justify-between gap-4"
                                        >

                                          <p className="text-sm text-amber-800">

                                            {formatIngredientName(
                                              ingredient.name
                                            )}

                                          </p>


                                          <span className="text-xs font-medium text-amber-700">
                                            Conversion unavailable
                                          </span>

                                        </div>
                                      );
                                    }
                                  )}

                              </div>

                            </div>
                          )}

                        {/* Recommendation */}
                        {match.can_cook &&
                        earliestExpiringIngredient && (

                        <div className="mt-5">

                            <p className="text-sm font-medium text-orange-700">

                            💡 Good choice to use{" "}

                            {formatIngredientName(
                                earliestExpiringIngredient.name
                            )}{" "}

                            before it expires.

                            </p>

                        </div>
                        )}
                        {/* ================= */}
                        {/* Footer */}
                        {/* ================= */}

                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">

                          <p className="text-sm text-slate-400">

                            {match.can_cook
                            ? expirationScore > 0
                                ? "Cookable now and uses ingredients expiring soon."
                                : "You have enough of every ingredient."
                            : `${match.missing_ingredients.length} ${
                                match.missing_ingredients.length === 1
                                    ? "ingredient needs"
                                    : "ingredients need"
                                } attention`}

                          </p>


                          <Link
                            to={`/recipes/${recipe.id}`}
                            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
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