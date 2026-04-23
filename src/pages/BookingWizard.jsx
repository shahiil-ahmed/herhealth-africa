import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ClipboardList,
  Heart,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BookingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    package: "",
    fullName: "",
    whatsapp: "",
    concern: "",
    preferredTime: "",
    duration: "",
    seenDoctor: "",
    notes: "",
    otherConcern: "",
  });

  const handlePackageSelect = (pkgName) => {
    setBookingData({ ...bookingData, package: pkgName });
    setError("");
    setStep(2);
  };

  const handleContinue = () => {
    if (!bookingData.fullName.trim() || !bookingData.whatsapp.trim() || !bookingData.preferredTime) {
      setError(
        "Almost there — please fill in your name, WhatsApp number and preferred time. 🌸",
      );
      return;
    }
    setError("");
    setStep(3);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError("You must be logged in to book a session.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingsRef = collection(db, "users", auth.currentUser.uid, "bookings");
      await addDoc(bookingsRef, {
        ...bookingData,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setStep(4);
      setBookingData({
        package: "",
        fullName: "",
        whatsapp: "",
        concern: "",
        preferredTime: "",
        duration: "",
        seenDoctor: "",
        notes: "",
        otherConcern: "",
      });
    } catch (err) {
      console.error("Error saving booking:", err);
      setError("Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Outer background filling the screen */
    <div className="min-h-screen bg-petal px-4 pt-6 pb-32 md:p-8 lg:p-12">
      {/* Main Split-Card Container */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden flex flex-col lg:flex-row">
        {/* ========================================= */}
        {/* LEFT COLUMN: The Booking Wizard (Flex-1)  */}
        {/* ========================================= */}
        <div className="flex-1 p-6 md:p-10 lg:p-14">
          {step < 4 && (
            <>
              {/* Disclaimer moved to the very first section of the page */}
              <div className="mb-6 md:mb-8 bg-[#FFF5F8] rounded-[20px] p-5 border border-[#FEE2E2]">
                <p className="text-[#D4688A] text-xs leading-relaxed font-medium">
                  <span className="font-bold flex items-center gap-1.5 mb-1.5 text-sm">
                    <ShieldCheck size={16} /> Please note
                  </span>
                  HerHealth provides health navigation and advocacy support only. We
                  do not diagnose, prescribe or treat. We connect you with the right
                  specialists.
                </p>
              </div>

              {/* Mobile Header with Back Button (Hidden on Desktop) */}
              <div className="flex items-center justify-center relative h-10 mb-2 md:hidden">
                <button
                  onClick={() => step > 1 && setStep(step - 1)}
                  className="bg-transparent text-[#D4688A] w-10 h-10 rounded-full flex items-center justify-center shrink-0 absolute left-0 transition-transform active:scale-95 border border-[#D4688A] hover:bg-[#FFF5F8]"
                >
                  <ChevronLeft size={20} />
                </button>
                <h1 className="w-full text-center text-xl font-medium text-[#2D1B2E]">
                  Book a{" "}
                  <span className="text-[#D4688A] italic font-[Fraunces,serif]">
                    Session
                  </span>
                </h1>
              </div>

              {/* Desktop Header */}
              <h1 className="hidden md:block text-3xl lg:text-4xl font-medium text-[#2D1B2E]">
                Book a{" "}
                <span className="text-[#D4688A] italic font-[Fraunces,serif]">
                  Session
                </span>
              </h1>
            </>
          )}

          {/* STEP 1 UI */}
          {step === 1 && (
            <>
              {/* Progress Bar & Step Header */}
              <div className="h-1.5 w-full bg-[#FFF5F8] mt-6 md:mt-10 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-[#D4688A] rounded-full transition-all duration-500"></div>
              </div>

              <p className="tracking-[0.15em] text-[11px] text-[#2D1B2E]/60 mt-5 font-bold">
                Step 1 of 3
              </p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-[#2D1B2E]">
                Choose your{" "}
                <span className="text-[#D4688A] italic font-[Fraunces,serif]">
                  package
                </span>
              </h2>

              <p className="text-sm md:text-base text-[#2D1B2E]/60 mb-8 mt-2">
                Every session is with a trained HerHealth Navigator — not a bot.
              </p>

              {/* Package Cards */}
              <div className="space-y-4 md:space-y-5">
                {/* Card 1 */}
                <div
                  onClick={() => handlePackageSelect("Navigation Session")}
                  className="bg-white rounded-[24px] p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#D4688A] hover:shadow-[0_4px_20px_rgba(212,104,138,0.15)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5F8] text-[#D4688A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#D4688A]/5">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#2D1B2E] text-lg md:text-xl">
                        Navigation Session
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[#D4688A] font-bold text-lg">
                          ₦35,000
                        </span>
                        <span className="bg-[#D4688A] text-white text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold">
                          Most popular
                        </span>
                      </div>
                    </div>
                    <p className="text-[#2D1B2E]/60 text-sm mt-2 leading-relaxed">
                      60-min deep dive into your symptoms, medical history and
                      concerns. Leaves with a personalised action plan and
                      doctor prep guide.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  onClick={() => handlePackageSelect("Care Bundle")}
                  className="bg-white rounded-[24px] p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#D4688A] hover:shadow-[0_4px_20px_rgba(212,104,138,0.15)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5F8] text-[#D4688A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#D4688A]/5">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#2D1B2E] text-lg md:text-xl">
                        Care Bundle
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#2D1B2E] text-lg group-hover:text-[#D4688A] transition-colors">
                          ₦75,000
                        </span>
                        <span className="bg-[#E8EFE6] text-[#4A6741] text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold">
                          Save ₦30k
                        </span>
                      </div>
                    </div>
                    <p className="text-[#2D1B2E]/60 text-sm mt-2 leading-relaxed">
                      3 sessions over 4 weeks. Includes symptom tracking review,
                      specialist referrals, and ongoing WhatsApp support between
                      sessions.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  onClick={() => handlePackageSelect("Follow-Up Session")}
                  className="bg-white rounded-[24px] p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#D4688A] hover:shadow-[0_4px_20px_rgba(212,104,138,0.15)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5F8] text-[#D4688A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#D4688A]/5">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#2D1B2E] text-lg md:text-xl">
                        Follow-Up Session
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#2D1B2E] text-lg group-hover:text-[#D4688A] transition-colors">
                          ₦25,000
                        </span>
                      </div>
                    </div>
                    <p className="text-[#2D1B2E]/60 text-sm mt-2 leading-relaxed">
                      30-min check-in for existing clients. Review progress,
                      update your health journal, and plan next steps.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 UI */}
          {step === 2 && (
            <>
              {/* Progress Bar & Step Header */}
              <div className="h-1.5 w-full bg-[#FFF5F8] mt-6 md:mt-10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-[#D4688A] rounded-full transition-all duration-500"></div>
              </div>

              <p className="tracking-[0.15em] text-[11px] text-[#2D1B2E]/60 mt-5 font-bold">
                Step 2 of 3
              </p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-[#2D1B2E]">
                Your{" "}
                <span className="text-[#D4688A] italic font-[Fraunces,serif]">
                  details
                </span>
              </h2>

              <p className="text-sm md:text-base text-[#2D1B2E]/60 mb-8 mt-2">
                So your navigator can prepare properly for your session.
              </p>

              {/* Selected Package Summary */}
              {bookingData.package && (
                <div
                  onClick={() => setStep(1)}
                  className="bg-[#FFF5F8] border-[1.5px] border-[#D4688A]/20 rounded-[20px] p-4 flex items-center justify-between mb-8 cursor-pointer hover:border-[#D4688A]/40 transition-all group"
                >
                  <div>
                    <p className="text-[10px] font-bold text-[#D4688A] mb-1">
                      Selected package
                    </p>
                    <p className="font-semibold text-[#2D1B2E] text-[15px]">
                      {bookingData.package}
                    </p>
                  </div>
                  <div className="text-[#D4688A] text-sm font-medium bg-white px-4 py-2 rounded-full shadow-sm group-hover:shadow-md transition-all">
                    Change
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    Full name <span className="text-[#D4688A]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={bookingData.fullName}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, fullName: e.target.value })
                    }
                    className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    WhatsApp number <span className="text-[#D4688A]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={bookingData.whatsapp}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, whatsapp: e.target.value })
                    }
                    className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    Your main concern
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[
                      "Fibroids",
                      "PCOS",
                      "Endometriosis",
                      "Painful Periods",
                      "Hormonal Issues",
                      "Thyroid",
                       "Fertility",
                       "Perimenopause",
                       "Not Sure",
                       "Other",
                     ].map((item) => (
                       <div
                         key={item}
                         onClick={() =>
                           setBookingData({ ...bookingData, concern: item })
                         }
                         className={`rounded-full px-4 py-2 text-sm cursor-pointer transition-all ${
                           bookingData.concern === item
                             ? "bg-[#D4688A] text-white border-transparent shadow-md"
                             : "bg-[#FFF5F8]/40 border-[#D4688A]/10 text-[#2D1B2E]/70 hover:border-[#D4688A]/30 border-[1.5px]"
                         }`}
                       >
                         {item}
                       </div>
                     ))}
                   </div>
 
                   {bookingData.concern === "Other" && (
                     <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                       <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                         Please specify your concern
                       </label>
                       <textarea
                         value={bookingData.otherConcern}
                         onChange={(e) =>
                           setBookingData({
                             ...bookingData,
                             otherConcern: e.target.value,
                           })
                         }
                         rows={3}
                         placeholder="Tell us a bit more..."
                         className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[14px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white resize-none"
                       />
                     </div>
                   )}
                 </div>

                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    Preferred session time{" "}
                    <span className="text-[#D4688A]">*</span>
                  </label>
                  <select
                    value={bookingData.preferredTime}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, preferredTime: e.target.value })
                    }
                    className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white"
                  >
                    <option value="" disabled>
                      Choose a time slot
                    </option>
                    <option value="Weekday Morning">
                      Weekday Morning
                    </option>
                    <option value="Weekday Afternoon">
                      Weekday Afternoon
                    </option>
                    <option value="Weekday Evening">
                      Weekday Evening
                    </option>
                    <option value="Saturday Morning">
                      Saturday Morning
                    </option>
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    className="bg-[#FFF5F8] text-[#D4688A] rounded-[16px] py-4 sm:px-8 font-medium text-[15px] hover:bg-[#FAF0F4] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContinue}
                    className="bg-[#D4688A] text-white rounded-[16px] py-4 flex-1 font-medium text-[15px] hover:bg-[#BE185D] transition-colors"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 3 UI */}
          {step === 3 && (
            <>
              {/* Progress Bar & Step Header */}
              <div className="h-1.5 w-full bg-[#FFF5F8] mt-6 md:mt-10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#D4688A] rounded-full transition-all duration-500"></div>
              </div>

              <p className="tracking-[0.15em] text-[11px] text-[#2D1B2E]/60 mt-5 font-bold">
                Step 3 of 3
              </p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-[#2D1B2E]">
                Almost{" "}
                <span className="text-[#D4688A] italic font-[Fraunces,serif]">
                  there
                </span>
              </h2>

              <p className="text-sm md:text-base text-[#2D1B2E]/60 mb-8 mt-2">
                Tell your navigator a little more so they can truly show up for
                you.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    How long have you had these symptoms?
                  </label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, duration: e.target.value })
                    }
                    className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white"
                  >
                    <option value="" disabled>
                      Select duration
                    </option>
                    <option value="Less than 6 months">
                      Less than 6 months
                    </option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="More than 3 years">More than 3 years</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    Have you seen a doctor about this before?
                  </label>
                  <select
                    value={bookingData.seenDoctor}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, seenDoctor: e.target.value })
                    }
                    className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Yes, and I have a diagnosis">
                      Yes, and I have a diagnosis
                    </option>
                    <option value="Yes, but no clear answer">
                      Yes, but no clear answer
                    </option>
                    <option value="No, this is my first step">
                      No, this is my first step
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#2D1B2E]/60 mb-2 block">
                    Anything else you want your navigator to know?
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        notes: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Share as much or as little as you like. This is a safe space."
                    className="w-full bg-[#FAF9F6] border-[1.5px] border-black/10 rounded-[16px] px-5 py-4 font-jost text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] focus:bg-white resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-[#FFF5F8] text-[#D4688A] rounded-[16px] py-4 sm:px-8 font-medium text-[15px] hover:bg-[#FAF0F4] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="bg-[#D4688A] text-white rounded-[16px] py-4 flex-1 font-medium text-[15px] hover:bg-[#BE185D] transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      "Confirm & Book Session →"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 4 UI (SUCCESS STATE) */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center text-center py-10 md:py-20 h-full">
              <div className="w-20 h-20 bg-[#FFF5F8] rounded-full flex items-center justify-center text-3xl mb-8">
                🌸
              </div>
              
              <h2 className="text-3xl md:text-4xl font-medium text-[#2D1B2E] mb-4">
                You're <span className="italic text-[#D4688A] font-[Fraunces,serif]">booked!</span>
              </h2>
              
              <p className="text-[#2D1B2E]/70 text-sm md:text-base leading-relaxed max-w-sm mx-auto mb-10">
                Your session request has been received. Your HerHealth Navigator will reach out on WhatsApp within 24 hours to confirm your time. You deserve this. 🌸
              </p>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full max-w-xs bg-[#D4688A] text-white rounded-[16px] py-4 font-medium text-[15px] hover:bg-[#BE185D] transition-colors mb-4"
              >
                Back to Home
              </button>
              
              <button
                onClick={() => navigate('/sisterhood')}
                className="w-full max-w-xs bg-transparent border border-[1.5px] border-[#D4688A]/20 text-[#D4688A] rounded-[16px] py-4 font-medium text-[15px] hover:border-[#D4688A] hover:bg-[#FFF5F8] transition-colors"
              >
                Visit the Sisterhood
              </button>
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: Info Panel (Desktop Sidebar)*/}
        {/* ========================================= */}
        {step < 4 && (
          <div className="bg-[#FFF5F8] lg:w-[420px] p-6 md:p-10 lg:p-14 border-t lg:border-t-0 lg:border-l border-[#FEE2E2] flex flex-col justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-[#2D1B2E] mb-8">
                Why book with{" "}
                <span className="italic text-[#D4688A] font-[Fraunces,serif]">
                  HerHealth?
                </span>
              </h3>

              <ul className="space-y-6 md:space-y-8">
                <li className="flex gap-4">
                  <CheckCircle2
                    className="text-[#D4688A] shrink-0 mt-0.5"
                    size={22}
                  />
                  <div>
                    <h4 className="font-semibold text-[#2D1B2E] text-base">
                      Expert Navigators
                    </h4>
                    <p className="text-sm text-[#2D1B2E]/70 mt-1 leading-relaxed">
                      Speak directly with trained professionals who understand
                      African women's health nuances.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2
                    className="text-[#D4688A] shrink-0 mt-0.5"
                    size={22}
                  />
                  <div>
                    <h4 className="font-semibold text-[#2D1B2E] text-base">
                      Actionable Care Plans
                    </h4>
                    <p className="text-sm text-[#2D1B2E]/70 mt-1 leading-relaxed">
                      Leave every session with clear next steps, dietary guides,
                      and doctor prep checklists.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2
                    className="text-[#D4688A] shrink-0 mt-0.5"
                    size={22}
                  />
                  <div>
                    <h4 className="font-semibold text-[#2D1B2E] text-base">
                      Safe & Confidential
                    </h4>
                    <p className="text-sm text-[#2D1B2E]/70 mt-1 leading-relaxed">
                      HerHealth is a private, secure space where your information
                      is never shared without your consent.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
