import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface AuthProps {
  onLogin: () => void;
}

interface Notice {
  type: 'success' | 'error';
  title: string;
  message: string;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [creds, setCreds] = useState({ username: '', password: '', email: '' });
  const [notice, setNotice] = useState<Notice | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login Request
        const res = await api.post('login/', { 
          username: creds.username, 
          password: creds.password 
        });
        
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        onLogin();
        navigate('/scan'); // Move navigation here so it only triggers on success
        
      } else {
        // Registration Request
        await api.post('register/', { 
            username: creds.username, 
            email: creds.email, 
            password1: creds.password, 
            password2: creds.password 
        });
        
        setNotice({
          type: 'success',
          title: 'Your pantry is ready',
          message: 'Account created. Sign in to start planning your next meal.',
        });
        setIsLogin(true); 
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      // --- SMART ERROR PARSING ---
      if (err.response && err.response.data) {
        const errorData = err.response.data;

        // 1. Check for standard 'detail' error (Common in Logins)
        if (errorData.detail) {
          setNotice({ type: 'error', title: 'We could not sign you in', message: String(errorData.detail) });
          return;
        }

        // 2. Check for form validation errors (Common in Registration)
        if (typeof errorData === 'object') {
          const formattedErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              // Convert arrays to strings if necessary
              const errorText = Array.isArray(messages) ? messages.join(' ') : String(messages);
              // Capitalize the field name
              const cleanField = field.charAt(0).toUpperCase() + field.slice(1);
              return `${cleanField}: ${errorText}`;
            })
            .join(' ');

          setNotice({ type: 'error', title: 'A small fix is needed', message: formattedErrors });
        } else {
           setNotice({ type: 'error', title: 'Something went wrong', message: String(errorData) });
        }
      } else {
        // 3. Fallback for actual network/server crashes
        setNotice({
          type: 'error',
          title: 'The pantry is taking a moment',
          message: 'We could not reach the server. Check your connection and try again.',
        });
      }
    }
  };

  return (
    <div className="fade-up grid min-h-[calc(100vh-160px)] items-center gap-12 py-4 lg:grid-cols-[1fr_430px] lg:gap-24">
      <section className="hidden lg:block">
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#66832b]">A calmer way to cook</p>
        <h1 className="display-font max-w-xl text-6xl leading-[0.95] text-[#18231f]">Know what you have. <span className="text-[#e25345]">Make something good.</span></h1>
        <p className="mt-7 max-w-md text-lg leading-8 text-slate-600">Snap a photo of your groceries, keep your pantry tidy, and let your next meal find you.</p>
        <div className="mt-12 flex gap-3 text-sm font-semibold text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2">✦ Less waste</span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-4 py-2">◌ More dinner</span>
        </div>
      </section>
      <form onSubmit={handleSubmit} className="w-full rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(24,35,31,0.12)] md:p-9">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#66832b]">Welcome in</p>
          <h2 className="display-font text-4xl text-[#18231f]">
            {isLogin ? 'Back to the pantry' : 'Start your pantry'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{isLogin ? 'Your ingredients are waiting.' : 'A little order for a lot more inspiration.'}</p>
        </div>

        {notice && (
          <div
            role="status"
            className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              notice.type === 'success'
                ? 'border-[#cbdba7] bg-[#f2f8e7] text-[#50651f]'
                : 'border-[#ffc4bd] bg-[#fff1ee] text-[#a83d35]'
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-base shadow-sm">
              {notice.type === 'success' ? '✓' : '!'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{notice.title}</p>
              <p className="mt-1 leading-5 opacity-90">{notice.message}</p>
            </div>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setNotice(null)}
              className="text-lg leading-none opacity-60 transition hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          <input 
            className="w-full rounded-xl border border-slate-200 bg-[#f7f8f3] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8aaa3d] focus:ring-4 focus:ring-[#d9f36a]/40"
            type="text" placeholder="Username" 
            onChange={e => { setNotice(null); setCreds({...creds, username: e.target.value}); }} 
            required
          />

          {!isLogin && (
            <input 
              className="w-full rounded-xl border border-slate-200 bg-[#f7f8f3] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8aaa3d] focus:ring-4 focus:ring-[#d9f36a]/40"
              type="email" placeholder="Email Address" 
              onChange={e => { setNotice(null); setCreds({...creds, email: e.target.value}); }} 
              required
            />
          )}
          
          <input 
            className="w-full rounded-xl border border-slate-200 bg-[#f7f8f3] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8aaa3d] focus:ring-4 focus:ring-[#d9f36a]/40"
            type="password" placeholder="Password" 
            onChange={e => { setNotice(null); setCreds({...creds, password: e.target.value}); }} 
            required
          />
        </div>
        
        <button type="submit" className="mt-6 w-full rounded-xl bg-[#18231f] px-4 py-3.5 font-bold text-white shadow-[4px_4px_0_#d9f36a] transition hover:-translate-y-0.5 hover:shadow-[5px_6px_0_#d9f36a]">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Need an account?" : "Already a member?"}
          <button 
            type="button"
            onClick={() => { setNotice(null); setIsLogin(!isLogin); }}
            className="ml-2 font-bold text-[#66832b] hover:text-[#18231f]"
          >
            {isLogin ? 'Sign Up Free' : 'Back to Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;