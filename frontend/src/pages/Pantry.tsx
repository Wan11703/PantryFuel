import {
  useEffect,
  useState,
} from "react";

import AddIngredientModal
  from "../components/pantry/AddIngredientModal";

import DeleteIngredientModal
  from "../components/pantry/DeleteIngredientModal";

import EditIngredientModal
  from "../components/pantry/EditIngredientModal";

import api from "../lib/api";

import type {
  PantryItem,
} from "../types/pantry";


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


function formatQuantity(
  quantity: number
) {
  return Number(
    quantity
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
}


function formatExpirationDate(
  date: string | null
) {
  if (!date) {
    return "No expiration date";
  }


  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default function Pantry() {
  const [
    pantryItems,
    setPantryItems,
  ] = useState<PantryItem[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // Add
  const [
    isAddModalOpen,
    setIsAddModalOpen,
  ] = useState(false);


  // Edit
  const [
    selectedEditItem,
    setSelectedEditItem,
  ] = useState<PantryItem | null>(
    null
  );


  // Delete
  const [
    selectedDeleteItem,
    setSelectedDeleteItem,
  ] = useState<PantryItem | null>(
    null
  );


  useEffect(() => {
    let ignore = false;


    const fetchPantry = async () => {
      try {
        setError("");


        const response =
          await api.get<PantryItem[]>(
            "/pantry"
          );


        if (!ignore) {
          setPantryItems(
            response.data
          );
        }

      } catch {
        if (!ignore) {
          setError(
            "Unable to load your pantry."
          );
        }

      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };


    fetchPantry();


    return () => {
      ignore = true;
    };
  }, []);


  // =========================
  // Create
  // =========================

  const handleIngredientCreated = (
    pantryItem: PantryItem
  ) => {
    setPantryItems(
      (currentItems) => [
        pantryItem,
        ...currentItems,
      ]
    );
  };


  // =========================
  // Update
  // =========================

  const handleIngredientUpdated = (
    updatedItem: PantryItem
  ) => {
    setPantryItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.id ===
            updatedItem.id
              ? updatedItem
              : item
        )
    );
  };


  // =========================
  // Delete
  // =========================

  const handleIngredientDeleted = (
    pantryItemId: string
  ) => {
    setPantryItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !==
            pantryItemId
        )
    );
  };


  return (
    <div>

      {/* ========================= */}
      {/* Page Header */}
      {/* ========================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-emerald-600">
            Kitchen Inventory
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Pantry
          </h1>

          <p className="mt-2 text-slate-500">
            Track the ingredients you
            currently have at home.
          </p>
        </div>


        <button
          type="button"
          onClick={() =>
            setIsAddModalOpen(true)
          }
          className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
        >
          + Add Ingredient
        </button>

      </div>


      {/* ========================= */}
      {/* Loading */}
      {/* ========================= */}

      {isLoading && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">
            Loading your pantry...
          </p>
        </div>
      )}


      {/* ========================= */}
      {/* Error */}
      {/* ========================= */}

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


      {/* ========================= */}
      {/* Empty */}
      {/* ========================= */}

      {!isLoading &&
        !error &&
        pantryItems.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <p className="font-medium text-slate-800">
              Your pantry is empty
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add your first ingredient
              to start discovering meals
              you can make.
            </p>


            <button
              type="button"
              onClick={() =>
                setIsAddModalOpen(true)
              }
              className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Add your first ingredient
            </button>

          </div>
        )}


      {/* ========================= */}
      {/* Pantry Table */}
      {/* ========================= */}

      {!isLoading &&
        !error &&
        pantryItems.length > 0 && (
          <>

            <div className="mt-8">
              <p className="text-sm text-slate-500">

                {pantryItems.length}{" "}

                {pantryItems.length === 1
                  ? "item"
                  : "items"}{" "}

                in your pantry

              </p>
            </div>


            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">

              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_140px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3">

                <p className="text-sm font-medium text-slate-500">
                  Ingredient
                </p>

                <p className="text-sm font-medium text-slate-500">
                  Quantity
                </p>

                <p className="text-sm font-medium text-slate-500">
                  Expiration
                </p>

                <p className="text-right text-sm font-medium text-slate-500">
                  Actions
                </p>

              </div>


              {/* Rows */}
              {pantryItems.map(
                (item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[2fr_1fr_1.5fr_140px] items-center gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0"
                  >

                    {/* Ingredient */}
                    <div>

                      <p className="font-medium text-slate-900">
                        {formatIngredientName(
                          item.ingredient.name
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item
                          .ingredient
                          .category ??
                          "Uncategorized"}
                      </p>

                    </div>


                    {/* Quantity */}
                    <div>

                      <p className="font-medium text-slate-800">
                        {formatQuantity(
                          item.quantity
                        )}{" "}
                        {item.unit}
                      </p>

                    </div>


                    {/* Expiration */}
                    <div>

                      <p className="text-sm text-slate-700">
                        {formatExpirationDate(
                          item.expiration_date
                        )}
                      </p>

                    </div>


                    {/* Actions */}
                    <div className="flex justify-end gap-4">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEditItem(
                            item
                          )
                        }
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDeleteItem(
                            item
                          )
                        }
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </>
        )}


      {/* ========================= */}
      {/* Add Modal */}
      {/* ========================= */}

      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={() =>
          setIsAddModalOpen(false)
        }
        onCreated={
          handleIngredientCreated
        }
      />


      {/* ========================= */}
      {/* Edit Modal */}
      {/* ========================= */}

      <EditIngredientModal
        isOpen={
          selectedEditItem !== null
        }
        pantryItem={
          selectedEditItem
        }
        onClose={() =>
          setSelectedEditItem(null)
        }
        onUpdated={
          handleIngredientUpdated
        }
      />


      {/* ========================= */}
      {/* Delete Modal */}
      {/* ========================= */}

      <DeleteIngredientModal
        isOpen={
          selectedDeleteItem !== null
        }
        pantryItem={
          selectedDeleteItem
        }
        onClose={() =>
          setSelectedDeleteItem(null)
        }
        onDeleted={
          handleIngredientDeleted
        }
      />

    </div>
  );
}