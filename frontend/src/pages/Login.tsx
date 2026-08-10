import {
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);


  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login(
        email,
        password
      );

      navigate(
        "/pantry",
        {
          replace: true,
        }
      );
    } catch {
      setError(
        "Incorrect email or password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-600">
            PantryFuel
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to manage your pantry and meals.
          </p>
        </div>


        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Email
            </span>

            <input
              type="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="you@example.com"
            />
          </label>


          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">
              Password
            </span>

            <input
              type="password"
              required
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </label>


          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}