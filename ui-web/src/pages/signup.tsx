import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [touched, setTouched] = useState({ email: false, password: false });

  const validEmail = /.+@.+\..+/.test(email);
  const validPassword = password.length >= 6;
  const valid = validEmail && validPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setTouched({ email: true, password: true });
      setError("Please fix the highlighted fields and try again.");
      return;
    }
    // Dev fallback: simulate account creation and redirect to Login with banner
    if (import.meta.env.VITE_AUTH_DEV_MODE === "true") {
      try { sessionStorage.setItem("post_signup_success", "1"); } catch {}
      setLoading(false);
      navigate("/login", { replace: true });
      setTimeout(() => {
        if (window.location.pathname.includes("/signup")) {
          window.location.replace("/login");
        }
      }, 1200);
      return;
    }
    // Basic config sanity check to avoid silent hangs
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      setError("Auth configuration missing. Check your environment variables and restart the dev server.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      // Kick off profile save in the background (do not block navigation)
      (async () => {
        try {
          await setDoc(doc(db, "users", uid), {
            uid,
            email: cred.user.email || email,
            createdAt: serverTimestamp(),
          });
        } catch (profileErr) {
          console.warn("Profile save failed; proceeding with login", profileErr);
        }
      })();
      // Fire-and-forget sign out (do not await)
      (async () => { try { await signOut(auth); } catch {} })();
      // Immediately navigate to Login with success banner
      try { sessionStorage.setItem("post_signup_success", "1"); } catch {}
      setLoading(false);
      navigate("/login", { replace: true });
      setTimeout(() => {
        if (window.location.pathname.includes("/signup")) {
          window.location.replace("/login");
        }
      }, 1200);
    } catch (e: any) {
      console.error("Signup error", e);
      const code = e?.code as string | undefined;
      let msg = e?.message || "Signup failed. Please try again.";
      switch (code) {
        case "auth/email-already-in-use":
          try { sessionStorage.setItem("post_signup_exists", "1"); } catch {}
          navigate("/login", { replace: true });
          return;
        case "auth/invalid-email":
          msg = "Invalid email address.";
          break;
        case "auth/weak-password":
          msg = "Password is too weak. Use at least 6 characters.";
          break;
        case "auth/operation-not-allowed":
          msg = "Email/Password sign-up is disabled in this project.";
          break;
        case "auth/invalid-api-key":
          msg = "Firebase API key is invalid. Check your environment configuration.";
          break;
        case "auth/network-request-failed":
          msg = "Network error. Check your connection and try again.";
          break;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card with glassmorphism */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 animate-slide-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Start your analytics journey today</p>
          </div>

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
              <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors ${
                    touched.email && !validEmail ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="signup-email"
                  type="email"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    touched.email && !validEmail
                      ? "bg-red-50 border-2 border-red-400 focus:ring-red-300 focus:border-red-400"
                      : "bg-gray-50 border-2 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300"
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  autoComplete="email"
                  required
                />
              </div>
              {touched.email && !validEmail && (
                <p className="text-xs text-red-600 font-medium">Please enter a valid email address</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors ${
                    touched.password && !validPassword ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="signup-password"
                  type="password"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    touched.password && !validPassword
                      ? "bg-red-50 border-2 border-red-400 focus:ring-red-300 focus:border-red-400"
                      : "bg-gray-50 border-2 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300"
                  }`}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  password.length >= 6 ? "bg-green-500" : "bg-gray-300"
                }`}></div>
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>
              {touched.password && !validPassword && (
                <p className="text-xs text-red-600 font-medium">Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!valid || loading}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                !valid || loading
                  ? "opacity-60 cursor-not-allowed bg-gray-400"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
