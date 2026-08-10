import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


type ProtectedRouteProps = {
  children: ReactNode;
};


export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
  } = useAuth();


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading PantryFuel...
        </p>
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}