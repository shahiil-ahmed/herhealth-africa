import React, { useState } from 'react';
import { LayoutDashboard, Users, CalendarCheck, UserPlus, Bell, Search, Trash2, Plus } from 'lucide-react';

const stats = { totalUsers: 124, bookingsThisWeek: 18, activeCircle: "Cycle Awareness" };

const users = [
  { id: 1, name: "Amara Okafor", email: "amara@example.com", joined: "2026-03-25" },
  { id: 2, name: "Zainab Ali", email: "zainab@example.com", joined: "2026-03-28" }
];

const bookings = [
  { id: 1, name: "Amara Okafor", package: "Navigation Session", time: "Apr 4, 10:00 AM", status: "pending" },
  { id: 2, name: "Chioma Eze", package: "Vetted Specialist", time: "Apr 2, 2:00 PM", status: "confirmed" }
];

const specialists = [
  { id: 1, name: "Dr. Kemi Adeyemi", specialty: "Mental Health" },
  { id: 2, name: "Funke Adeleke", specialty: "Pelvic Physio" }
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'directory', label: 'Directory', icon: UserPlus }
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
                  <p className="text-sm text-[#2D1B2E]/60 mb-2 font-medium">Most Active Circle</p>
                  <p className="text-xl font-semibold mt-1">{stats.activeCircle}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex flex-col gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-black/5">
                    <div className="w-8 h-8 rounded-full bg-[#FDE8EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell size={14} className="text-[#D4688A]" />
                    </div>
                    <div>
                      <p className="text-[#2D1B2E] text-sm leading-relaxed">
                        <span className="font-medium">New Booking request</span> from Zainab Ali
                      </p>
                      <p className="text-xs text-[#2D1B2E]/50 mt-1 font-medium">10 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden animate-in fade-in duration-300">
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
                      <td className="px-6 py-4 border-b border-black/5 text-sm font-medium">{user.name}</td>
                      <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{user.email}</td>
                      <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{user.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden animate-in fade-in duration-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Patient Name</th>
                    <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Package</th>
                    <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Time</th>
                    <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Status</th>
                    <th className="text-xs font-semibold uppercase text-[#2D1B2E]/50 border-b border-black/5 px-6 py-4 bg-gray-50/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 border-b border-black/5 text-sm font-medium">{booking.name}</td>
                      <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{booking.package}</td>
                      <td className="px-6 py-4 border-b border-black/5 text-sm text-[#2D1B2E]/70">{booking.time}</td>
                      <td className="px-6 py-4 border-b border-black/5 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-black/5">
                        <select 
                          className="bg-transparent border border-black/10 rounded-lg text-sm px-2 py-1.5 outline-none focus:border-[#D4688A] hover:border-black/20 transition-colors cursor-pointer"
                          defaultValue={booking.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium">Specialists</h3>
                  <p className="text-sm text-[#2D1B2E]/60 mt-1">Manage the vetted specialist directory</p>
                </div>
                <button className="bg-[#D4688A] hover:bg-[#c55a7a] text-white px-4 py-2.5 rounded-lg flex gap-2 items-center text-sm font-medium transition-colors shadow-sm">
                  <Plus size={16} />
                  Add Specialist
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialists.map((specialist) => (
                  <div key={specialist.id} className="bg-white p-5 rounded-xl border border-black/5 shadow-sm flex items-center justify-between group hover:border-[#D4688A]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-black/5 flex items-center justify-center text-[#D4688A] font-medium text-lg">
                        {specialist.name.split(' ').map(n => n[0]).join('').replace('.','').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[15px]">{specialist.name}</p>
                        <p className="text-sm text-[#2D1B2E]/60 mt-0.5">{specialist.specialty}</p>
                      </div>
                    </div>
                    <button className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
