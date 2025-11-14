// src/pages/login.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const navigate = useNavigate();

  const valid = /.+@.+\..+/.test(email) && password.length >= 6;

  useEffect(() => {
    let msg: string | null = null;
    if (sessionStorage.getItem("post_signup_success")) {
      msg = "Account created successfully. Please sign in.";
      sessionStorage.removeItem("post_signup_success");
    } else if (sessionStorage.getItem("post_signup_exists")) {
      msg = "This email is already registered. Please sign in.";
      sessionStorage.removeItem("post_signup_exists");
    }
    if (msg) {
      setBanner(msg);
      const t = setTimeout(() => setBanner(null), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const store = remember ? localStorage : sessionStorage;
      store.setItem("auth_token", idToken);
      store.setItem("auth_email", cred.user.email || email);
      window.dispatchEvent(new Event("storage")); // ensure App authed state updates in this tab
      try {
        const uid = cred.user.uid;
        await setDoc(doc(collection(db, `notifications/${uid}/items`)), {
          title: `Signed in as ${cred.user.email || email} at ${new Date().toLocaleString()}`,
          time: serverTimestamp(),
          type: "info",
          read: false,
          link: null,
        });
      } catch {}
      navigate("/");
    } catch (e: any) {
      setError(e?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const idToken = await res.user.getIdToken();
      const store = remember ? localStorage : sessionStorage;
      store.setItem("auth_token", idToken);
      store.setItem("auth_email", res.user.email || "");
      window.dispatchEvent(new Event("storage"));
      try {
        const uid = res.user.uid;
        await setDoc(doc(collection(db, `notifications/${uid}/items`)), {
          title: `Signed in as ${res.user.email || "user"} at ${new Date().toLocaleString()}`,
          time: serverTimestamp(),
          type: "info",
          read: false,
          link: null,
        });
      } catch {}
      navigate("/");
    } catch (e: any) {
      setError(e?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card with glassmorphism */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 animate-slide-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your analytics dashboard</p>
          </div>

          {banner ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm animate-slide-in" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">{banner}</p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-slide-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2.5 select-none cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    remember 
                      ? "bg-blue-600 border-blue-600" 
                      : "bg-white border-gray-300 group-hover:border-blue-400"
                  }`}>
                    {remember && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700 font-medium">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={!valid || loading}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                !valid || loading
                  ? "opacity-60 cursor-not-allowed bg-gray-400"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-3 ${
              loading 
                ? "opacity-60 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500" 
                : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
