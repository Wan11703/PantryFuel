import { useEffect, useState } from "react";
import api from "./lib/api";

function App() {
  const [databaseStatus, setDatabaseStatus] = useState("Checking...");

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await api.get("/health/database");
        setDatabaseStatus(response.data.database);
      } catch {
        setDatabaseStatus("Connection failed");
      }
    };

    checkDatabase();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <p className="mb-2 text-sm font-medium text-emerald-600">
            PantryFuel
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Your pantry. Your meals. Your goals.
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Smart recipe recommendations based on what you already have,
            what needs to be used soon, and your daily nutrition goals.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              Pantry
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              Recipes
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              Macros
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Database status
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {databaseStatus}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
