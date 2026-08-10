import {
  useState,
} from "react";

import axios from "axios";

import api from "../../lib/api";

import type {
  PantryItem,
} from "../../types/pantry";


type DeleteIngredientModalProps = {
  isOpen: boolean;
  pantryItem: PantryItem | null;
  onClose: () => void;
  onDeleted: (
    pantryItemId: string
  ) => void;
};


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


export default function DeleteIngredientModal({
  isOpen,
  pantryItem,
  onClose,
  onDeleted,
}: DeleteIngredientModalProps) {
  const [
    error,
    setError,
  ] = useState("");

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);


  if (
    !isOpen ||
    !pantryItem
  ) {
    return null;
  }


  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);


    try {
      await api.delete(
        `/pantry/${pantryItem.id}`
      );

      onDeleted(
        pantryItem.id
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
            "Unable to delete ingredient."
          );
        }
      } else {
        setError(
          "Unable to delete ingredient."
        );
      }

    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-ingredient-title"
        className="w-full max-w-md rounded-2xl bg-white p-6"
      >

        <h2
          id="delete-ingredient-title"
          className="text-xl font-semibold text-slate-900"
        >
          Delete Ingredient?
        </h2>


        <p className="mt-3 text-slate-600">
          Are you sure you want to remove{" "}
          <span className="font-medium text-slate-900">
            {formatIngredientName(
              pantryItem.ingredient.name
            )}
          </span>{" "}
          from your pantry?
        </p>


        <p className="mt-2 text-sm text-slate-400">
          This only removes this pantry
          entry. It does not delete the
          global ingredient definition.
        </p>


        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}


        <div className="mt-7 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}