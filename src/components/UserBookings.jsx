import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  MessageCircle,
  ChevronRight,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            // Sort by createdAt descending (newest first)
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
        console.log("Current User ID:", currentUser.uid);
        console.log("Fetched Bookings:", bookingsData);
        setBookings(bookingsData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  const upcomingBookings = bookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status?.toLowerCase()),
  );
  const pastBookings = bookings.filter((b) =>
    ["completed", "canceled"].includes(b.status?.toLowerCase()),
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mb-12 animate-pulse">
        <div className="h-8 w-48 bg-black/5 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-black/5 rounded-[24px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-[20px] md:text-[22px] font-fraunces font-light text-[#2D1B2E]">
          Your <em className="italic text-[#D4688A]">Bookings</em>
        </h2>

        {/* Tab Switcher - Pill design */}
        <div className="flex bg-white/50 p-1 rounded-full border border-black/5 self-start">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
              activeTab === "upcoming"
                ? "bg-[#2D1B2E] text-white shadow-md"
                : "text-[#2D1B2E]/60 hover:text-[#2D1B2E]"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
              activeTab === "history"
                ? "bg-[#2D1B2E] text-white shadow-md"
                : "text-[#2D1B2E]/60 hover:text-[#2D1B2E]"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === "upcoming" ? (
        upcomingBookings.length === 0 ? (
          <Link to="/booking" className="block no-underline">
            <div className="bg-white/50 border border-dashed border-[#D4688A]/30 rounded-[24px] p-8 flex flex-col items-center justify-center group hover:bg-[#FFF5F8] transition-all">
              <div className="w-14 h-14 bg-[#FFF5F8] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Calendar className="text-[#D4688A]" size={28} />
              </div>
              <h3 className="text-[#2D1B2E] text-base font-semibold">
                No active sessions
              </h3>
              <p className="text-[#2D1B2E]/60 text-sm mt-1 text-center max-w-sm">
                Need help navigating your health journey? Book a 1-on-1 session
                today.
              </p>
              <div className="mt-4 text-[#D4688A] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Book Now <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-[24px] p-6 shadow-sm border border-black/5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#2D1B2E]/40 mb-1">
                      {booking.package}
                    </div>
                    <h3 className="text-[17px] font-semibold text-[#2D1B2E]">
                      {booking.fullName}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      booking.status?.toLowerCase() === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}
                  >
                    {booking.status?.toLowerCase() === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </div>

                <div className="space-y-3 mt-auto">
                  <div className="flex items-center gap-3 text-[13px] text-[#2D1B2E]/70 font-medium">
                    <Calendar size={16} className="text-[#D4688A]" />
                    {formatDate(booking.createdAt)}
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#2D1B2E]/70 font-medium">
                    <Clock size={16} className="text-[#D4688A]" />
                    {booking.preferredTime}
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5">
                    <div className="flex items-start gap-3 bg-[#FFF5F8]/50 p-3 rounded-xl border border-[#D4688A]/5">
                      <MessageCircle
                        size={14}
                        className="text-[#D4688A] mt-0.5 shrink-0"
                      />
                      <p className="text-[11px] leading-relaxed text-[#2D1B2E]/60 italic font-jost">
                        Reach out via WhatsApp:{" "}
                        <span className="font-bold text-[#D4688A]">
                          {booking.whatsapp}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : pastBookings.length === 0 ? (
        <div className="bg-white/30 rounded-[24px] p-12 flex flex-col items-center justify-center border border-black/5">
          <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
            <History className="text-[#2D1B2E]/40" size={24} />
          </div>
          <p className="text-[#2D1B2E]/60 text-sm font-medium">
            Your past sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
          {pastBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white/80 rounded-[24px] p-6 shadow-sm border border-black/5 flex flex-col grayscale-[0.3]"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#2D1B2E]/40 mb-1">
                    {booking.package}
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#2D1B2E]">
                    {booking.fullName}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    booking.status?.toLowerCase() === "completed"
                      ? "bg-black/5 text-black/40 border border-black/10"
                      : "bg-red-50 text-red-700 border border-red-100 opacity-60"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-[#2D1B2E]/50 font-medium">
                <Calendar size={16} className="text-[#2D1B2E]/30" />
                {formatDate(booking.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
