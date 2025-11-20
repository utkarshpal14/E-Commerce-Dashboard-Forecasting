// src/components/Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, onSnapshot, orderBy, query, updateDoc, writeBatch, limit } from "firebase/firestore";

function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

function getEmail() {
  return localStorage.getItem("auth_email") || sessionStorage.getItem("auth_email") || "";
}

function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_email");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("auth_email");
}

export default function Navbar() {
  const [authed, setAuthed] = useState(!!getToken());
  const email = getEmail();
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<Array<{ id: string; title: string; time?: any; type?: string; read?: boolean; link?: string }>>([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  } as const;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u ? u.uid : null);
    });
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    if (!uid) return;
    let initial = true;
    const q = query(collection(db, `notifications/${uid}/items`), orderBy("time", "desc"), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const count = list.filter((n) => !n.read).length;
      const prevUnread = unread;
      setItems(list);
      setUnread(count);
      if (!open && !initial && count > prevUnread) {
        setToast("New notifications");
        setTimeout(() => setToast(null), 2500);
      }
      initial = false;
    });
    return () => unsub();
  }, [db, uid, open, unread]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const logout = () => {
    clearAuth();
    setAuthed(false);
    // Notify other components (like App) listening to storage changes
    window.dispatchEvent(new Event("storage"));
    navigate("/", { replace: true });
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Analytics
              </span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!authed && (
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                Home
              </NavLink>
            )}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`
              }
            >
              About
            </NavLink>
            {authed && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
            {authed && (
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                Contact Us
              </NavLink>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {authed ? (
              <>
                <div className="hidden sm:block px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                  {email || "User"}
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    className="relative p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    aria-label="Notifications"
                    onClick={() => setOpen((v) => !v)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
                      <path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" />
                    </svg>
                    {unread > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center">{unread > 9 ? "9+" : unread}</span>
                    ) : null}
                  </button>
                  {open ? (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 p-2 z-50">
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <button className={`px-2 py-1 rounded-lg ${filter === "all" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`} onClick={() => setFilter("all")}>All</button>
                          <button className={`px-2 py-1 rounded-lg ${filter === "unread" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`} onClick={() => setFilter("unread")}>Unread</button>
                        </div>
                        <button
                          className="text-xs text-blue-600 hover:text-blue-700"
                          onClick={async () => {
                            if (!uid) return;
                            const unreadItems = items.filter((n) => !n.read);
                            if (unreadItems.length === 0) return;
                            const b = writeBatch(db);
                            unreadItems.forEach((n) => b.update(doc(db, `notifications/${uid}/items/${n.id}`), { read: true }));
                            await b.commit();
                          }}
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-auto divide-y divide-gray-100">
                        {(filter === "all" ? items : items.filter((n) => !n.read)).slice(0, 20).map((n) => (
                          <div key={n.id} className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50">
                            <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-600"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate cursor-pointer" onClick={() => { if (n.link) navigate(n.link); setOpen(false); }}>{n.title || "Notification"}</div>
                              <div className="text-xs text-gray-500">{n.time?.toDate ? new Date(n.time.toDate()).toLocaleString() : ""}</div>
                            </div>
                            {!n.read ? (
                              <button
                                className="text-xs text-blue-600 hover:text-blue-700"
                                onClick={async () => { if (!uid) return; await updateDoc(doc(db, `notifications/${uid}/items/${n.id}`), { read: true }); }}
                              >
                                Mark read
                              </button>
                            ) : null}
                          </div>
                        ))}
                        {items.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-gray-500">No notifications</div>
                        ) : null}
                      </div>
                      <div className="px-2 py-2 flex items-center justify-end gap-2">
                        <button
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={async () => {
                            if (!uid) return;
                            const b = writeBatch(db);
                            items.forEach((n) => b.update(doc(db, `notifications/${uid}/items/${n.id}`), { read: true }));
                            await b.commit();
                          }}
                        >
                          Clear unread
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/account")}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  aria-label="Account"
                  title="Account"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    {toast ? (
      <div className="fixed bottom-4 right-4 z-[60] px-3 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg">{toast}</div>
    ) : null}
    </>
  );
}

