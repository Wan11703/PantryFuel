import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import api from "../../lib/api";

import type {
  PantryItem,
} from "../../types/pantry";


type EditIngredientModalProps = {
  isOpen: boolean;
  pantryItem: PantryItem | null;
  onClose: () => void;
  onUpdated: (
    pantryItem: PantryItem
  ) => void;
};


export default function EditIngredientModal({
  isOpen,
  pantryItem,
  onClose,
  onUpdated,
}: EditIngredientModalProps) {
  const [
    ingredientName,
    setIngredientName,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    unit,
    setUnit,
  ] = useState("g");

  const [
    expirationDate,
    setExpirationDate,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  useEffect(() => {
    if (!pantryItem) {
      return;
    }

    setIngredientName(
      pantryItem.ingredient.name
    );

    setQuantity(
      String(pantryItem.quantity)
    );

    setUnit(
      pantryItem.unit
    );

    setExpirationDate(
      pantryItem.expiration_date ?? ""
    );

    setError("");
  }, [pantryItem]);


  if (
    !isOpen ||
    !pantryItem
  ) {
    return null;
  }


  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");


    const parsedQuantity =
      Number(quantity);


    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be greater than 0."
      );

      return;
    }


    setIsSubmitting(true);


    try {
      const response =
        await api.put<PantryItem>(
          `/pantry/${pantryItem.id}`,
          {
            ingredient_name:
              ingredientName.trim(),

            quantity:
              parsedQuantity,

            unit,

            expiration_date:
              expirationDate || null,
          }
        );


      onUpdated(
        response.data
      );

      onClose();

    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        const detail =
          error.response?.data?.detail;

        if (
          typeof detail === "string"
        ) {
          setError(detail);
        } else {
          setError(
            "Unable to update ingredient."
          );
        }
      } else {
        setError(
          "Unable to update ingredient."
        );
      }

    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-ingredient-title"
        className="w-full max-w-lg rounded-2xl bg-white"
      >

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2
              id="edit-ingredient-title"
              className="text-xl font-semibold text-slate-900"
            >
              Edit Ingredient
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the ingredient,
              quantity, unit, or
              expiration date.
            </p>
          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          {/* Ingredient */}
          <label className="block">

            <span className="text-sm font-medium text-slate-700">
              Ingredient
            </span>

            <input
              type="text"
              required
              maxLength={120}
              value={ingredientName}
              onChange={(event) =>
                setIngredientName(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />

          </label>


          {/* Quantity + Unit */}
          <div className="mt-5 grid grid-cols-[1fr_140px] gap-4">

            <label className="block">

              <span className="text-sm font-medium text-slate-700">
                Quantity
              </span>

              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

            </label>


            <label className="block">

              <span className="text-sm font-medium text-slate-700">
                Unit
              </span>

              <select
                value={unit}
                onChange={(event) =>
                  setUnit(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="g">
                  grams (g)
                </option>

                <option value="kg">
                  kilograms (kg)
                </option>

                <option value="ml">
                  milliliters (ml)
                </option>

                <option value="l">
                  liters (L)
                </option>

                <option value="piece">
                  pieces
                </option>
              </select>

            </label>

          </div>


          {/* Expiration */}
          <label className="mt-5 block">

            <span className="text-sm font-medium text-slate-700">
              Expiration Date
            </span>

            <input
              type="date"
              value={expirationDate}
              onChange={(event) =>
                setExpirationDate(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Leave blank if there is
              no expiration date.
            </p>

          </label>


          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}


          {/* Actions */}
          <div className="mt-7 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}