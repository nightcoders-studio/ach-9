'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotionShell from '@/app/components/NotionShell';

interface TaskDetail {
  id: number;
  customer_id: number;
  buter_id: number | null;
  description: string;
  pickup_location: string;
  dropoff_location: string;
  price: string;
  status: string;
  customer_snapshot: { full_name: string; phone: string; email: string } | null;
  buter_snapshot: { full_name: string; phone: string; vehicle_type: string } | null;
  timeline: {
    created_at: string;
    taken_at: string | null;
    started_at: string | null;
    completed_at: string | null;
  };
  payment: {
    method: string;
    status: string;
    amount: number;
    transaction_id: string | null;
    paid_at: string | null;
  };
  review: {
    rating: number;
    comment: string | null;
    created_at: string;
  } | null;
  tracking_history: Array<{
    lat: number;
    lng: number;
    time: string;
    status: string;
  }>;
}

interface DisputeDetail {
  id: number;
  task_id: number;
  reported_by: number;
  reason: string;
  evidence: string | null;
  status: string;
  resolution: string | null;
  chat_history: Array<{
    sender: string;
    message: string;
    time: string;
  }>;
}

interface Bid {
  buter_id: number;
  name: string;
  rating: number;
  completedTasks: number;
  amount: number;
  message: string;
  eta: string;
  isMock?: boolean;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const taskIdString = unwrappedParams.id;
  const taskId = parseInt(taskIdString);

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bidding states
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidEta, setBidEta] = useState('20 menit');
  const [assignedHelperName, setAssignedHelperName] = useState('');

  // Forms states
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Tracking states
  const [trackingStatus, setTrackingStatus] = useState('Menuju lokasi');
  const [trackingLat, setTrackingLat] = useState('-6.1754');
  const [trackingLng, setTrackingLng] = useState('106.8456');

  // Dispute states
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeChatMessage, setDisputeChatMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);
      setUserRole(parsedUser.role);
    } catch (e) {
      console.error(e);
    }

    fetchTaskDetails();
    fetchDisputes();
  }, [taskIdString, router]);

  // Load custom assignments and bids from localStorage
  useEffect(() => {
    if (!task) return;

    // Load user submitted driver bids from localStorage
    let localBids: Bid[] = [];
    try {
      const saved = localStorage.getItem(`mitabut_bids_${task.id}`);
      if (saved) {
        localBids = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    // Set bids
    setBids(localBids);

    // Check custom assigned helper name
    const customAssigned = localStorage.getItem(`mitabut_assigned_${task.id}`);
    if (customAssigned) {
      setAssignedHelperName(customAssigned);
    }
  }, [task]);

  const fetchTaskDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal memuat detail tugas');
      }
      setTask(result.data);
      setBidAmount(result.data.price);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/disputes?task_id=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success && result.data && result.data.length > 0) {
        const detailRes = await fetch(`/api/v1/disputes/${result.data[0].id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const detailResult = await detailRes.json();
        if (detailRes.ok && detailResult.success) {
          setDispute(detailResult.data);
        }
      } else {
        setDispute(null);
      }
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    }
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !task) return;

    const bidPrice = parseFloat(bidAmount);
    if (isNaN(bidPrice) || bidPrice <= 0) {
      setError('Masukkan jumlah penawaran yang valid');
      return;
    }

    const newBid: Bid = {
      buter_id: currentUser.id,
      name: currentUser.full_name,
      rating: 5.0, // Default rating for new user
      completedTasks: 0,
      amount: bidPrice,
      message: bidMessage || 'Saya siap membantu pengerjaan tugas Anda.',
      eta: bidEta,
      isMock: false
    };

    try {
      const saved = localStorage.getItem(`mitabut_bids_${task.id}`);
      const list = saved ? JSON.parse(saved) : [];
      list.push(newBid);
      localStorage.setItem(`mitabut_bids_${task.id}`, JSON.stringify(list));
      
      // Update state
      setBids((prev) => [...prev, newBid]);
      setSuccess('Penawaran Anda berhasil dikirim!');
      setBidMessage('');
    } catch (e) {
      console.error(e);
      setError('Gagal mengirim penawaran');
    }
  };

  const handleAcceptOffer = async (bid: Bid) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      
      // We will call the accept API.
      // If it's a mock helper (e.g. ID > 100), we pass Diana's ID (2) to register a valid database assignment,
      // but we store the mock name in localStorage to render Budi/Adi in the UI.
      const realButerId = bid.isMock ? 2 : bid.buter_id;
      
      const response = await fetch(`/api/v1/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ buter_id: realButerId })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal menerima penawaran');
      }

      // Persist chosen helper display name in localStorage
      localStorage.setItem(`mitabut_assigned_${taskId}`, bid.name);
      setAssignedHelperName(bid.name);
      
      setSuccess(`Penawaran dari ${bid.name} berhasil diterima!`);
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTask = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/tasks/${taskId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal memulai pengerjaan');
      }
      setSuccess('Pengerjaan tugas telah dimulai!');
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mengonfirmasi penyelesaian');
      }
      setSuccess('Tugas berhasil diselesaikan!');
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/tasks/${taskId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal membatalkan tugas');
      }
      setSuccess('Tugas berhasil dibatalkan.');
      setShowCancelModal(false);
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/tasks/${taskId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment: reviewComment })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mengirim ulasan');
      }
      setSuccess('Ulasan berhasil dikirim!');
      setReviewComment('');
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/tasks/${taskId}/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lat: parseFloat(trackingLat),
          lng: parseFloat(trackingLng),
          status: trackingStatus
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal memposting koordinat');
      }
      setSuccess('Lokasi berhasil diperbarui!');
      fetchTaskDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: taskId,
          reason: disputeReason,
          evidence: disputeEvidence || null
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal melaporkan komplain');
      }
      setSuccess('Komplain berhasil dilaporkan!');
      setShowDisputeForm(false);
      setDisputeReason('');
      setDisputeEvidence('');
      fetchTaskDetails();
      fetchDisputes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendDisputeChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute || !disputeChatMessage.trim()) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/disputes/${dispute.id}/chat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: disputeChatMessage })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mengirim pesan');
      }
      setDisputeChatMessage('');
      fetchDisputes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-2">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat rincian tugas...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-200 rounded-lg p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Tugas Tidak Ditemukan</h2>
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

  // Parse JSON description if it is encoded
  let taskTitle = 'Tugas Pengerjaan';
  let taskDescription = task.description;
  let taskCategory = 'Delivery / Courier';
  let budgetMin = parseFloat(task.price);
  let budgetMax = parseFloat(task.price);
  let taskLocation = task.pickup_location;
  let deadline = '';

  try {
    if (task.description && task.description.trim().startsWith('{')) {
      const parsed = JSON.parse(task.description);
      taskTitle = parsed.title || taskTitle;
      taskDescription = parsed.description || taskDescription;
      taskCategory = parsed.category || taskCategory;
      budgetMin = parsed.budgetMin !== undefined ? parseFloat(parsed.budgetMin) : budgetMin;
      budgetMax = parsed.budgetMax !== undefined ? parseFloat(parsed.budgetMax) : budgetMax;
      taskLocation = parsed.location || taskLocation;
      deadline = parsed.deadline || deadline;
    }
  } catch (e) {
    // Normal format
  }

  const isCustomer = userRole === 'customer';
  const isButer = userRole === 'buter'; // Superhero
  const isTaskCreator = currentUser?.id === task.customer_id;
  const isAssignedButer = currentUser?.id === task.buter_id;
  const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <NotionShell breadcrumbs={['Daftar Tugas', taskTitle]}>
      {/* Messages */}
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

      {/* Notion Document Header */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
          {taskTitle}
        </h1>

        {/* Notion Style Properties Grid */}
        <div className="border-y border-slate-100 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          <div className="flex items-center">
            <span className="w-28 text-slate-400 font-medium">Kategori</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
              {taskCategory}
            </span>
          </div>

          <div className="flex items-center">
            <span className="w-28 text-slate-400 font-medium">Status</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              task.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
              task.status === 'taken' ? 'bg-blue-100 text-blue-800' :
              task.status === 'on_progress' ? 'bg-purple-100 text-purple-800' :
              task.status === 'completed' ? 'bg-green-100 text-green-800' :
              task.status === 'dispute' ? 'bg-red-100 text-red-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {task.status === 'waiting' ? 'Terbuka / Menunggu Penawaran' :
               task.status === 'taken' ? 'Tugas Diambil' :
               task.status === 'on_progress' ? 'Dalam Pengerjaan' :
               task.status === 'completed' ? 'Selesai' :
               task.status === 'dispute' ? 'Komplain Aktif' :
               task.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center">
            <span className="w-28 text-slate-400 font-medium">Anggaran Upah</span>
            <span className="font-bold text-slate-800">
              {budgetMin === budgetMax
                ? priceFormatter.format(budgetMin)
                : `${priceFormatter.format(budgetMin)} - ${priceFormatter.format(budgetMax)}`
              }
            </span>
          </div>

          <div className="flex items-center">
            <span className="w-28 text-slate-400 font-medium">Metode Bayar</span>
            <span className="font-semibold text-slate-700 uppercase">
              {task.payment.method} ({task.payment.status})
            </span>
          </div>

          <div className="flex items-center">
            <span className="w-28 text-slate-400 font-medium">Lokasi</span>
            <span className="font-semibold text-slate-700">{taskLocation}</span>
          </div>

          <div className="flex items-center">
            <span className="w-28 text-slate-400 font-medium">Pembuat Tugas</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span>{task.customer_snapshot?.full_name || 'Customer'}</span>
              {task.status !== 'waiting' && (task.customer_snapshot?.phone || '081311111111') && (
                <span className="text-[11px] text-slate-400 font-normal">
                  (📞 {task.customer_snapshot?.phone || '081311111111'})
                </span>
              )}
            </div>
          </div>

          {deadline && (
            <div className="flex items-center">
              <span className="w-28 text-slate-400 font-medium">Batas Waktu</span>
              <span className="font-semibold text-slate-700">
                {new Date(deadline).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {/* Assigned Superhero */}
          {(task.status !== 'waiting' || assignedHelperName) && (
            <div className="flex items-center sm:col-span-2 border-t border-slate-100 pt-3 mt-1">
              <span className="w-28 text-slate-400 font-medium">Superhero Ditunjuk</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(assignedHelperName || task.buter_snapshot?.full_name || 'S').charAt(0)}
                </div>
                <span className="font-bold text-slate-800 text-[13px]">
                  {assignedHelperName || task.buter_snapshot?.full_name || 'Diana Putri'}
                </span>
                <span className="text-[11px] text-slate-400">
                  (📞 {
                    assignedHelperName === 'Budi Santoso' ? '081299998888' :
                    assignedHelperName === 'Adi Wijaya' ? '087766665555' :
                    assignedHelperName === 'Diana Putri' ? '081322222222' :
                    (task.buter_snapshot?.phone || '081322222222')
                  })
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notion Document Body */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Detail Deskripsi</h2>
        <div className="bg-[#f9fafb] p-4.5 rounded border border-slate-200 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
          {taskDescription}
        </div>
      </div>

      {/* Main Action Bar for Workflow Transitions */}
      {task.status !== 'cancelled' && task.status !== 'completed' && (
        <div className="border border-slate-200 rounded p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
          <div className="text-xs text-slate-500 font-medium">
            {task.status === 'waiting' && 'Tugas ini sedang menunggu penawaran dari Superhero terdekat.'}
            {task.status === 'taken' && 'Superhero telah dipilih. Awaiting pengerjaan dimulai.'}
            {task.status === 'on_progress' && 'Superhero sedang mengerjakan tugas bantuan Anda.'}
            {task.status === 'dispute' && 'Komplain sedang dalam investigasi Admin.'}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Superhero self-assigning if they view without bid */}
            {isButer && task.status === 'waiting' && (
              <button
                onClick={() => handleAcceptOffer({
                  buter_id: currentUser.id,
                  name: currentUser.full_name,
                  rating: 5.0,
                  completedTasks: 0,
                  amount: budgetMin,
                  message: 'Self accept',
                  eta: '20m'
                })}
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
              >
                Ambil Langsung (Rp {priceFormatter.format(budgetMin)})
              </button>
            )}

            {/* Superhero Workflow */}
            {isAssignedButer && task.status === 'taken' && (
              <button
                onClick={handleStartTask}
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
              >
                Mulai Pengerjaan
              </button>
            )}

            {isAssignedButer && task.status === 'on_progress' && (
              <button
                onClick={handleCompleteTask}
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
              >
                Konfirmasi Selesai
              </button>
            )}

            {/* Customer Cancel Button */}
            {(isTaskCreator || userRole === 'admin') && ['waiting', 'taken', 'on_progress'].includes(task.status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded text-xs font-medium transition text-slate-600"
              >
                Batalkan Tugas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bidding System / List Penawaran */}
      {task.status === 'waiting' && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Penawaran Superhero
            </h2>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              {bids.length} Penawaran Masuk
            </span>
          </div>

          {/* Helper Bid Listings (Notion table style) */}
          <div className="border border-slate-200 rounded divide-y divide-slate-200 overflow-hidden">
            {bids.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 italic">Belum ada penawaran masuk.</p>
            ) : (
              bids.map((bid, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-slate-50/50 transition">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{bid.name}</span>
                      <span className="text-[10px] text-amber-500 font-semibold bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded">
                        ★ {bid.rating.toFixed(1)} ({bid.completedTasks} tugas)
                      </span>
                      <span className="text-[10px] text-slate-400">• Estimasi tiba {bid.eta}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{bid.message}"</p>
                  </div>
                  
                  <div className="flex items-center gap-4.5 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Tawaran Upah</span>
                      <span className="text-sm font-extrabold text-blue-600">{priceFormatter.format(bid.amount)}</span>
                    </div>

                    {isTaskCreator && (
                      <button
                        onClick={() => handleAcceptOffer(bid)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition"
                      >
                        Terima Penawaran
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Place Bid Form for Helper/Superhero role */}
          {isButer && !bids.some(b => b.buter_id === currentUser?.id) && (
            <form onSubmit={handlePlaceBid} className="border border-slate-200 rounded p-5 bg-slate-50/40 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Kirim Penawaran Anda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tawaran Tarif Anda (Rp)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimasi Tiba (ETA)</label>
                  <select
                    value={bidEta}
                    onChange={(e) => setBidEta(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                  >
                    <option value="15 menit">15 menit</option>
                    <option value="30 menit">30 menit</option>
                    <option value="45 menit">45 menit</option>
                    <option value="1 jam">1 jam</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pesan Pitching / Alasan Dipilih</label>
                <textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Misalnya: 'Kebetulan saya sedang berada dekat Grand Indonesia dan membawa helm ekstra...'"
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
              >
                Kirim Penawaran
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tracking / Location Logs */}
      {task.status !== 'waiting' && task.status !== 'cancelled' && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Catatan Lokasi & Tracking</h2>
          
          <div className="space-y-4">
            {task.tracking_history.length === 0 ? (
              <p className="text-slate-400 text-xs italic">Belum ada catatan lokasi terkirim.</p>
            ) : (
              <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                {task.tracking_history.map((pt, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-700 block">{pt.status}</span>
                      <span className="text-[10px] text-slate-400">Koordinat: {pt.lat}, {pt.lng}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(pt.time).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Posting tracking logs for Driver */}
            {isAssignedButer && task.status === 'on_progress' && (
              <form onSubmit={handleAddTracking} className="border border-slate-200 rounded p-4 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Status Lokasi</label>
                  <select
                    value={trackingStatus}
                    onChange={(e) => setTrackingStatus(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="Menuju lokasi penjemputan">Menuju lokasi penjemputan</option>
                    <option value="Tiba di lokasi penjemputan">Tiba di lokasi penjemputan</option>
                    <option value="Membeli barang/obat">Membeli barang/obat</option>
                    <option value="Menuju lokasi pengantaran">Menuju lokasi pengantaran</option>
                    <option value="Tiba di tujuan">Tiba di tujuan</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-1 sm:col-span-1">
                  <div>
                    <input
                      type="text"
                      value={trackingLat}
                      onChange={(e) => setTrackingLat(e.target.value)}
                      placeholder="Lat"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-[11px]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={trackingLng}
                      onChange={(e) => setTrackingLng(e.target.value)}
                      placeholder="Lng"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-[11px]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition"
                >
                  Kirim Update Lokasi
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Form / Display */}
      {task.status === 'completed' && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Review & Ulasan</h2>
          {task.review ? (
            <div className="border border-slate-200 rounded p-4 bg-slate-50/40 text-xs">
              <div className="flex items-center gap-1.5 mb-1.5 font-bold text-slate-800">
                <span className="text-amber-500">★</span>
                <span>{task.review.rating}/5</span>
              </div>
              <p className="text-slate-600 italic">"{task.review.comment || 'Tidak ada ulasan tertulis.'}"</p>
            </div>
          ) : isTaskCreator ? (
            <form onSubmit={handleSubmitReview} className="border border-slate-200 rounded p-5 bg-slate-50/30 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Kirim Ulasan Layanan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rating Bintang</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ulasan / Komentar</label>
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda memakai jasa Superhero ini..."
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
              >
                Kirim Ulasan
              </button>
            </form>
          ) : (
            <p className="text-slate-400 text-xs italic">Menunggu ulasan bintang dari Customer.</p>
          )}
        </div>
      )}

      {/* Dispute Section */}
      {dispute ? (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <h2 className="text-base font-bold text-red-800 tracking-tight">Pusat Komplain & Dispute</h2>
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {dispute.status}
            </span>
          </div>

          <div className="border border-red-200 rounded p-4 bg-red-50/20 text-xs space-y-3">
            <div>
              <strong className="text-red-950 font-bold block">Detail Alasan Komplain:</strong>
              <p className="text-slate-600 mt-0.5">{dispute.reason}</p>
            </div>
            
            {dispute.resolution && (
              <div className="border-t border-red-200/50 pt-2 bg-green-50/50 -mx-4 -mb-4 p-4 rounded-b">
                <strong className="text-green-950 font-bold block">Solusi dari Admin:</strong>
                <p className="text-slate-700 mt-0.5">{dispute.resolution}</p>
              </div>
            )}
          </div>

          {/* Dispute Chat Logs (comment layout) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Diskusi Komplain</h3>
            <div className="border border-slate-200 rounded divide-y divide-slate-200 overflow-hidden bg-white">
              {dispute.chat_history.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400 italic">Belum ada diskusi.</p>
              ) : (
                dispute.chat_history.map((msg, idx) => (
                  <div key={idx} className="p-3 text-xs flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 uppercase tracking-wide">
                        {msg.sender === userRole ? 'Anda' : msg.sender === 'buter' ? 'Superhero' : msg.sender}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
              <form onSubmit={handleSendDisputeChat} className="flex gap-2">
                <input
                  type="text"
                  value={disputeChatMessage}
                  onChange={(e) => setDisputeChatMessage(e.target.value)}
                  placeholder="Ketik balasan Anda untuk admin/lawan transaksi..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !disputeChatMessage.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
                >
                  Kirim
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        task.status !== 'waiting' && task.status !== 'cancelled' && (
          <div className="pt-6 border-t border-slate-200 text-right">
            {!showDisputeForm ? (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="text-xs font-semibold text-red-600 hover:underline transition"
              >
                Laporkan Kendala / Komplain Pengerjaan
              </button>
            ) : (
              <form onSubmit={handleCreateDispute} className="border border-slate-200 rounded p-5 bg-red-50/5 text-left space-y-4 mt-2">
                <h3 className="text-xs font-bold text-red-800 uppercase">Buat Laporan Komplain</h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alasan Detail</label>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                    placeholder="Tuliskan kendala secara lengkap..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bukti Foto / URL (Opsional)</label>
                  <input
                    type="text"
                    value={disputeEvidence}
                    onChange={(e) => setDisputeEvidence(e.target.value)}
                    placeholder="https://imgur.com/bukti.jpg"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                  >
                    Kirim Komplain
                  </button>
                </div>
              </form>
            )
          }
          </div>
        )
      )}

      {/* Cancel Task Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Batalkan Tugas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin membatalkan tugas ini? Harap cantumkan alasan pembatalan.
            </p>
            <form onSubmit={handleCancelTask} className="space-y-4">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                placeholder="Alasan pembatalan (misal: Berubah pikiran)"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-100 transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !cancelReason.trim()}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                >
                  Ya, Batalkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </NotionShell>
  );
}
