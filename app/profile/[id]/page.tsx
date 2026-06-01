'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse JSON task description to get the title
  const parseTaskTitle = (description: string) => {
    try {
      if (description && description.trim().startsWith('{')) {
        const parsed = JSON.parse(description);
        return parsed.title || 'Delivery Task';
      }
    } catch (e) {
      // Fallback
    }
    return description;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full border border-gray-100 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">{error || 'User not found'}</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1.5 transition"
          >
            ← Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-800">User Profile</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-blue-600">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900">{user.full_name}</h2>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                  user.role === 'buter' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {user.role}
                </span>
                {user.is_verified && (
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-yellow-500 font-bold text-lg mt-1 flex items-center gap-1">
                ★ {user.stats?.avg_rating || '0.0'} <span className="text-gray-400 text-sm font-normal">({user.reviews.length} reviews)</span>
              </p>
              {user.role === 'buter' && user.buter_detail && (
                <p className="text-xs text-gray-400 mt-1">Vehicle: {user.buter_detail.vehicle_type}</p>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <Link
              href="/settings"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold text-xs transition shadow-lg shadow-blue-500/10"
            >
              Edit Profile Settings
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        {user.stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                {user.role === 'buter' ? 'Completed Deliveries' : 'Total Posted Tasks'}
              </span>
              <strong className="text-2xl font-black text-gray-800">{user.stats.total_tasks}</strong>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Average Rating</span>
              <strong className="text-2xl font-black text-yellow-500">★ {user.stats.avg_rating || '0.0'}</strong>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Reviews & Feedback</h3>
          {user.reviews.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-6">No reviews received yet.</p>
          ) : (
            <div className="space-y-6 divide-y divide-gray-100">
              {user.reviews.map((review, idx) => (
                <div key={review.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-gray-800 text-sm">
                        {review.reviewer_name || 'Customer'}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Task: <span className="font-semibold text-gray-500">{parseTaskTitle(review.task_title)}</span>
                      </p>
                    </div>
                    <div className="text-yellow-500 font-bold text-sm">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic bg-gray-50 p-3 rounded-xl">
                    "{review.comment || 'No comment left.'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
