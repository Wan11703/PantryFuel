import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Pantry from "./pages/Pantry";
import ProtectedRoute from "./routes/ProtectedRoute";

import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <AppShell>
                <Pantry />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <AppShell>
                <Recipes />
              </AppShell>
            </ProtectedRoute>
          }
        />


        <Route
          path="/recipes/:recipeId"
          element={
            <ProtectedRoute>
              <AppShell>
                <RecipeDetails />
              </AppShell>
            </ProtectedRoute>
          }
        />


        <Route
          path="/"
          element={
            <Navigate
              to="/pantry"
              replace
            />
          }
        />


        <Route
          path="*"
          element={
            <Navigate
              to="/pantry"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;