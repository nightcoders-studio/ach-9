'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Task {
  id: number;
  description: string;
  pickup_location: string;
  dropoff_location: string;
  price: number;
  status: string;
  created_at: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchActiveTasks();
  }, []);

  const fetchActiveTasks = async () => {
    try {
      const response = await fetch('/api/v1/tasks/waiting?limit=3');
      const result = await response.json();
      if (response.ok && result.success && result.data.tasks?.length > 0) {
        setTasks(result.data.tasks);
      } else {
        // Fallback realistic tasks data if db is empty
        setTasks([
          {
            id: 1,
            title: 'Tolong Belikan Paracetamol & Thermometer di Apotek Kimia Farma',
            description: 'Saya sedang demam tinggi di kos dan tidak bisa keluar. Tolong belikan obat paracetamol dan thermometer di apotek terdekat, nanti diantar ke Kos Putri Anggrek kamar 12.',
            category: 'Health / Emergency',
            budgetMin: 15000,
            budgetMax: 25000,
            location: 'Tembalang, Semarang',
            bidsCount: 3
          },
          {
            id: 2,
            title: 'Jasa Angkat Barang Pindahan Kosan ke Mobil Pick-up',
            description: 'Butuh bantuan 1 orang untuk bantu angkat kardus dan lemari kecil dari lantai 2 kosan ke mobil bak di lantai dasar. Barang tidak terlalu banyak, perkiraan selesai 30 menit.',
            category: 'General Help / Others',
            budgetMin: 35000,
            budgetMax: 50000,
            location: 'Kukusan, Depok',
            bidsCount: 5
          },
          {
            id: 3,
            title: 'Ambil Jas Hujan Tertinggal di Gedung Perpustakaan Pusat',
            description: 'Jas hujan saya tertinggal di laci meja lantai 2 perpustakaan pusat dekat tangga darurat. Tolong ambilkan dan antar ke area parkiran Fakultas Teknik karena di sini hujan lebat.',
            category: 'Delivery / Courier',
            budgetMin: 20000,
            budgetMax: 20000,
            location: 'Kampus UI, Depok',
            bidsCount: 2
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const parseTask = (task: any) => {
    let title = task.title || 'Tugas Pengerjaan';
    let description = task.description;
    let category = task.category || 'Delivery / Courier';
    let budgetMin = task.budgetMin || task.price;
    let budgetMax = task.budgetMax || task.price;
    let location = task.location || task.pickup_location;
    let bidsCount = task.bidsCount || 2;

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

    return {
      ...task,
      title,
      description,
      category,
      budgetMin,
      budgetMax,
      location,
      bidsCount
    };
  };

  const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-slate-200 selection:text-slate-900">
      {/* Minimal Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/" className="text-base font-bold tracking-tight text-slate-900 hover:text-slate-600 transition-colors">
            mitabut.
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/tasks" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Telusuri Tugas
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                  Dasbor Saya
                </Link>
                <Link
                  href="/logout"
                  className="bg-slate-900 text-white px-3.5 py-1.5 rounded text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Keluar Sesi
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                  Masuk
                </Link>
                <Link
                  href="/login"
                  className="bg-slate-900 text-white px-3.5 py-1.5 rounded text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-28 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Get help from people <br />
            around you in minutes.
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
            Minta bantuan apa saja ke orang-orang di sekitar kos, kampus, atau kantormu. Praktis, cepat, dan aman dengan tarif yang kamu tentukan sendiri.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={isLoggedIn ? "/tasks/create" : "/login"}
            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded font-bold text-xs hover:bg-slate-800 transition"
          >
            Post a Task
          </Link>
          <Link
            href="/tasks"
            className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition"
          >
            Telusuri Tugas Aktif
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f9fafb] border-y border-slate-200 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-1 mb-14">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Cara Kerja Mitabut</h2>
            <p className="text-slate-400 text-xs font-medium">Tiga langkah mudah untuk menyelesaikan bantuan di sekitarmu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Langkah 01</span>
              <h3 className="text-sm font-bold text-slate-900">Post Kebutuhanmu</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Tulis bantuan yang Anda perlukan. Tentukan lokasi pengerjaan, batas waktu, dan anggaran upah yang ditawarkan.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Langkah 02</span>
              <h3 className="text-sm font-bold text-slate-900">Terima Penawaran</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Superhero terdekat akan mengirimkan tawaran harga dan ETA. Anda dapat meninjau rating mereka sebelum menerima penawaran.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Langkah 03</span>
              <h3 className="text-sm font-bold text-slate-900">Selesaikan & Bayar</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Pantau lokasi pengerjaan secara real-time. Konfirmasi pencairan upah setelah pekerjaan selesai dengan memuaskan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Active Tasks */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Tugas Aktif Terbaru</h2>
            <p className="text-slate-400 text-xs font-medium">Kebutuhan bantuan terbuka yang siap dikerjakan oleh para Superhero.</p>
          </div>
          <Link href="/tasks" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
            Lihat semua &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400">Memuat katalog tugas...</span>
          </div>
        ) : (
          <div className="space-y-2 divide-y divide-slate-100">
            {tasks.map(parseTask).map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="group block py-4 hover:bg-slate-50 transition duration-150 px-2 -mx-2 rounded-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                      {task.title}
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                    <span className="text-slate-700 font-bold">
                      {task.budgetMin === task.budgetMax
                        ? priceFormatter.format(task.budgetMin)
                        : `${priceFormatter.format(task.budgetMin)} - ${priceFormatter.format(task.budgetMax)}`
                      }
                    </span>
                    <span>•</span>
                    <span>{task.location}</span>
                    <span>•</span>
                    <span>{task.bidsCount} Penawaran</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-[#f9fafb] border-t border-slate-200 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-1 mb-14">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Apa Kata Mereka?</h2>
            <p className="text-slate-400 text-xs font-medium">Pengalaman nyata dari mahasiswa dan komunitas sekitar yang terbantu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded border border-slate-200 space-y-3">
              <p className="text-slate-500 text-xs italic leading-relaxed">
                "Aplikasi andalan kalau lagi sakit di kosan dan ga bisa keluar beli makan atau obat. Tinggal posting tugas, ga sampe 10 menit udah ada anak kos sebelah yang nawarin bantuan."
              </p>
              <div>
                <p className="font-bold text-slate-800 text-xs">Ahmad Atha</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Mahasiswa, Universitas Diponegoro</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded border border-slate-200 space-y-3">
              <p className="text-slate-500 text-xs italic leading-relaxed">
                "Lumayan banget buat nambah uang jajan. Sore-sore pas ga ada kelas, saya sering buka aplikasi ini buat nyari tugas angkat barang pindahan kosan atau fotokopi tugas dari mahasiswa lain."
              </p>
              <div>
                <p className="font-bold text-slate-800 text-xs">Diana Putri</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Mahasiswi, Universitas Brawijaya</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded border border-slate-200 space-y-3">
              <p className="text-slate-500 text-xs italic leading-relaxed">
                "Kemarin kunci kosan saya tertinggal di lab kampus pas malem. Sangat terbantu ada Superhero yang bersedia ngambilin kunci ke satpam dan nganter ke alamat saya luar area kampus."
              </p>
              <div>
                <p className="font-bold text-slate-800 text-xs">Rizki Wijaya</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Mahasiswa, Universitas Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-400 py-10 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-2">
          <p className="text-xs font-bold text-slate-800 tracking-tight">mitabut.</p>
          <p className="text-[10px] text-slate-400">Penyedia jasa bantuan umum berbasis komunitas &copy; 2026.</p>
        </div>
      </footer>
    </div>
  );
}
