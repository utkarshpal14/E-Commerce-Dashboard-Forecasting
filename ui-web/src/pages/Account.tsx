import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, updateProfile, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection } from "firebase/firestore";
// Avatar upload removed: no Storage needed

export default function Account() {
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
  // No Storage: avatar upload feature removed

  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [prefInfo, setPrefInfo] = useState<boolean>(true);
  const [prefSuccess, setPrefSuccess] = useState<boolean>(true);
  const [prefWarning, setPrefWarning] = useState<boolean>(true);
  const [prefError, setPrefError] = useState<boolean>(true);
  const [photoURL, setPhotoURL] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [secCurrentPassword, setSecCurrentPassword] = useState("");
  const [secNewEmail, setSecNewEmail] = useState("");
  const [secNewPassword, setSecNewPassword] = useState("");
  const [secLoading, setSecLoading] = useState(false);

  const timezones = useMemo(() => {
    return [
      "UTC",
      "Asia/Kolkata",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Australia/Sydney",
    ];
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        setEmail(user.email || "");
        setDisplayName(user.displayName || "");
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, { uid: user.uid, email: user.email || "", createdAt: serverTimestamp() }, { merge: true });
          } else {
            const data = snap.data() as any;
            if (data?.displayName && !displayName) setDisplayName(data.displayName);
            if (data?.phone) setPhone(data.phone);
            if (data?.company) setCompany(data.company);
            if (data?.role) setRole(data.role);
            if (data?.timezone) setTimezone(data.timezone);
            if (data?.bio) setBio(data.bio);
            if (data?.theme) setTheme(data.theme);
            if (typeof data?.prefInfo === "boolean") setPrefInfo(data.prefInfo);
            if (typeof data?.prefSuccess === "boolean") setPrefSuccess(data.prefSuccess);
            if (typeof data?.prefWarning === "boolean") setPrefWarning(data.prefWarning);
            if (typeof data?.prefError === "boolean") setPrefError(data.prefError);
            if (data?.photoURL) setPhotoURL(data.photoURL);
          }
        } catch {}
      } else {
        setUid(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, db]);

  // Avatar preview/upload removed

  // Avatar upload logic removed

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    if (phone && !/^\+?[1-9]\d{7,14}$/.test(phone.trim())) {
      setPhoneError("Enter a valid phone in international format, e.g. +14155552671");
      return;
    }
    setPhoneError(null);
    setSaving(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: displayName.trim(), photoURL: photoURL || undefined });
      }
      await setDoc(
        doc(db, "users", uid),
        {
          displayName: displayName.trim(),
          phone: phone.trim(),
          company: company.trim(),
          role: role.trim(),
          timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          bio: bio.trim(),
          theme,
          prefInfo,
          prefSuccess,
          prefWarning,
          prefError,
          photoURL: photoURL || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      try {
        const fresh = await getDoc(doc(db, "users", uid));
        if (fresh.exists()) {
          const data = fresh.data() as any;
          if (typeof data.displayName === "string") setDisplayName(data.displayName);
          if (typeof data.phone === "string") setPhone(data.phone);
          if (typeof data.company === "string") setCompany(data.company);
          if (typeof data.role === "string") setRole(data.role);
          if (typeof data.timezone === "string") setTimezone(data.timezone);
          if (typeof data.bio === "string") setBio(data.bio);
          if (typeof data.theme === "string") setTheme(data.theme);
          if (typeof data.prefInfo === "boolean") setPrefInfo(data.prefInfo);
          if (typeof data.prefSuccess === "boolean") setPrefSuccess(data.prefSuccess);
          if (typeof data.prefWarning === "boolean") setPrefWarning(data.prefWarning);
          if (typeof data.prefError === "boolean") setPrefError(data.prefError);
          if (typeof data.photoURL === "string") setPhotoURL(data.photoURL);
        }
      } catch {}
      // Avatar upload feature removed
      setBanner("Profile updated successfully");
      setSavedToast("Details saved successfully");
      setTimeout(() => setBanner(null), 2500);
      setTimeout(() => setSavedToast(null), 2500);
    } catch (e: any) {
      const msg = e?.message || "Failed to update profile";
      setError(msg.includes("PERMISSION_DENIED") ? "You don't have permission to update profile. Check Firestore security rules." : msg);
    } finally {
      setSaving(false);
    }
  };

  const ensureReauth = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    if (!secCurrentPassword) throw new Error("Current password is required");
    const cred = EmailAuthProvider.credential(user.email || "", secCurrentPassword);
    await reauthenticateWithCredential(user, cred);
    return user;
  };

  const onChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecLoading(true);
    setError(null);
    try {
      const user = await ensureReauth();
      if (!/.+@.+\..+/.test(secNewEmail)) throw new Error("Enter a valid email");
      await updateEmail(user, secNewEmail.trim());
      await setDoc(doc(db, "users", user.uid), { email: secNewEmail.trim(), updatedAt: serverTimestamp() }, { merge: true });
      setEmail(secNewEmail.trim());
      setBanner("Email updated. You may need to re-login on other devices.");
      setTimeout(() => setBanner(null), 2500);
      setSecNewEmail("");
      setSecCurrentPassword("");
    } catch (e: any) {
      setError(e?.message || "Failed to update email");
    } finally {
      setSecLoading(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecLoading(true);
    setError(null);
    try {
      const user = await ensureReauth();
      if (secNewPassword.length < 6) throw new Error("New password must be at least 6 characters");
      await updatePassword(user, secNewPassword);
      try {
        await setDoc(doc(collection(db, `notifications/${user.uid}/items`)), {
          title: `Your password was changed at ${new Date().toLocaleString()}`,
          time: serverTimestamp(),
          type: "warning",
          read: false,
          link: null,
        });
      } catch {}
      setBanner("Password updated successfully");
      setTimeout(() => setBanner(null), 2500);
      setSecNewPassword("");
      setSecCurrentPassword("");
    } catch (e: any) {
      setError(e?.message || "Failed to update password");
    } finally {
      setSecLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Type OK to proceed.")) return;
    setSecLoading(true);
    setError(null);
    try {
      const user = await ensureReauth();
      await deleteUser(user);
      setBanner("Account deleted");
      setTimeout(() => (window.location.href = "/"), 800);
    } catch (e: any) {
      setError(e?.message || "Failed to delete account");
    } finally {
      setSecLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] grid place-items-center py-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(2,6,23,0.15)] ring-1 ring-black/5 animate-pulse text-center text-gray-500">Loading account…</div>
      </div>
    );
  }

  return (
    <>
    <div className="relative min-h-[calc(100vh-4rem)] grid place-items-center py-12 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 blur-3xl" />
      <div className="w-full max-w-3xl p-8 rounded-2xl bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(2,6,23,0.15)] ring-1 ring-black/5 animate-slide-in">
        <div className="mb-8">
          <div className="text-3xl font-bold mb-2 text-gray-900">Your Account</div>
          <div className="text-sm text-gray-600 font-medium">Manage your profile information</div>
        </div>

        {banner ? (
          <div className="mb-4 text-sm text-green-800 border border-green-300 bg-green-50 px-4 py-3 rounded-lg shadow-sm" role="status" aria-live="polite">{banner}</div>
        ) : null}
        {error ? (
          <div className="mb-4 text-sm text-red-700 border border-red-300 bg-red-50 px-4 py-3 rounded-lg shadow-sm">{error}</div>
        ) : null}

        <form onSubmit={onSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-5">
              <div>
                <div className="mb-2 text-neutral-700 font-medium">Email</div>
                <input
                  type="email"
                  className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none text-gray-500"
                  value={email}
                  readOnly
                />
              </div>

              <div>
                <div className="mb-2 text-neutral-700 font-medium">Display name</div>
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="mb-2 text-neutral-700 font-medium">Phone</div>
                  <input
                    type="tel"
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                  />
                  {phoneError ? <div className="mt-1 text-xs text-red-600">{phoneError}</div> : null}
                </div>
                <div>
                  <div className="mb-2 text-neutral-700 font-medium">Company</div>
                  <input
                    type="text"
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                    placeholder="Your company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    maxLength={80}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="mb-2 text-neutral-700 font-medium">Role/Title</div>
                  <input
                    type="text"
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                    placeholder="e.g., Analyst"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    maxLength={60}
                  />
                </div>
                <div>
                  <div className="mb-2 text-neutral-700 font-medium">Timezone</div>
                  <select
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                    value={timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 text-neutral-700 font-medium">Bio</div>
                <textarea
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                  placeholder="Tell us about yourself"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-neutral-500">Max 500 characters</div>
              </div>

              <div>
                <div className="mb-2 text-neutral-700 font-medium">Preferences</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 text-neutral-600 text-sm">Theme</div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm"><input type="radio" name="theme" className="accent-blue-600" checked={theme === "light"} onChange={() => setTheme("light")} /> Light</label>
                      <label className="inline-flex items-center gap-2 text-sm"><input type="radio" name="theme" className="accent-blue-600" checked={theme === "dark"} onChange={() => setTheme("dark")} /> Dark</label>
                      <label className="inline-flex items-center gap-2 text-sm"><input type="radio" name="theme" className="accent-blue-600" checked={theme === "system"} onChange={() => setTheme("system")} /> System</label>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-neutral-600 text-sm">Notification types</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={prefInfo} onChange={(e) => setPrefInfo(e.target.checked)} /> Info</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={prefSuccess} onChange={(e) => setPrefSuccess(e.target.checked)} /> Success</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={prefWarning} onChange={(e) => setPrefWarning(e.target.checked)} /> Warning</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={prefError} onChange={(e) => setPrefError(e.target.checked)} /> Error</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 ${
              saving
                ? "opacity-60 cursor-not-allowed bg-neutral-200 text-neutral-500"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
            }`}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <div className="text-xl font-bold text-gray-900 mb-4">Security</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={onChangeEmail} className="space-y-3 p-4 rounded-xl ring-1 ring-black/5 bg-white/70">
              <div className="text-sm font-semibold text-neutral-700">Change email</div>
              <input type="email" value={secNewEmail} onChange={(e) => setSecNewEmail(e.target.value)} placeholder="New email" className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="password" value={secCurrentPassword} onChange={(e) => setSecCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <button type="submit" disabled={secLoading} className={`w-full rounded-lg px-4 py-2 text-sm font-semibold ${secLoading ? "opacity-60 bg-neutral-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Update email</button>
            </form>

            <form onSubmit={onChangePassword} className="space-y-3 p-4 rounded-xl ring-1 ring-black/5 bg-white/70">
              <div className="text-sm font-semibold text-neutral-700">Change password</div>
              <input type="password" value={secNewPassword} onChange={(e) => setSecNewPassword(e.target.value)} placeholder="New password (min 6)" className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="password" value={secCurrentPassword} onChange={(e) => setSecCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <button type="submit" disabled={secLoading} className={`w-full rounded-lg px-4 py-2 text-sm font-semibold ${secLoading ? "opacity-60 bg-neutral-200" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>Update password</button>
            </form>
          </div>

          <div className="mt-6 p-4 rounded-xl ring-1 ring-red-200 bg-red-50/70">
            <div className="text-sm font-semibold text-red-700 mb-2">Danger zone</div>
            <div className="text-xs text-red-600 mb-3">This will permanently delete your account and cannot be undone.</div>
            <div className="flex justify-end">
              <button onClick={onDeleteAccount} disabled={secLoading} className={`px-4 py-2 rounded-lg text-sm font-semibold ${secLoading ? "opacity-60 bg-red-300 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}>Delete account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {savedToast ? (
      <div className="fixed bottom-4 right-4 z-[60] px-3 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg">{savedToast}</div>
    ) : null}
    </>
  );
}
