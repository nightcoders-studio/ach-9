'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotionShell from '@/app/components/NotionShell';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        full_name: parsedUser.full_name || '',
        phone: parsedUser.phone || '',
      });
    } catch (e) {
      console.error(e);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal menyimpan perubahan');
      }

      const updatedUser = { ...user, ...result.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Pengaturan profil berhasil disimpan!');

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-2">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <NotionShell breadcrumbs={['Pengaturan Profil']}>
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Akun</h1>
        <p className="text-xs text-slate-400 font-medium">
          Kelola nama tampilan dan informasi kontak Anda.
        </p>
      </div>

      {/* Editor Form fields */}
      <div className="space-y-5 text-xs max-w-md">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-100 text-slate-400 cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-400 mt-0.5">Email akun tidak dapat diubah.</p>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Contoh: 081234567890"
            className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded text-xs font-semibold ${
              message.includes('berhasil')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </NotionShell>
  );
}
