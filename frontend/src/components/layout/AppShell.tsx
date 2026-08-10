import type { ReactNode } from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


type AppShellProps = {
  children: ReactNode;
};


export default function AppShell({
  children,
}: AppShellProps) {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();


  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xl font-bold text-slate-900">
              PantryFuel
            </p>

            <p className="text-sm text-slate-500">
              Your pantry. Your meals. Your goals.
            </p>
          </div>


          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user?.display_name}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email}
              </p>
            </div>


            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>


      <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr]">
        <aside className="min-h-[calc(100vh-81px)] border-r border-slate-200 bg-white p-4">
          <nav className="space-y-1">
            <NavLink
              to="/pantry"
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-3 text-sm font-medium",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")
              }
            >
              Pantry
            </NavLink>


            <NavLink
                to="/recipes"
                className={({ isActive }) =>
                    [
                    "block rounded-xl px-4 py-3 text-sm font-medium",
                    isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")
                }
                >
                Recipes
                </NavLink>


            <div className="cursor-not-allowed rounded-xl px-4 py-3 text-sm text-slate-400">
              Nutrition
            </div>
          </nav>
        </aside>


        <main className="min-w-0 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}