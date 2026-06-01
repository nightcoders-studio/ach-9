'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotionShell from '@/app/components/NotionShell';

const CATEGORIES = [
  'Delivery / Courier',
  'Health / Emergency',
  'Food / Beverage Delivery',
  'Shopping Assistance',
  'House Cleaning',
  'Appliance & Electronic Repair',
  'Laundry & Ironing',
  'Gardening / Yard Work',
  'Pet Care',
  'Furniture Assembly',
  'IT & Tech Support',
  'Tutoring / Teaching',
  'Photography & Videography',
  'Heavy Lifting & Moving',
  'General Help / Others'
];

const PAYMENT_METHODS = [
  { value: 'gopay', label: 'GoPay' },
  { value: 'qris', label: 'QRIS' },
  { value: 'dana', label: 'DANA' },
  { value: 'bank_transfer', label: 'Transfer Bank' }
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    deadline: '',
    payment_method: 'gopay'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role);
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const priceMin = parseFloat(formData.budgetMin);
      const priceMax = parseFloat(formData.budgetMax);
      if (isNaN(priceMin) || priceMin <= 0) {
        throw new Error('Anggaran minimum harus berupa angka positif');
      }
      if (isNaN(priceMax) || priceMax < priceMin) {
        throw new Error('Anggaran maksimum harus lebih besar atau sama dengan anggaran minimum');
      }

      // Encode extra general task fields inside description JSON
      const encodedDescription = JSON.stringify({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budgetMin: priceMin,
        budgetMax: priceMax,
        location: formData.location,
        deadline: formData.deadline
      });

      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: encodedDescription,
          pickup_location: formData.location || 'Apotek/Toko Terdekat',
          dropoff_location: formData.location || 'Lokasi Customer',
          price: priceMin,
          payment_method: formData.payment_method
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mempublikasikan tugas');
      }

      setSuccess('Tugas berhasil dipublikasikan! Mengalihkan ke rincian tugas...');
      setTimeout(() => {
        router.push(`/tasks/${result.data?.id || result.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (userRole && userRole !== 'customer' && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-200 rounded p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Akses Ditolak</h2>
          <p className="text-xs text-slate-500">
            Hanya Customer yang diperbolehkan mempublikasikan tugas bantuan baru. Peran Anda saat ini adalah <strong className="text-blue-600 uppercase">{userRole}</strong>.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-900 text-white py-2 rounded font-semibold text-xs hover:bg-slate-800 transition"
          >
            Kembali ke Dasbor
          </button>
        </div>
      </div>
    );
  }

  return (
    <NotionShell breadcrumbs={['Buat Tugas Baru']}>
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat Permintaan Bantuan</h1>
        <p className="text-xs text-slate-400 font-medium">
          Tuliskan deskripsi detail pengerjaan bantuan yang Anda butuhkan dari Superhero di sekitar.
        </p>
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

      {/* Notion style editor document form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Title Input (styled like Notion document title) */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Nama Tugas / Bantuan
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Contoh: Tolong Beli Obat Demam di Apotek Terdekat"
            className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Detail Deskripsi Tugas
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Tuliskan petunjuk rinci, misalnya: 'Saya sedang demam tinggi di kos dan tidak bisa keluar. Tolong belikan Paracetamol atau obat penurun panas di apotek terdekat dan antar ke Kos Putri Anggrek nomor 12.'"
            rows={5}
            className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed"
          />
        </div>

        {/* Categorization & Location Properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Kategori Bantuan
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">Pilih kategori bantuan</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Lokasi Penerimaan / Penjemputan
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Contoh: Kos area Tembalang, Semarang"
              className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Budget properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Anggaran Minimum (Rp)
            </label>
            <input
              type="number"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              required
              min="1000"
              placeholder="20000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Anggaran Maksimum (Rp)
            </label>
            <input
              type="number"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              required
              min="1000"
              placeholder="50000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Deadline & Payment properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Batas Waktu Pengerjaan
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Metode Pembayaran
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Mempublikasikan...' : 'Publikasikan Tugas'}
          </button>
        </div>
      </form>
    </NotionShell>
  );
}
