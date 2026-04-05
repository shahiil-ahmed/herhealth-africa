import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CalendarCheck, UserPlus, Bell, Search, Trash2, Plus, X, Heart } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSpecialist, setNewSpecialist] = useState({ 
    name: '', 
    specialty: '',
    location: 'Lagos',
    category: 'Gynaecology'
  });

  // Fetch Bookings Real-time
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Users Real-time
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Specialists Real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'specialists'), (snapshot) => {
      const specialistsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpecialists(specialistsData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Nominations Real-time
  useEffect(() => {
    const q = query(collection(db, 'nominations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNominations(data);
    });
    return () => unsubscribe();
  }, []);

  // Calculate dynamic stats
  const totalUsers = users.length;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const bookingsThisWeek = bookings.filter(b => {
    const createdAt = b.createdAt?.toDate();
    return createdAt && createdAt > oneWeekAgo;
  }).length;

  const stats = { 
    totalUsers, 
    bookingsThisWeek, 
    totalNominations: nominations.length,
    activeCircle: "Cycle Awareness" // Mocked for now until Wellness Circle logic implemented
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, { status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteSpecialist = async (id) => {
    if (window.confirm("Are you sure you want to remove this specialist?")) {
      try {
        await deleteDoc(doc(db, 'specialists', id));
      } catch (error) {
        console.error("Error deleting specialist:", error);
      }
    }
  };

  const handleDeleteNomination = async (id) => {
    if (window.confirm("Are you sure you want to remove this nomination?")) {
      try {
        await deleteDoc(doc(db, 'nominations', id));
      } catch (error) {
        console.error("Error deleting nomination:", error);
      }
    }
  };

  const handleAddSpecialist = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'specialists'), {
        ...newSpecialist,
        createdAt: serverTimestamp()
      });
      setIsAddModalOpen(false);
      setNewSpecialist({ 
        name: '', 
        specialty: '',
        location: 'Lagos',
        category: 'Gynaecology'
      });
    } catch (error) {
      console.error("Error adding specialist:", error);
    }
  };

  const formatFirestoreDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'directory', label: 'Directory', icon: UserPlus },
    { id: 'nominations', label: 'Nominations', icon: Heart }
  ];

  return (
    <div className="flex h-screen bg-[#FAF9F6] font-[Jost,sans-serif] text-[#2D1B2E]">
      <div className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6 border-b border-black/5 flex items-center gap-2">
          <h1 className="text-xl font-bold">Her<span className="italic font-[Fraunces,serif] font-normal">Health</span> Admin</h1>
        </div>
        <nav className="flex-1 py-6">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#FDE8EE] text-[#D4688A] font-medium border-r-4 border-[#D4688A]'
                    : 'text-[#2D1B2E]/60 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8">
          <h2 className="text-lg font-medium capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <button className="text-[#2D1B2E]/40 hover:text-[#2D1B2E] transition-colors p-2 hover:bg-gray-50 rounded-full">
              <Search size={20} />
            </button>
            <div className="relative">
              <button className="text-[#2D1B2E]/60 hover:text-[#2D1B2E] transition-colors p-2 rounded-full hover:bg-gray-50">
                <Bell size={20} />
              </button>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                  <p className="text-sm text-[#2D1B2E]/60 mb-2 font-medium">Total Users</p>
                  <p className="text-3xl font-semibold">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                  <p className="text-sm text-[#2D1B2E]/60 mb-2 font-medium">Bookings This Week</p>
                  <p className="text-3xl font-semibold">{stats.bookingsThisWeek}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                  <p className="text-sm text-[#2D1B2E]/60 mb-2 font-medium">New Nominations</p>
                  <p className="text-3xl font-semibold">{stats.totalNominations}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex flex-col gap-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-black/5">
                      <div className="w-8 h-8 rounded-full bg-[#FDE8EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell size={14} className="text-[#D4688A]" />
                      </div>
                      <div>
                        <p className="text-[#2D1B2E] text-sm leading-relaxed">
                          <span className="font-medium">New Booking request</span> from {booking.fullName || booking.name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-[#2D1B2E]/50 mt-1 font-medium">{formatFirestoreDate(booking.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-center py-8 text-[#2D1B2E]/40 text-sm">No recent activity found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Name</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Email</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-black/5 text-sm font-medium">{user.name || user.fullName}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{user.email}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{formatFirestoreDate(user.createdAt)}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-[#2D1B2E]/40 text-sm">No registered users yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Patient Name</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Package</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Pref. Time</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Booked On</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Status</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-black/5 text-sm font-medium">{booking.fullName || booking.name}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{booking.package}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70 whitespace-nowrap">{booking.preferredTime || booking.time}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{formatFirestoreDate(booking.createdAt)}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-black/5">
                          <select 
                            className="bg-transparent border border-black/10 rounded-lg text-sm px-2 py-1.5 outline-none focus:border-[#D4688A] hover:border-black/20 transition-colors cursor-pointer"
                            value={booking.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-[#2D1B2E]/40 text-sm">No bookings found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium">Specialists</h3>
                  <p className="text-sm text-[#2D1B2E]/60 mt-1">Manage the vetted specialist directory</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#D4688A] hover:bg-[#c55a7a] text-white px-4 py-2.5 rounded-lg flex gap-2 items-center text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add Specialist
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialists.map((specialist) => (
                  <div key={specialist.id} className="bg-white p-5 rounded-xl border border-black/5 shadow-sm flex items-center justify-between group hover:border-[#D4688A]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-black/5 flex items-center justify-center text-[#D4688A] font-medium text-lg uppercase">
                        {specialist.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[15px]">{specialist.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm text-[#2D1B2E]/60">{specialist.specialty}</p>
                          <span className="w-1 h-1 rounded-full bg-black/10"></span>
                          <p className="text-xs font-semibold text-[#D4688A] uppercase tracking-wide">{specialist.category}</p>
                          <span className="w-1 h-1 rounded-full bg-black/10"></span>
                          <p className="text-xs text-[#2D1B2E]/40 font-medium">{specialist.location}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteSpecialist(specialist.id)}
                      className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {specialists.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-black/10">
                    <p className="text-[#2D1B2E]/40 text-sm">No specialists in the directory.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'nominations' && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Doctor Name</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Clinic/Hospital</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Submitted</th>
                      <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nominations.map((nom) => (
                      <tr key={nom.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-black/5 text-sm font-medium">{nom.doctorName}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{nom.clinicName}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{formatFirestoreDate(nom.createdAt)}</td>
                        <td className="px-6 py-4 border-b border-black/5 text-right">
                          <button 
                            onClick={() => handleDeleteNomination(nom.id)}
                            className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {nominations.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-[#2D1B2E]/40 text-sm">No nominations to review.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Specialist Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Add New Specialist</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#2D1B2E]/40 hover:text-[#2D1B2E] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSpecialist} className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#2D1B2E]/60 mb-2 block">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Sarah Chen"
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#D4688A] transition-all"
                  value={newSpecialist.name}
                  onChange={(e) => setNewSpecialist({...newSpecialist, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#2D1B2E]/60 mb-2 block">Specialty</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Reproductive Health"
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#D4688A] transition-all"
                  value={newSpecialist.specialty}
                  onChange={(e) => setNewSpecialist({...newSpecialist, specialty: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2D1B2E]/60 mb-2 block">Location</label>
                  <select
                    className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#D4688A] transition-all cursor-pointer"
                    value={newSpecialist.location}
                    onChange={(e) => setNewSpecialist({...newSpecialist, location: e.target.value})}
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2D1B2E]/60 mb-2 block">Category</label>
                  <select
                    className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#D4688A] transition-all cursor-pointer"
                    value={newSpecialist.category}
                    onChange={(e) => setNewSpecialist({...newSpecialist, category: e.target.value})}
                  >
                    <option value="Gynaecology">Gynaecology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Pelvic Physio">Pelvic Physio</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Mental Health">Mental Health</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-black/10 rounded-xl font-medium text-[15px] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#D4688A] text-white rounded-xl font-medium text-[15px] hover:bg-[#BE185D] transition-colors shadow-md"
                >
                  Save Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
