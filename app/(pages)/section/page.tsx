"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function SectionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [aktifTab, setAktifTab] = useState<"seksi" | "paket">("seksi");
  const [tipeAkun, setTipeAkun] = useState("Gratis");
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    async function ambilSesi() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/masuk");
        return;
      }

      const { data: profil } = await supabase
        .from("profiles")
        .select("tipe_keanggotaan")
        .eq("id", user.id)
        .single();

      if (profil) {
        setTipeAkun(profil.tipe_keanggotaan || "Gratis");
      }
      setMemuat(false);
    }
    ambilSesi();
  }, [router, supabase]);

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* 1. KIRI: BILAH SISI (SIDEBAR) - Terinspirasi dari Layout image_0ca143.jpg */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 font-black text-xl tracking-wide">
            <span className="bg-teal-600 text-white px-2 py-0.5 rounded-lg shadow-sm">UKBI</span>
            <span className="text-white">Garuda</span>
          </div>

          {/* Menu Navigasi */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Utama</p>
              <nav className="mt-2 space-y-1">
                <Link href="/belajar" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                  <span>🏠</span> Dasbor Belajar
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Latihan & Ujian</p>
              <nav className="mt-2 space-y-1">
                <Link href="/simulasi" className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-teal-400 bg-teal-950/40 border border-teal-900/50 rounded-xl transition-all">
                  <span>📝</span> Simulasi UKBI
                </Link>
                <Link href="/modul" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                  <span>📖</span> Modul Interaktif
                </Link>
                <Link href="/tutor" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                  <span>👩‍🏫</span> Marketplace Tutor
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Profil Singkat Bawah */}
        <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200">Status Akun</p>
            <p className="text-[11px] text-teal-400 font-semibold uppercase">{tipeAkun}</p>
          </div>
          {tipeAkun === "Gratis" && (
            <Link href="/bayar" className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded shadow transition-all">
              PRO
            </Link>
          )}
        </div>
      </aside>

      {/* 2. KANAN: KONTEN UTAMA */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto space-y-8 overflow-y-auto w-full">
        
        {/* Header Atas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">UKBI Practice & Simulation</h1>
            <p className="text-sm text-slate-400 mt-1">Sistem Uji Komprehensif Berdasarkan Standar Resmi Kemendikbudristek.</p>
          </div>

          {/* Pengalih Tab Konten */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => setAktifTab("seksi")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${aktifTab === "seksi" ? "bg-teal-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Latihan Per Seksi
            </button>
            <button
              onClick={() => setAktifTab("paket")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${aktifTab === "paket" ? "bg-teal-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Simulasi Paket Resmi
            </button>
          </div>
        </div>

        {/* TAB 1: GRID LATIHAN PER MATERI UJI (Gaya Bento Card Kompleks Sesuai Gambar) */}
        {aktifTab === "seksi" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-300">Materi Pengujian Kompetensi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Seksi I: Mendengarkan */}
              <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative group">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Seksi I</span>
                    <span className="text-xs text-slate-500 font-medium">⏱️ 30 Menit</span>
                  </div>
                  <h3 className="text-xl font-black text-amber-400">Mendengarkan</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Wacana lisan berbentuk 4 dialog dan 4 monolog. Masing-masing terdiri atas 5 butir soal akurasi.</p>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400">📊 40 Butir Soal</span>
                  <button className="h-9 w-9 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow transition-transform group-hover:scale-105">▶</button>
                </div>
              </div>

              {/* Seksi II: Merespons Kaidah */}
              <div className="bg-gradient-to-br from-orange-500/15 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative group">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">Seksi II</span>
                    <span className="text-xs text-slate-500 font-medium">⏱️ 20 Menit</span>
                  </div>
                  <h3 className="text-xl font-black text-orange-400">Merespons Kaidah</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Mengidentifikasi bagian kalimat yang tidak selaras dengan kaidah bahasa serta menentukan pilihan pengganti yang tepat.</p>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400">📊 25 Butir Soal</span>
                  <button className="h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow transition-transform group-hover:scale-105">▶</button>
                </div>
              </div>

              {/* Seksi III: Membaca */}
              <div className="bg-gradient-to-br from-yellow-500/15 via-slate-900 to-slate-900 border border-yellow-500/30 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative group">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">Seksi III</span>
                    <span className="text-xs text-slate-500 font-medium">⏱️ 45 Menit</span>
                  </div>
                  <h3 className="text-xl font-black text-yellow-400">Membaca</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Pemahaman bacaan teks komprehensif yang disajikan dalam maksimal 8 wacana tulis terstruktur.</p>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400">📊 40 Butir Soal</span>
                  <button className="h-9 w-9 rounded-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow transition-transform group-hover:scale-105">▶</button>
                </div>
              </div>

              {/* Seksi IV: Menulis */}
              <div className="bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative group">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Seksi IV</span>
                    <span className="text-xs text-slate-500 font-medium">⏱️ 35 Menit</span>
                  </div>
                  <h3 className="text-xl font-black text-emerald-400">Menulis</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Tugas gubahan esai teks berdasarkan kalimat pemantik infografik atau visualisasi bagan interaktif.</p>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400">📊 2 Tugas Esai</span>
                  <button className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow transition-transform group-hover:scale-105">▶</button>
                </div>
              </div>

              {/* Seksi V: Berbicara */}
              <div className="bg-gradient-to-br from-purple-500/15 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative group col-span-1 sm:col-span-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">Seksi V</span>
                    <span className="text-xs text-slate-500 font-medium">⏱️ 25 Menit</span>
                  </div>
                  <h3 className="text-xl font-black text-purple-400">Berbicara</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Mempresentasikan argumen/topik kontekstual berdasarkan rangsangan bagan gambar panduan dalam batas waktu perekaman suara terukur.</p>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400">📊 2 Tugas Presentasi Lisan</span>
                  <button className="h-9 w-9 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow transition-transform group-hover:scale-105">▶</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SIMULASI PAKET RESMI (Evaluasi Bundle / Paket Berlangganan) */}
        {aktifTab === "paket" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-300">Paket Uji Komparatif Resmi</h2>
            <div className="space-y-4">
              
              {/* PAKET 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">Simulasi Paket 1</h3>
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-bold uppercase">Skor Langsung</span>
                  </div>
                  <p className="text-xs text-slate-400">Terdiri atas 3 materi inti utama: Seksi I (Mendengarkan), Seksi II (Merespons Kaidah), dan Seksi III (Membaca). Hasil akumulasi total skor kompetensi dapat langsung diketahui instan setelah uji selesai.</p>
                </div>
                <button 
                  onClick={() => router.push("/simulasi/kerjakan?paket=1")}
                  className="w-full md:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-md shadow-teal-600/10"
                >
                  Mulai Paket 1
                </button>
              </div>

              {/* PAKET 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">Simulasi Paket 2</h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">Maks 10 Hari Kerja</span>
                  </div>
                  <p className="text-xs text-slate-400">Kombinasi 4 materi pengujian tingkat lanjut: Seksi I, Seksi II, Seksi III, ditambah pengerjaan tugas esai terstruktur pada Seksi IV (Menulis). Membutuhkan waktu penilaian manual / AI terintegrasi.</p>
                </div>
                {tipeAkun === "Paket 2" || tipeAkun === "Paket 3" ? (
                  <button 
                    onClick={() => router.push("/simulasi/kerjakan?paket=2")}
                    className="w-full md:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                  >
                    Mulai Paket 2
                  </button>
                ) : (
                  <Link 
                    href="/bayar" 
                    className="w-full md:w-auto text-center px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                  >
                    🔒 Buka Akses Paket 2
                  </Link>
                )}
              </div>

              {/* PAKET 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">Simulasi Paket 3 (Lengkap)</h3>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold uppercase">Maks 14 Hari Kerja</span>
                  </div>
                  <p className="text-xs text-slate-400">Bundel simulasi terlengkap mencakup keseluruhan lima kompetensi pengujian kebahasaan secara paripurna (Seksi I s.d Seksi V). Sangat direkomendasikan untuk uji validitas tertinggi.</p>
                </div>
                {tipeAkun === "Paket 3" ? (
                  <button 
                    onClick={() => router.push("/simulasi/kerjakan?paket=3")}
                    className="w-full md:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                  >
                    Mulai Paket Lengkap
                  </button>
                ) : (
                  <Link 
                    href="/bayar" 
                    className="w-full md:w-auto text-center px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                  >
                    🔒 Buka Paket Lengkap
                  </Link>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}