import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User 
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        setSuccessMsg('Account created successfully! Signed in.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Firebase auth error:', err);
      let friendly = err.message || 'Authentication failed.';
      if (err.code === 'auth/email-already-in-use') {
        friendly = 'This email address is already in use by another account.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendly = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/weak-password') {
        friendly = 'The password is too weak. Please use at least 6 characters.';
      }
      setErrorMsg(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSuccessMsg('Signed out successfully. Guest anonymous session restored.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign out failed.');
    }
  };

  const isRealUser = currentUser && !currentUser.isAnonymous && currentUser.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isRealUser ? 'Account & Session' : 'Admin Authentication'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRealUser ? 'Manage your live Firebase profile' : 'Sign in to sync dashboard data via Firebase Auth'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status Badge */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                isRealUser ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Current Session Status</p>
                <p className="text-sm font-bold text-slate-900">
                  {isRealUser 
                    ? (currentUser.displayName || currentUser.email) 
                    : 'Guest Admin (Anonymous)'}
                </p>
                {isRealUser && (
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                )}
              </div>
            </div>

            {isRealUser && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form for Signing In / Registering */}
          {!isRealUser && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {/* Tab switcher inside modal */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setErrorMsg(null); }}
                  className={`py-1.5 rounded-md transition-all ${
                    !isRegistering 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setErrorMsg(null); }}
                  className={`py-1.5 rounded-md transition-all ${
                    isRegistering 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Josh Massieu"
                      className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Firebase Account</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}

          {isRealUser && (
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 text-xs text-teal-900 space-y-1.5">
              <p className="font-semibold">Live Firebase Authentication active</p>
              <p className="text-teal-700">
                Your workspace is authenticated with Firebase project <strong>ai-chatbot-on-website</strong>. All changes to clients, leads, and appointments are persisted directly to your real Firestore database.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Powered by Firebase Auth & Firestore</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
