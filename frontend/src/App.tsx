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