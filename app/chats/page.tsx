'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotionShell from '@/app/components/NotionShell';

interface Dispute {
  id: number;
  task_id: number;
  reason: string;
  status: string;
  created_at: string;
  chat_history: Array<{
    sender: string;
    message: string;
    time: string;
  }>;
}

export default function ChatsPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [messageText, setMessageText] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
      setUserRole(parsedUser.role);
      fetchDisputes();
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  }, [router]);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/disputes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal memuat daftar pesan.');
      }

      setDisputes(result.data.disputes || []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat obrolan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeDetails = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/disputes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setSelectedDispute(result.data);
        setTimeout(() => {
          const container = document.getElementById('dispute-messages-container');
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      }
    } catch (err) {
      console.error('Failed to fetch dispute detail:', err);
    }
  };

  const selectDispute = (dispute: Dispute) => {
    fetchDisputeDetails(dispute.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedDispute) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/disputes/${selectedDispute.id}/chat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to send message');
      }

      setMessageText('');
      fetchDisputeDetails(selectedDispute.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-2">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium">Memuat pesan masuk...</span>
      </div>
    );
  }

  return (
    <NotionShell breadcrumbs={['Pusat Pesan']}>
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pusat Pesan & Komplain</h1>
        <p className="text-xs text-slate-400 font-medium">
          Daftar ruang obrolan penanganan kendala transaksi aktif dengan admin.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grid chat interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px] border border-slate-200 rounded overflow-hidden">
        {/* Left side list */}
        <div className="border-r border-slate-200 flex flex-col min-h-0 h-full bg-slate-50/50">
          <div className="p-3 border-b border-slate-200 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Room</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            {disputes.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 italic">Tidak ada room aktif.</p>
            ) : (
              disputes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => selectDispute(d)}
                  className={`w-full p-3.5 text-left hover:bg-slate-50 transition flex flex-col gap-1.5 ${
                    selectedDispute?.id === d.id ? 'bg-slate-100 font-semibold' : ''
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="bg-red-50 text-red-600 px-1 rounded font-bold uppercase border border-red-200/50">
                      Room #{d.id}
                    </span>
                    <span>
                      {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-800">Tugas ID: #{d.task_id}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{d.reason}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right side messages */}
        {selectedDispute ? (
          <div className="md:col-span-2 flex flex-col min-h-0 h-full bg-white">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/20 text-xs">
              <div>
                <strong className="font-bold text-slate-800">Room Sengketa #{selectedDispute.id}</strong>
                <span className="text-slate-400 block text-[10px] mt-0.5">Alasan: {selectedDispute.reason}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-800">
                {selectedDispute.status}
              </span>
            </div>

            {/* Chat timeline */}
            <div
              id="dispute-messages-container"
              className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/10"
            >
              {selectedDispute.chat_history.length === 0 ? (
                <p className="text-center py-20 text-xs text-slate-400 italic">Belum ada obrolan terkirim.</p>
              ) : (
                selectedDispute.chat_history.map((msg, idx) => {
                  const isSelf = msg.sender === userRole;
                  const displaySenderName = msg.sender === 'buter' ? 'Superhero' : msg.sender === 'customer' ? 'Customer' : msg.sender;
                  return (
                    <div key={idx} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded text-xs space-y-1 ${
                        isSelf
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : msg.sender === 'admin'
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-950 mx-auto text-center'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                      }`}>
                        <span className="block text-[9px] font-bold uppercase tracking-wider opacity-60">
                          {isSelf ? 'Anda' : displaySenderName}
                        </span>
                        <p className="leading-relaxed">{msg.message}</p>
                        <span className="block text-[8px] opacity-40 text-right mt-1">
                          {new Date(msg.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message input form */}
            {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' ? (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  disabled={sending}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs bg-white"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs transition"
                >
                  Kirim
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-100 text-center text-[10px] text-slate-400 italic">
                Ruang obrolan sengketa ini telah selesai ditangani.
              </div>
            )}
          </div>
        ) : (
          <div className="md:col-span-2 flex flex-col items-center justify-center p-8 text-slate-400 text-center space-y-2 h-full bg-white">
            <span className="text-3xl">💬</span>
            <h3 className="text-xs font-bold text-slate-600">Tidak Ada Room Terpilih</h3>
            <p className="text-[11px] max-w-xs leading-relaxed">
              Pilih salah satu ruang sengketa di sisi kiri untuk melihat dan menanggapi log diskusi.
            </p>
          </div>
        )}
      </div>
    </NotionShell>
  );
}
