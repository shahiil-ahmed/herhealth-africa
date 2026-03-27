import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
        // Note: we could also update the user's display name here using updateProfile
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-8 py-10 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="font-fraunces text-[32px] font-extralight mb-2 text-ink">
            Her<em className="italic text-clay">Health</em>
          </div>
          <p className="text-[14px] text-dust">
            {isLogin ? 'Welcome back to your health journey.' : 'Begin your health journey with us.'}
          </p>
        </div>

        <div className="flex gap-5 mb-6 border-b border-black/5">
          <div 
            className={`py-2 px-1 text-[14px] cursor-pointer relative ${isLogin ? 'text-clay font-semibold after:content-[""] after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[2px] after:bg-clay' : 'text-dust font-medium'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </div>
          <div 
            className={`py-2 px-1 text-[14px] cursor-pointer relative ${!isLogin ? 'text-clay font-semibold after:content-[""] after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[2px] after:bg-clay' : 'text-dust font-medium'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-[18px]">
              <label className="text-[10px] font-semibold tracking-[1.2px] uppercase text-dust mb-2 block">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-base-white border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none transition-all duration-200 focus:border-clay focus:ring-[3px] focus:ring-clay/10"
                placeholder="Amara Okafor"
              />
            </div>
          )}
          
          <div className="mb-[18px]">
            <label className="text-[10px] font-semibold tracking-[1.2px] uppercase text-dust mb-2 block">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-base-white border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none transition-all duration-200 focus:border-clay focus:ring-[3px] focus:ring-clay/10"
              placeholder="name@email.com"
            />
          </div>
          
          <div className="mb-[18px]">
            <label className="text-[10px] font-semibold tracking-[1.2px] uppercase text-dust mb-2 block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-base-white border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none transition-all duration-200 focus:border-clay focus:ring-[3px] focus:ring-clay/10"
              placeholder="••••••••"
            />
            {isLogin && (
              <div className="text-right mt-2">
                <a href="#" className="text-[11px] text-clay no-underline">Forgot Password?</a>
              </div>
            )}
          </div>
          
          {error && <p className="text-[#d32f2f] text-[12px] mb-4">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-clay text-white border-none rounded-[14px] px-6 py-4 font-jost text-[14px] font-medium w-full cursor-pointer transition-all duration-200 tracking-[0.3px] relative overflow-hidden hover:bg-clay-deep hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(184,92,56,0.35)] disabled:opacity-70 after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_60%)]"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login →' : 'Sign Up →')}
          </button>
        </form>
      </div>
    </div>
  );
}
