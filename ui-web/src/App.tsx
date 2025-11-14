// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Navbar from "./components/Navbar";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Overview from "./pages/Overview";
import Categories from "./pages/Categories";
import Regions from "./pages/Regions";
import Forecast from "./pages/Forecast";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Account from "./pages/Account";

function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

function RequireAuth({ children }: { children: ReactElement }) {
  const loc = useLocation();
  const token = getToken();
  if (!token) return <Navigate to="/" state={{ from: loc }} replace />;
  return children;
}

function PublicGate({ authed, children }: { authed: boolean; children: ReactElement }) {
  if (authed) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Safety redirect: when logged out from any protected route, go to home
  useEffect(() => {
    if (!authed) {
      const publicPaths = new Set(["/", "/login", "/signup", "/about"]);
      if (!publicPaths.has(location.pathname)) {
        navigate("/", { replace: true });
      }
    }
  }, [authed, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {authed && <Navbar />}
      <Routes>
        <Route path="/login" element={<PublicGate authed={authed}><Login /></PublicGate>} />
        <Route path="/signup" element={<PublicGate authed={authed}><Signup /></PublicGate>} />
        <Route path="/" element={<PublicGate authed={authed}><Home /></PublicGate>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<Overview />} />
          <Route path="categories" element={<Categories />} />
          <Route path="regions" element={<Regions />} />
          <Route path="forecast" element={<Forecast />} />
        </Route>
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
      </Routes>
    </div>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}