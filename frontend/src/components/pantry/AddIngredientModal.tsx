import {
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import api from "../../lib/api";

import type {
  PantryItem,
} from "../../types/pantry";


type AddIngredientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (
    pantryItem: PantryItem
  ) => void;
};


export default function AddIngredientModal({
  isOpen,
  onClose,
  onCreated,
}: AddIngredientModalProps) {
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


  if (!isOpen) {
    return null;
  }


  const resetForm = () => {
    setIngredientName("");
    setQuantity("");
    setUnit("g");
    setExpirationDate("");
    setError("");
  };


  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };


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
        await api.post<PantryItem>(
          "/pantry",
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


      onCreated(
        response.data
      );

      resetForm();

      onClose();

    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        const message =
          error.response?.data?.detail;

        if (
          typeof message === "string"
        ) {
          setError(message);
        } else {
          setError(
            "Unable to add ingredient."
          );
        }
      } else {
        setError(
          "Unable to add ingredient."
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
        aria-labelledby="add-ingredient-title"
        className="w-full max-w-lg rounded-2xl bg-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2
              id="add-ingredient-title"
              className="text-xl font-semibold text-slate-900"
            >
              Add Ingredient
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add something currently
              available in your kitchen.
            </p>
          </div>


          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>

        </div>


        {/* Form */}
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
              placeholder="Chicken breast"
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
                placeholder="500"
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
              Optional. This will later
              help PantryFuel prioritize
              food that should be used soon.
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
              onClick={handleClose}
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
                ? "Adding..."
                : "Add Ingredient"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}