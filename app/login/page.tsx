'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLoginView) {
        // Login Flow
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || 'Login failed');
        }

        // Store JWT token, userId, and user object
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userId', result.data.user.id.toString());
        localStorage.setItem('user', JSON.stringify(result.data.user));

        setSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Register Flow
        const response = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone,
            password,
            role,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || 'Registration failed');
        }

        setSuccess('Pendaftaran berhasil! Silakan masuk.');
        setIsLoginView(true);
        // Clear registration fields
        setFullName('');
        setPhone('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6 text-xs text-slate-800">
      <div className="bg-white rounded border border-slate-200 p-8 w-full max-w-sm shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            mitabut.
          </h1>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {isLoginView ? 'Masuk ke dalam workspace Anda' : 'Buat akun baru untuk mulai menggunakan platform'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizki"
                  required={!isLoginView}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  required={!isLoginView}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daftar Sebagai</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                >
                  <option value="customer">Customer (Butuh Bantuan / Jasa)</option>
                  <option value="buter">Superhero (Penyedia Jasa Bantuan / Kurir)</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: you@example.com"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-xs font-semibold">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded font-bold transition disabled:opacity-50 mt-2 text-xs"
          >
            {loading ? 'Memproses...' : isLoginView ? 'Masuk' : 'Daftar Akun'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-[11px]">
          {isLoginView ? "Belum memiliki akun? " : "Sudah memiliki akun? "}
          <button
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
              setSuccess('');
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLoginView ? 'Daftar sekarang' : 'Masuk sekarang'}
          </button>
        </p>
      </div>
    </div>
  );
}