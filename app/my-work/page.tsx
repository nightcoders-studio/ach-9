'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotionShell from '@/app/components/NotionShell';

interface Task {
  id: number;
  description: string;
  pickup_location: string;
  dropoff_location: string;
  price: number;
  status: string;
  created_at: string;
}

export default function MyWorkPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
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
      const parsedUser = JSON.parse(userData);
      fetchAssignedTasks(parsedUser.id);
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  }, [router]);

  const fetchAssignedTasks = async (userId: number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Fetch all tasks where this user is the buter (assigned helper)
      const response = await fetch(`/api/v1/tasks?buter_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch tasks');
      }

      setTasks(result.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat tugas.');
    } finally {
      setLoading(false);
    }
  };

  const parseTask = (task: Task) => {
    let title = 'Tugas Pengerjaan';
    let description = task.description;
    let category = 'Delivery';
    let budgetMin = task.price;
    let budgetMax = task.price;

    try {
      if (task.description && task.description.trim().startsWith('{')) {
        const parsed = JSON.parse(task.description);
        title = parsed.title || title;
        description = parsed.description || description;
        category = parsed.category || category;
        budgetMin = parsed.budgetMin !== undefined ? parseFloat(parsed.budgetMin) : budgetMin;
        budgetMax = parsed.budgetMax !== undefined ? parseFloat(parsed.budgetMax) : budgetMax;
      }
    } catch (e) {
      // Fallback
    }

    return {
      ...task,
      title,
      description,
      category,
      budgetMin,
      budgetMax
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-2">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat pengerjaan tugas...</span>
      </div>
    );
  }

  const parsedTasks = tasks.map(parseTask);
  const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <NotionShell breadcrumbs={['Tugas Superhero Saya']}>
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tugas yang Saya Tangani</h1>
        <p className="text-xs text-slate-400 font-medium">
          Daftar semua tugas bantuan aktif yang ditugaskan kepada Anda sebagai Superhero.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs font-semibold">
          {error}
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {parsedTasks.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded p-10 text-center space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Belum ada tugas</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Anda belum ditunjuk untuk mengerjakan tugas apa pun. Periksa katalog tugas terbuka untuk memberikan penawaran.
            </p>
            <Link
              href="/tasks"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-semibold transition"
            >
              Cari Tugas Terbuka
            </Link>
          </div>
        ) : (
          <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
            {parsedTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:bg-slate-50 transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{task.title}</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="font-bold text-xs text-green-700">{priceFormatter.format(task.price)}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    task.status === 'taken' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'on_progress' ? 'bg-purple-100 text-purple-800' :
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </NotionShell>
  );
}
