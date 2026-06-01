import React from 'react';

interface NavbarProps {
  user?: { id: number; full_name: string; email: string };
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-black text-blue-600 tracking-tight">
          Mitabut
        </a>
        <div className="flex items-center gap-4">
          <a href="/tasks" className="text-gray-600 hover:text-blue-600 font-bold text-sm transition-colors">
            Browse Tasks
          </a>
          <a href="/dashboard" className="text-gray-600 hover:text-blue-600 font-bold text-sm transition-colors">
            Dashboard
          </a>
          {user ? (
            <>
              <a href={`/profile/${user.id}`} className="text-gray-600 hover:text-blue-600 font-bold text-sm transition-colors">
                {user.full_name}
              </a>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 font-bold text-xs border border-red-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition">
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
