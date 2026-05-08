import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const userCred = await signup(email, password);
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, "users", userCred.user.uid, "profile", "data"), {
          name,
          email,
          createdAt: new Date(),
          onboardingComplete: false,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      
      switch (err.code) {
        case "auth/user-not-found":
          friendlyMessage = "User does not exist. Please check your email or sign up.";
          break;
        case "auth/wrong-password":
          friendlyMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          friendlyMessage = "The email address is invalid.";
          break;
        case "auth/invalid-credential":
          friendlyMessage = isLogin 
            ? "Invalid email or password. Please try again." 
            : "Could not complete sign up. Please check your details.";
          break;
        case "auth/email-already-in-use":
          friendlyMessage = "This email is already registered. Try logging in.";
          break;
        case "auth/weak-password":
          friendlyMessage = "Password should be at least 6 characters.";
          break;
        case "auth/too-many-requests":
          friendlyMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          friendlyMessage = err.message || friendlyMessage;
      }
      setError(friendlyMessage);
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      return setError("Please enter your email address first.");
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Password reset link sent! Check your inbox 🌸");
    } catch {
      setError("Failed to send reset email. Please check the email address.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-petal">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="text-3xl font-medium text-[#2D1B2E] mb-2">
            Her
            <em className="italic text-[#D4688A] font-[Fraunces,serif]">
              Health
            </em>
          </div>
          <p className="text-[14px] text-[#2D1B2E]/60">
            {isLogin
              ? "Welcome back to your health journey."
              : "Begin your health journey with us."}
          </p>
        </div>

        <div className="flex gap-5 mb-8 border-b border-black/5">
          <div
            className={`py-2 px-1 text-[14px] cursor-pointer transition-colors ${isLogin ? "text-[#D4688A] font-semibold border-b-2 border-[#D4688A]" : "text-[#2D1B2E]/60 font-medium hover:text-[#2D1B2E]"}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setMessage("");
              setEmail("");
              setPassword("");
              setName("");
            }}
          >
            Login
          </div>
          <div
            className={`py-2 px-1 text-[14px] cursor-pointer transition-colors ${!isLogin ? "text-[#D4688A] font-semibold border-b-2 border-[#D4688A]" : "text-[#2D1B2E]/60 font-medium hover:text-[#2D1B2E]"}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setMessage("");
              setEmail("");
              setPassword("");
              setName("");
            }}
          >
            Sign Up
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="text-[10px] font-semibold tracking-[1.2px] text-[#2D1B2E]/60 mb-2 block">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white mb-4"
                placeholder=""
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold tracking-[1.2px] text-[#2D1B2E]/60 mb-2 block">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white mb-4"
              placeholder=""
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[1.2px] text-[#2D1B2E]/60 mb-2 block">
              Password
            </label>
            <input
              type="password"
              required={isLogin}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white mb-4"
              placeholder=""
            />
            {isLogin && (
              <div className="text-right mt-1 mb-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-[#D4688A] hover:text-[#BE185D] transition-colors no-underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-[#d32f2f] bg-[#fdecea] p-3 rounded-lg text-[13px] font-medium mb-4 text-center">
              {error}
            </p>
          )}
          {message && (
            <p className="text-[#065f46] bg-[#ecfdf5] p-3 rounded-lg text-[13px] font-medium mb-4 text-center">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#D4688A] text-white rounded-[16px] py-4 w-full font-medium text-[15px] hover:bg-[#BE185D] transition-colors mt-2 disabled:opacity-70"
          >
            {loading ? "Processing..." : isLogin ? "Login →" : "Sign Up →"}
          </button>
        </form>
      </div>
    </div>
  );
}
