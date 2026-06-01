'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotionShell from '@/app/components/NotionShell';

interface UserProfile {
  id: number;
  full_name: string;
  role: string;
  is_verified: boolean;
  buter_detail: {
    vehicle_type: string;
    approval_status: string;
    total_earnings: number;
    total_tasks_completed: number;
  } | null;
  stats: {
    total_tasks: number;
    avg_rating: number;
  } | null;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    task_title: string;
    reviewer_name?: string;
  }>;
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const profileIdString = unwrappedParams.id;
  const profileId = parseInt(profileIdString);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setCurrentUser(JSON.parse(userData));
    } catch (e) {
      console.error(e);
    }

    fetchProfile();
  }, [profileIdString]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'User not found');
      }
      setUser(result.data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const parseTaskTitle = (description: string) => {
    try {
      if (description && description.trim().startsWith('{')) {
        const parsed = JSON.parse(description);
        return parsed.title || 'Tugas Pengerjaan';
      }
    } catch (e) {
      // Fallback
    }
    return description;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-2">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat profil...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-200 rounded p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">{error || 'Profil Tidak Ditemukan'}</h2>
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

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <NotionShell breadcrumbs={['Profil', user.full_name]}>
      {/* Title & Metadata */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{user.full_name}</h1>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              user.role === 'buter' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {user.role === 'buter' ? 'Superhero' : 'Customer'}
            </span>
            {user.is_verified && (
              <span className="bg-green-50 border border-green-200 text-green-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                Terverifikasi
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-amber-500">★ {user.stats?.avg_rating || '0.0'}</span>
            <span>&middot;</span>
            <span>{user.reviews.length} Ulasan Masuk</span>
            {user.role === 'buter' && user.buter_detail && (
              <>
                <span>&middot;</span>
                <span>Kendaraan: {user.buter_detail.vehicle_type}</span>
              </>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <Link
            href="/settings"
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold transition"
          >
            Edit Pengaturan
          </Link>
        )}
      </div>

      {/* Notion-style properties stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-slate-200 p-4 rounded text-xs space-y-1">
          <span className="text-slate-400 block font-medium">
            {user.role === 'buter' ? 'Penyelesaian Bantuan' : 'Total Tugas Diposting'}
          </span>
          <strong className="text-xl font-bold text-slate-800">{user.stats?.total_tasks || 0}</strong>
        </div>
        <div className="border border-slate-200 p-4 rounded text-xs space-y-1">
          <span className="text-slate-400 block font-medium">Rata-rata Rating</span>
          <strong className="text-xl font-bold text-amber-500">★ {user.stats?.avg_rating || '0.0'}</strong>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Ulasan & Feedback</h3>
        {user.reviews.length === 0 ? (
          <p className="text-slate-400 text-xs italic">Belum ada ulasan yang diterima.</p>
        ) : (
          <div className="border border-slate-200 rounded divide-y divide-slate-200 overflow-hidden bg-white text-xs">
            {user.reviews.map((review) => (
              <div key={review.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">{review.reviewer_name || 'Customer'}</span>
                    <span className="text-[10px] text-slate-400 block">Tugas: {parseTaskTitle(review.task_title)}</span>
                  </div>
                  <div className="text-amber-500 font-bold">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded">
                  "{review.comment || 'Tidak ada komentar tertulis.'}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </NotionShell>
  );
}
