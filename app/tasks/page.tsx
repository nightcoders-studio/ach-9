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

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserRole(parsed.role);
      } catch (e) {
        console.error(e);
      }
    }
    fetchTasks();
  }, [minPrice, maxPrice]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const response = await fetch(`/api/v1/tasks/waiting?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal memuat daftar tugas.');
      }

      setTasks(result.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat tugas.');
    } finally {
      setLoading(false);
    }
  };

  const parseTaskData = (task: Task) => {
    let title = 'Tugas Pengerjaan';
    let description = task.description;
    let category = 'Delivery / Courier';
    let budgetMin = task.price;
    let budgetMax = task.price;
    let location = task.pickup_location;

    try {
      if (task.description && task.description.trim().startsWith('{')) {
        const parsed = JSON.parse(task.description);
        title = parsed.title || title;
        description = parsed.description || description;
        category = parsed.category || category;
        budgetMin = parsed.budgetMin !== undefined ? parseFloat(parsed.budgetMin) : budgetMin;
        budgetMax = parsed.budgetMax !== undefined ? parseFloat(parsed.budgetMax) : budgetMax;
        location = parsed.location || location;
      }
    } catch (e) {
      // Fallback
    }

    // Dynamic but deterministic bids simulator based on taskId
    const mockBidsCount = (task.id % 3) + 1;

    return {
      ...task,
      title,
      description,
      category,
      budgetMin,
      budgetMax,
      location,
      bidsCount: mockBidsCount
    };
  };

  const parsedTasks = tasks.map(parseTaskData);

  const filteredTasks = selectedCategory
    ? parsedTasks.filter(t => t.category === selectedCategory)
    : parsedTasks;

  const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <NotionShell breadcrumbs={['Daftar Tugas']}>
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Temukan Tugas</h1>
        <p className="text-xs text-slate-400 font-medium">
          Daftar permintaan bantuan terbuka dari komunitas di sekitar Anda.
        </p>
      </div>

      {/* Notion Database Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 py-2 border-b border-slate-100 items-start sm:items-center justify-between text-xs">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded hover:bg-slate-100 transition duration-150 cursor-pointer">
            <span className="text-slate-400 font-medium">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer text-xs"
            >
              <option value="">Semua</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Filters */}
          <div className="flex items-center bg-slate-50 border border-slate-200 px-2 py-1 rounded">
            <span className="text-slate-400 font-medium mr-1.5">Tarif: Rp</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-14 bg-transparent font-semibold text-slate-700 outline-none text-xs text-center border-b border-transparent focus:border-slate-400"
            />
            <span className="text-slate-300 mx-1">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-14 bg-transparent font-semibold text-slate-700 outline-none text-xs text-center border-b border-transparent focus:border-slate-400"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory || minPrice || maxPrice) && (
          <button
            onClick={() => {
              setSelectedCategory('');
              setMinPrice('');
              setMaxPrice('');
            }}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline py-1"
          >
            Bersihkan Filter
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            <span className="text-[11px] text-slate-400 font-medium">Memuat tugas terbuka...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 text-center space-y-2 border border-dashed border-slate-200 rounded-md">
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada tugas</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              Tidak ada tugas aktif yang cocok dengan kriteria filter Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="group block py-4.5 hover:bg-slate-50 transition duration-150 px-2 -mx-2 rounded-md"
              >
                <div className="space-y-1.5">
                  {/* Title & Status */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                      {task.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {task.status}
                    </span>
                  </div>

                  {/* Body Snippet */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Meta Inline (Notion Database Properties style) */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-[11px] text-slate-400 font-medium">
                    {/* Category */}
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                      {task.category}
                    </span>
                    
                    <span className="text-slate-300">•</span>
                    
                    {/* Price Range */}
                    <span className="text-slate-700 font-bold">
                      {task.budgetMin === task.budgetMax
                        ? priceFormatter.format(task.budgetMin)
                        : `${priceFormatter.format(task.budgetMin)} - ${priceFormatter.format(task.budgetMax)}`
                      }
                    </span>
                    
                    <span className="text-slate-300">•</span>
                    
                    {/* Location */}
                    <span className="truncate max-w-[150px]">{task.location}</span>
                    
                    <span className="text-slate-300">•</span>
                    
                    {/* Bids */}
                    <span>{task.bidsCount} Superhero Menawarkan</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </NotionShell>
  );
}
