import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';

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
        const userCred = await signup(email, password);
        await updateProfile(userCred.user, { displayName: name });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] items-center justify-center p-4 sm:p-8">
      
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 p-8 md:p-10">
        
        <div className="text-center mb-8">
          <div className="font-fraunces text-[32px] font-extralight mb-2 text-ink">
            Her<em className="italic text-clay">Health</em>
          </div>
          <p className="text-[14px] text-dust">
            {isLogin ? 'Welcome back to your health journey.' : 'Begin your health journey with us.'}
          </p>
        </div>

        <div className="flex gap-5 mb-8 border-b border-black/5">
          <div 
            className={`py-2 px-1 text-[14px] cursor-pointer relative transition-colors ${isLogin ? 'text-clay font-semibold after:content-[""] after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[2px] after:bg-clay' : 'text-dust font-medium hover:text-ink'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </div>
          <div 
            className={`py-2 px-1 text-[14px] cursor-pointer relative transition-colors ${!isLogin ? 'text-clay font-semibold after:content-[""] after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[2px] after:bg-clay' : 'text-dust font-medium hover:text-ink'}`}
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
                className="w-full bg-[#FAF9F6] border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none transition-all duration-200 focus:border-clay focus:ring-[3px] focus:ring-clay/10 focus:bg-white"
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
              className="w-full bg-[#FAF9F6] border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none transition-all duration-200 focus:border-clay focus:ring-[3px] focus:ring-clay/10 focus:bg-white"
              placeholder="name@email.com"
            />
          </div>
          
          <div className="mb-[24px]">
            <label className="text-[10px] font-semibold tracking-[1.2px] uppercase text-dust mb-2 block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAF9F6] border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none transition-all duration-200 focus:border-clay focus:ring-[3px] focus:ring-clay/10 focus:bg-white"
              placeholder="••••••••"
            />
            {isLogin && (
              <div className="text-right mt-3">
                <a href="#" className="text-[11px] font-medium text-clay hover:text-clay-deep transition-colors no-underline">Forgot Password?</a>
              </div>
            )}
          </div>
          
          {error && <p className="text-[#d32f2f] bg-[#fdecea] p-3 rounded-lg text-[13px] font-medium mb-4 text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-clay text-white border-none rounded-[14px] px-6 py-[14px] font-jost text-[15px] font-medium w-full cursor-pointer transition-all duration-200 tracking-[0.3px] relative overflow-hidden hover:bg-clay/90 hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login →' : 'Sign Up →')}
          </button>
        </form>
      </div>
    </div>
  );
}