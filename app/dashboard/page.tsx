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

interface Wallet {
  balance: number;
  pending_balance: number;
  transactions: Array<{
    type: string;
    amount: number;
    task_id: number | null;
    date: string;
  }>;
}

interface Withdrawal {
  id: number;
  buter_id?: number;
  amount: number;
  bank_name: string;
  bank_account: string;
  status: string;
  requested_at: string;
  buter_snapshot?: {
    full_name: string;
    phone: string;
    email: string;
  } | null;
}

interface Dispute {
  id: number;
  task_id: number;
  reported_by: number;
  reason: string;
  evidence: string | null;
  status: string;
  reporter_snapshot: {
    full_name: string;
    phone: string;
    role: string;
  } | null;
  created_at: string;
}

interface AdminStats {
  total_users: number;
  total_buters: number;
  total_customers: number;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  total_disputes: number;
  open_disputes: number;
  total_wallets: number;
  total_withdrawals: number;
}

interface PendingButer {
  id: number;
  full_name: string;
  buter_detail: {
    vehicle_type: string;
    approval_status: string;
    id_card_photo: string;
    skck_photo: string;
    selfie_photo: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Customer states
  const [customerTasks, setCustomerTasks] = useState<Task[]>([]);

  // Superhero states
  const [buterTasks, setButerTasks] = useState<Task[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isButerRegistered, setIsButerRegistered] = useState(false);
  const [buterApprovalStatus, setButerApprovalStatus] = useState('');
  
  // Withdrawal request form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [bankAccount, setBankAccount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Superhero registration form state
  const [vehicleType, setVehicleType] = useState('Motor');
  const [submittingReg, setSubmittingReg] = useState(false);

  // Admin states
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [pendingButers, setPendingButers] = useState<PendingButer[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [openDisputes, setOpenDisputes] = useState<Dispute[]>([]);
  const [activeTab, setActiveTab] = useState('stats');
  
  // Admin action states
  const [processingActionId, setProcessingActionId] = useState<number | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [disputeResolution, setDisputeResolution] = useState('');

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
      setRole(parsedUser.role);
      fetchDashboardData(parsedUser.role, parsedUser.id);
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardData = async (userRole: string, userId: number) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      if (userRole === 'customer') {
        const res = await fetch(`/api/v1/tasks?customer_id=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setCustomerTasks(result.data.tasks || []);
        }
      } else if (userRole === 'buter') {
        const meRes = await fetch(`/api/v1/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meResult = await meRes.json();
        if (meRes.ok && meResult.success) {
          const detail = meResult.data.buter_detail;
          if (detail) {
            setIsButerRegistered(true);
            setButerApprovalStatus(detail.approval_status);
            
            if (detail.approval_status === 'approved') {
              const tasksRes = await fetch(`/api/v1/tasks?buter_id=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const tasksResult = await tasksRes.json();
              if (tasksRes.ok && tasksResult.success) {
                setButerTasks(tasksResult.data.tasks || []);
              }

              const walletRes = await fetch(`/api/v1/wallets/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const walletResult = await walletRes.json();
              if (walletRes.ok && walletResult.success) {
                setWallet(walletResult.data);
              }

              const withRes = await fetch(`/api/v1/withdrawals`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const withResult = await withRes.json();
              if (withRes.ok && withResult.success) {
                setWithdrawals(withResult.data.withdrawals || []);
              }
            }
          } else {
            setIsButerRegistered(false);
          }
        }
      } else if (userRole === 'admin') {
        const statsRes = await fetch(`/api/v1/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsResult = await statsRes.json();
        if (statsRes.ok && statsResult.success) {
          setAdminStats(statsResult.data);
        }

        const butersRes = await fetch(`/api/v1/buters?limit=50&status=pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const butersResult = await butersRes.json();
        if (butersRes.ok && butersResult.success) {
          const pending = (butersResult.data.buters || []).filter((b: any) => b.buter_detail?.approval_status === 'pending');
          setPendingButers(pending);
        }

        const withdrawalsRes = await fetch(`/api/v1/withdrawals?status=pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const withdrawalsResult = await withdrawalsRes.json();
        if (withdrawalsRes.ok && withdrawalsResult.success) {
          setPendingWithdrawals(withdrawalsResult.data.withdrawals || []);
        }

        const disputesRes = await fetch(`/api/v1/disputes?status=open`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const disputesResult = await disputesRes.json();
        if (disputesRes.ok && disputesResult.success) {
          setOpenDisputes(disputesResult.data.disputes || []);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dasbor.');
    } finally {
      setLoading(false);
    }
  };

  const handleButerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReg(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/buters/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_type: vehicleType,
          id_card_photo: '/uploads/ktp_mock.jpg',
          skck_photo: '/uploads/skck_mock.jpg',
          selfie_photo: '/uploads/selfie_mock.jpg',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mendaftar');
      }

      setSuccess('Pendaftaran berhasil diajukan! Menunggu persetujuan admin.');
      setIsButerRegistered(true);
      setButerApprovalStatus('pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          bank_name: bankName,
          bank_account: bankAccount,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mengajukan penarikan');
      }

      setSuccess('Permintaan penarikan dana berhasil diajukan!');
      setWithdrawAmount('');
      setBankAccount('');
      
      fetchDashboardData(role, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleApproveButer = async (buterId: number, status: 'approved' | 'rejected') => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/buters/${buterId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          notes: status === 'approved' ? 'Dokumen lengkap dan valid' : 'Dokumen tidak sesuai'
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mengubah status persetujuan');
      }

      setSuccess(`Pendaftaran Superhero berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}!`);
      fetchDashboardData(role, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: number, status: 'processed' | 'rejected') => {
    setError('');
    setSuccess('');
    setProcessingActionId(withdrawalId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/withdrawals/${withdrawalId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          notes: actionNotes || (status === 'processed' ? 'Transfer berhasil' : 'Dana ditolak admin')
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal memproses penarikan');
      }

      setSuccess(`Penarikan dana berhasil ${status === 'processed' ? 'diproses' : 'ditolak'}!`);
      setActionNotes('');
      fetchDashboardData(role, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleResolveDispute = async (disputeId: number) => {
    if (!disputeResolution.trim()) return;
    setError('');
    setSuccess('');
    setProcessingActionId(disputeId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/disputes/${disputeId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'resolved',
          resolution: disputeResolution
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal menyelesaikan sengketa');
      }

      setSuccess(`Sengketa berhasil diselesaikan!`);
      setDisputeResolution('');
      fetchDashboardData(role, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setProcessingActionId(null);
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
        <span className="text-xs text-slate-400 font-medium">Memuat Dasbor Anda...</span>
      </div>
    );
  }

  const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <NotionShell breadcrumbs={['Dasbor']}>
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

      {/* Title */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dasbor Utama</h1>
        <p className="text-xs text-slate-400 font-medium">
          Selamat datang kembali, <span className="text-slate-800 font-semibold">{user?.full_name}</span>. Peran Anda: <span className="text-blue-600 font-bold uppercase">{role === 'buter' ? 'Superhero' : role}</span>
        </p>
      </div>

      {/* -------------------- CUSTOMER VIEW -------------------- */}
      {role === 'customer' && (
        <div className="space-y-8">
          {/* Quick Actions List (Notion Database Items) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tindakan Cepat</h3>
            <div className="border border-slate-200 rounded divide-y divide-slate-200">
              <Link href="/tasks/create" className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-normal">＋</span>
                  <span>Buat Permintaan Bantuan Baru</span>
                </div>
                <span className="text-slate-300 font-normal">&rarr;</span>
              </Link>
              <Link href="/tasks" className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-normal">🔍</span>
                  <span>Telusuri Daftar Tugas Aktif</span>
                </div>
                <span className="text-slate-300 font-normal">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Posted Tasks */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Tugas yang Anda Posting</h3>
            {customerTasks.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-200 rounded text-center space-y-2">
                <p className="text-xs text-slate-400 italic">Anda belum memposting tugas apa pun.</p>
                <Link href="/tasks/create" className="text-blue-600 font-bold text-xs hover:underline inline-block">
                  Posting tugas pertama Anda sekarang
                </Link>
              </div>
            ) : (
              <div className="border border-slate-200 rounded divide-y divide-slate-200">
                {customerTasks.map(parseTask).map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition"
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
                      <span className="font-bold text-xs text-slate-700">{priceFormatter.format(task.price)}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        task.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'dispute' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- SUPERHERO (BUTER) VIEW -------------------- */}
      {role === 'buter' && (
        <div className="space-y-8">
          {/* Registration forms */}
          {!isButerRegistered ? (
            <div className="border border-slate-200 rounded p-6 bg-slate-50/30 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar sebagai Superhero</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Kirimkan tipe kendaraan Anda untuk diverifikasi oleh admin agar dapat mulai menerima tawaran tugas bantuan.</p>
              </div>
              <form onSubmit={handleButerRegister} className="space-y-4 max-w-sm">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Tipe Kendaraan / Metode Transportasi</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-800"
                  >
                    <option value="Motor">Sepeda Motor</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Sepeda">Sepeda</option>
                    <option value="Jalan Kaki">Jalan Kaki / Umum</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submittingReg}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs transition"
                >
                  {submittingReg ? 'Mengajukan...' : 'Kirim Pendaftaran Superhero'}
                </button>
              </form>
            </div>
          ) : buterApprovalStatus === 'pending' ? (
            <div className="border border-slate-200 rounded p-8 text-center space-y-3 bg-slate-50/20">
              <h3 className="text-sm font-bold text-slate-700">Pendaftaran Superhero Menunggu Persetujuan</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Dokumen pengajuan Anda sedang ditinjau oleh pihak administrator. Kami akan segera mengirimkan konfirmasi.
              </p>
              <div className="inline-block px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded uppercase tracking-wider">
                Menunggu Verifikasi
              </div>
            </div>
          ) : buterApprovalStatus === 'rejected' ? (
            <div className="border border-red-200 rounded p-8 text-center space-y-2 bg-red-50/5">
              <h3 className="text-sm font-bold text-red-800">Pendaftaran Superhero Ditolak</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Pengajuan pendaftaran driver Anda ditolak oleh administrator. Silakan hubungi admin atau daftarkan ulang berkas Anda.
              </p>
            </div>
          ) : (
            // Superhero Dashboard Approved
            <div className="space-y-8">
              {/* Wallet block */}
              <div className="border border-slate-200 rounded p-6 bg-slate-50/20 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dompet Saldo Superhero</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded text-xs space-y-1">
                    <span className="text-slate-400 block font-medium">Saldo Utama Terpenuhi</span>
                    <strong className="text-xl font-bold text-green-700">{priceFormatter.format(wallet?.balance || 0)}</strong>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded text-xs space-y-1">
                    <span className="text-slate-400 block font-medium">Saldo Peninjauan / Tertunda</span>
                    <strong className="text-xl font-bold text-slate-500">{priceFormatter.format(wallet?.pending_balance || 0)}</strong>
                  </div>
                </div>

                {/* Withdrawal Form */}
                <form onSubmit={handleWithdrawalRequest} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2 border-t border-slate-100">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Jumlah Pencairan (Rp)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      placeholder="Contoh: 25000"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Bank Penerima</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="BCA">BCA</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="BNI">BNI</option>
                      <option value="BRI">BRI</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1 space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Nomor Rekening</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      required
                      placeholder="Rekening Bank"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={withdrawing}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition"
                    >
                      Cairkan Dana
                    </button>
                  </div>
                </form>
              </div>

              {/* Tasks Assigned */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tugas yang Anda Tangani</h3>
                  <Link href="/tasks" className="text-xs text-blue-600 hover:underline font-semibold">Cari Tugas Baru &rarr;</Link>
                </div>
                
                {buterTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada tugas bantuan yang sedang Anda kerjakan.</p>
                ) : (
                  <div className="border border-slate-200 rounded divide-y divide-slate-200">
                    {buterTasks.map(parseTask).map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition"
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
                            {task.status === 'taken' ? 'Diterima' :
                             task.status === 'on_progress' ? 'Pengerjaan' :
                             task.status === 'completed' ? 'Selesai' :
                             task.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Withdrawals List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Riwayat Pencairan Dana</h3>
                {withdrawals.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada riwayat pencairan dana.</p>
                ) : (
                  <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="p-3.5 flex justify-between items-center bg-white hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Pencairan Dana #{w.id}</span>
                          <span className="text-[10px] text-slate-400">{w.bank_name} &middot; Rek: {w.bank_account}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-800">{priceFormatter.format(w.amount)}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            w.status === 'processed' ? 'bg-green-50 text-green-700 border-green-200' :
                            w.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- ADMIN VIEW -------------------- */}
      {role === 'admin' && (
        <div className="space-y-8">
          {/* Admin Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-4 border-b-2 transition uppercase tracking-wider ${
                activeTab === 'stats' ? 'border-slate-800 text-slate-900 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Statistik
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-2 px-4 border-b-2 transition uppercase tracking-wider flex items-center gap-1.5 ${
                activeTab === 'approvals' ? 'border-slate-800 text-slate-900 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Verifikasi Superhero
              {pendingButers.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                  {pendingButers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`py-2 px-4 border-b-2 transition uppercase tracking-wider flex items-center gap-1.5 ${
                activeTab === 'withdrawals' ? 'border-slate-800 text-slate-900 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Pencairan Dana
              {pendingWithdrawals.length > 0 && (
                <span className="bg-yellow-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                  {pendingWithdrawals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`py-2 px-4 border-b-2 transition uppercase tracking-wider flex items-center gap-1.5 ${
                activeTab === 'disputes' ? 'border-slate-800 text-slate-900 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sengketa
              {openDisputes.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                  {openDisputes.length}
                </span>
              )}
            </button>
          </div>

          {/* Admin Stats Content */}
          {activeTab === 'stats' && adminStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Total Pengguna', val: adminStats.total_users },
                { label: 'Total Customer', val: adminStats.total_customers },
                { label: 'Total Superhero', val: adminStats.total_buters },
                { label: 'Total Tugas', val: adminStats.total_tasks },
                { label: 'Tugas Menunggu', val: adminStats.pending_tasks },
                { label: 'Tugas Selesai', val: adminStats.completed_tasks },
                { label: 'Sengketa Aktif', val: adminStats.open_disputes },
                { label: 'Total Penarikan', val: adminStats.total_withdrawals }
              ].map((stat, idx) => (
                <div key={idx} className="border border-slate-200 p-4 rounded bg-white text-center space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{stat.label}</span>
                  <strong className="text-xl font-bold text-slate-800">{stat.val}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Admin Pending approvals */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Persetujuan Superhero Baru</h3>
              {pendingButers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada pendaftaran Superhero baru yang menunggu.</p>
              ) : (
                <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                  {pendingButers.map((b) => (
                    <div key={b.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:bg-slate-50/50">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 block text-sm">{b.full_name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Tipe Kendaraan: {b.buter_detail.vehicle_type}</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleApproveButer(b.id, 'approved')}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleApproveButer(b.id, 'rejected')}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded text-[11px] font-semibold transition text-slate-600"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin withdrawals */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Pencairan Dana Superhero</h3>
              
              <div className="max-w-md space-y-1 text-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Catatan Pencairan</label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Masukkan bukti referensi bank..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              {pendingWithdrawals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada pengajuan pencairan dana yang tertunda.</p>
              ) : (
                <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                  {pendingWithdrawals.map((w) => (
                    <div key={w.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:bg-slate-50/50">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 block">{w.buter_snapshot?.full_name || `Driver ID: ${w.buter_id}`}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{w.bank_name} &middot; No.Rek: {w.bank_account}</span>
                      </div>
                      <div className="flex items-center gap-3.5 self-end sm:self-center">
                        <span className="font-bold text-slate-700">{priceFormatter.format(w.amount)}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcessWithdrawal(w.id, 'processed')}
                            disabled={processingActionId === w.id}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition"
                          >
                            Tandai Sukses
                          </button>
                          <button
                            onClick={() => handleProcessWithdrawal(w.id, 'rejected')}
                            disabled={processingActionId === w.id}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded text-[11px] font-semibold transition text-slate-600"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Disputes */}
          {activeTab === 'disputes' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Resolusi Sengketa</h3>
              {openDisputes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada kasus sengketa aktif.</p>
              ) : (
                <div className="space-y-4">
                  {openDisputes.map((d) => (
                    <div key={d.id} className="border border-slate-200 rounded p-4 text-xs space-y-4 bg-white">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800">Sengketa Kasus #{d.id} (Tugas #{d.task_id})</span>
                        <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                          {d.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-500">
                        <p>Pelapor: <span className="font-bold text-slate-700">{d.reporter_snapshot?.full_name} ({d.reporter_snapshot?.role === 'buter' ? 'Superhero' : d.reporter_snapshot?.role})</span></p>
                        <p>Alasan: <span className="font-medium text-slate-700">{d.reason}</span></p>
                        {d.evidence && <p>Bukti: <a href={d.evidence} className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">Lihat Berkas Bukti</a></p>}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400">Gunakan Dispute Chat Room di menu navigasi.</span>
                        <Link href="/chats" className="text-blue-600 font-bold hover:underline">
                          Tinjau Obrolan Sengketa &rarr;
                        </Link>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleResolveDispute(d.id);
                        }}
                        className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 items-end"
                      >
                        <div className="flex-1 space-y-1 w-full">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Keputusan Resolusi</label>
                          <input
                            type="text"
                            value={disputeResolution}
                            onChange={(e) => setDisputeResolution(e.target.value)}
                            required
                            placeholder="Ketik resolusi sengketa..."
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={processingActionId === d.id || !disputeResolution.trim()}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition w-full sm:w-auto"
                        >
                          Selesaikan Kasus
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </NotionShell>
  );
}
