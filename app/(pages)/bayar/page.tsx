"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function PembayaranPage() {
  const router = useRouter();
  const supabase = createClient();

  const [memuat, setMemuat] = useState(true);
  const [prosesBayar, setProsesBayar] = useState(false);
  const [paketDipilih, setPaketDipilih] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [statusKeanggotaan, setStatusKeanggotaan] = useState("Gratis");

  useEffect(() => {
    async function cekSesi() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/masuk");
        return;
      }
      
      setUserId(user.id);

      const { data: profil } = await supabase
        .from("profiles")
        .select("tipe_keanggotaan")
        .eq("id", user.id)
        .single();

      if (profil) {
        setStatusKeanggotaan(profil.tipe_keanggotaan || "Gratis");
      }
      
      setMemuat(false);
    }

    cekSesi();
  }, [router, supabase]);

  const jalankanSimulasiPembayaran = async (namaPaket: string) => {
    if (!userId) return;
    
    setPaketDipilih(namaPaket);
    setProsesBayar(true);

    // Menyimulasikan jeda proses pembayaran selama 1.5 detik
    setTimeout(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ tipe_keanggotaan: "Premium" })
        .eq("id", userId);

      if (error) {
        alert(`Gagal memproses pembayaran: ${error.message}`);
        setProsesBayar(false);
        setPaketDipilih(null);
      } else {
        alert(`Pembayaran ${namaPaket} Berhasil Disimulasikan! Akun Anda kini aktif sebagai Premium.`);
        router.push("/belajar");
      }
    }, 1500);
  };

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Batang Navigasi Atas */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push("/belajar")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            &larr; Kembali ke Dasbor
          </button>
          <div className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1 rounded-full">
            Mode Demo Hackathon
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 space-y-12">
        
        {/* Bagian Judul */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Pilih Paket yang Sesuai dengan Kebutuhanmu
          </h1>
          <p className="text-md text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Status akun Anda saat ini: <span className="bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 px-2.5 py-0.5 rounded-md font-bold text-xs uppercase ml-1">{statusKeanggotaan}</span>
          </p>
        </div>

        {/* Tiga Kartu Harga (Gaya Modern Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-4">
          
          {/* PAKET 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Pilihan Dasar</p>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">Paket 1</h3>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-extrabold text-slate-950 dark:text-white">Rp 13.000</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">sekali bayar</p>
              </div>

              <ul className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                {[
                  "20 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)",
                  "Analisis Jawaban Otomatis",
                  "Progress Tracking"
                ].map((fitur, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{fitur}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => jalankanSimulasiPembayaran("Paket 1")}
              disabled={prosesBayar || statusKeanggotaan === "Premium"}
              className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {prosesBayar && paketDipilih === "Paket 1" ? "Memproses..." : statusKeanggotaan === "Premium" ? "Sudah Premium" : "Pilih Paket Ini \u2192"}
            </button>
          </div>

          {/* PAKET 2 - POPULER */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-teal-500 dark:border-teal-400 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            {/* Badge Populer Atas */}
            <div className="absolute -top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">
              ★ Populer
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Paling Diminati</p>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">Paket 2</h3>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-extrabold text-slate-950 dark:text-white">Rp 15.000</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">sekali bayar</p>
              </div>

              <ul className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                {[
                  "20 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)",
                  "Analisis Jawaban Otomatis",
                  "Progress Tracking",
                  "2x Simulasi Ujian"
                ].map((fitur, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{fitur}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => jalankanSimulasiPembayaran("Paket 2")}
              disabled={prosesBayar || statusKeanggotaan === "Premium"}
              className="mt-8 w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-500/10 transition-all disabled:opacity-50"
            >
              {prosesBayar && paketDipilih === "Paket 2" ? "Memproses..." : statusKeanggotaan === "Premium" ? "Sudah Premium" : "Pilih Paket Ini \u2192"}
            </button>
          </div>

          {/* PAKET 3 - LENGKAP */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Rekomendasi Instansi</p>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">Paket 3 - Lengkap</h3>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-extrabold text-slate-950 dark:text-white">Rp 17.000</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">sekali bayar</p>
              </div>

              <ul className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                {[
                  "25 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)",
                  "Analisis Jawaban Otomatis",
                  "Progress Tracking",
                  "5x Simulasi Ujian"
                ].map((fitur, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{fitur}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => jalankanSimulasiPembayaran("Paket 3")}
              disabled={prosesBayar || statusKeanggotaan === "Premium"}
              className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {prosesBayar && paketDipilih === "Paket 3" ? "Memproses..." : statusKeanggotaan === "Premium" ? "Sudah Premium" : "Pilih Paket Ini \u2192"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}