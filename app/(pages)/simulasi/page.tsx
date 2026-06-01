"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function SimulasiPage() {
  const router = useRouter();
  const supabase = createClient();

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
      
      {/* 1. KIRI: SIDEBAR NAVIGASI */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 font-black text-xl tracking-wide">
            <span className="bg-teal-600 text-white px-2 py-0.5 rounded-lg shadow-sm">UKBI</span>
            <span className="text-white">Garuda</span>
          </div>

          {/* Menu */}
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
                <Link href="/section" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                  <span>🎯</span> Latihan Per Seksi
                </Link>
                <Link href="/simulasi" className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-teal-400 bg-teal-950/40 border border-teal-900/50 rounded-xl transition-all">
                  <span>📝</span> Simulasi Paket Uji
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

        {/* Status Profile Bawah */}
        <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200">Status Akun</p>
            <p className="text-[11px] text-teal-400 font-semibold uppercase">{tipeAkun}</p>
          </div>
          {tipeAkun === "Gratis" && (
            <Link href="/bayar" className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded shadow transition-all">
              UPGRADE
            </Link>
          )}
        </div>
      </aside>

      {/* 2. KANAN: KONTEN UTAMA SIMULASI PAKET */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto space-y-12 overflow-y-auto w-full">
        
        {/* Header Konten */}
        <div className="text-center md:text-left space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-white">Simulasi Paket Resmi UKBI</h1>
          <p className="text-sm text-slate-400">
            Pilih paket simulasi ujian resmi Anda. Selesaikan ujian untuk mendapatkan prediksi skor akurat.
          </p>
        </div>

        {/* Grid Paket 1, 2, 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* KARTU PAKET 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-md">
                  Paket 1
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-3">Paket 1</h3>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-3xl font-black text-teal-400">Rp 13.000</div>
                <p className="text-[11px] text-slate-500 font-medium">sekali bayar</p>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-800/60 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>20 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Analisis Jawaban Otomatis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Progress Tracking</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              {tipeAkun === "Paket 1" || tipeAkun === "Paket 2" || tipeAkun === "Paket 3" ? (
                <button 
                  onClick={() => router.push("/simulasi/kerjakan?paket=1")}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-teal-600/10"
                >
                  Mulai Simulasi Paket 1
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/bayar")}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors border border-slate-700"
                >
                  🔒 Beli Paket Ini
                </button>
              )}
            </div>
          </div>

          {/* KARTU PAKET 2 (POPULER) */}
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            {/* Lencana Terpopuler */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">
              ⭐ POPULER
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md">
                  Paket 2
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-3">Paket 2</h3>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-3xl font-black text-amber-400">Rp 15.000</div>
                <p className="text-[11px] text-slate-500 font-medium">sekali bayar</p>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-800/60 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>20 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Analisis Jawaban Otomatis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Progress Tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="text-amber-400 font-bold">2x Simulasi Ujian</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              {tipeAkun === "Paket 2" || tipeAkun === "Paket 3" ? (
                <button 
                  onClick={() => router.push("/simulasi/kerjakan?paket=2")}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-sm transition-transform active:scale-[0.99] shadow-lg shadow-orange-500/10"
                >
                  Mulai Simulasi Paket 2
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/bayar")}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors border border-slate-700"
                >
                  🔒 Beli Paket Ini
                </button>
              )}
            </div>
          </div>

          {/* KARTU PAKET 3 - LENGKAP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-md">
                  Paket 3
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-3">Paket 3 - Lengkap</h3>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-3xl font-black text-purple-400">Rp 17.000</div>
                <p className="text-[11px] text-slate-500 font-medium">sekali bayar</p>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-800/60 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>25 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Analisis Jawaban Otomatis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Progress Tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="text-purple-400 font-bold">5x Simulasi Ujian</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              {tipeAkun === "Paket 3" ? (
                <button 
                  onClick={() => router.push("/simulasi/kerjakan?paket=3")}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-purple-600/10"
                >
                  Mulai Paket Lengkap
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/bayar")}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors border border-slate-700"
                >
                  🔒 Beli Paket Ini
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}