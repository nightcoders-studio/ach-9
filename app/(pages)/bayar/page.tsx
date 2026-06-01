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

    // Simulasi pemrosesan gerbang pembayaran selama 1.5 detik
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
        alert(`Pembayaran ${namaPaket} Berhasil Disimulasikan! Status keanggotaan diperbarui.`);
        router.push("/belajar");
      }
    }, 1500);
  };

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] text-slate-900 font-sans pb-20">
      {/* Batang Navigasi */}
      <header className="border-b-4 border-black bg-white px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push("/belajar")}
            className="flex items-center gap-2 text-sm font-black border-2 border-black bg-white hover:bg-slate-50 px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            &larr; Kembali ke Dasbor
          </button>
          <div className="text-xs font-black uppercase tracking-wider bg-rose-500 text-white border-2 border-black px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Mode Demo Hackathon
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 space-y-12">
        {/* Judul Atas */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">
            Pilih paket yang sesuai dengan kebutuhanmu
          </h1>
          <p className="text-md font-bold text-slate-600 max-w-xl mx-auto">
            Status akun Anda saat ini: <span className="bg-teal-400 border border-black px-2 py-0.5 rounded font-black text-xs text-black uppercase">{statusKeanggotaan}</span>
          </p>
        </div>

        {/* Grid Paket Bergaya Neo-Brutalism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 max-w-5xl mx-auto">
          
          {/* PAKET 1 */}
          <div className="bg-[#c2e7ff] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative min-h-[500px]">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black tracking-wider text-slate-700 uppercase">Paket 1</p>
                <h2 className="text-3xl font-black text-black mt-1">Paket 1</h2>
              </div>
              
              <div className="space-y-1">
                <div className="text-4xl font-black text-black">Rp 13.000</div>
                <p className="text-xs font-bold text-slate-700">sekali bayar</p>
              </div>

              {/* Daftar Fitur */}
              <ul className="space-y-4 pt-4 border-t-2 border-black/10">
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">20 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">Analisis Jawaban Otomatis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">Progress Tracking</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => jalankanSimulasiPembayaran("Paket 1")}
              disabled={prosesBayar}
              className="w-full bg-black text-white font-black py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border-2 border-black mt-8"
            >
              {prosesBayar && paketDipilih === "Paket 1" ? "Memproses..." : "Pilih Paket Ini \u2192"}
            </button>
          </div>

          {/* PAKET 2 (POPULER) */}
          <div className="bg-[#ffe14d] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative min-h-[500px]">
            {/* Lencana Terpopuler */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#f56565] border-4 border-black text-black font-black text-xs px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 uppercase">
              ⭐ Populer
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-black tracking-wider text-slate-700 uppercase">Paket 2</p>
                <h2 className="text-3xl font-black text-black mt-1">Paket 2</h2>
              </div>
              
              <div className="space-y-1">
                <div className="text-4xl font-black text-black">Rp 15.000</div>
                <p className="text-xs font-bold text-slate-700">sekali bayar</p>
              </div>

              {/* Daftar Fitur */}
              <ul className="space-y-4 pt-4 border-t-2 border-black/10">
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">20 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">Analisis Jawaban Otomatis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">Progress Tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">2x Simulasi Ujian</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => jalankanSimulasiPembayaran("Paket 2 (Populer)")}
              disabled={prosesBayar}
              className="w-full bg-black text-white font-black py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border-2 border-black mt-8"
            >
              {prosesBayar && paketDipilih === "Paket 2 (Populer)" ? "Memproses..." : "Pilih Paket Ini \u2192"}
            </button>
          </div>

          {/* PAKET 3 - LENGKAP */}
          <div className="bg-[#fbc2eb] border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative min-h-[500px]">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black tracking-wider text-slate-700 uppercase">Paket 3</p>
                <h2 className="text-3xl font-black text-black mt-1">Paket 3 - Lengkap</h2>
              </div>
              
              <div className="space-y-1">
                <div className="text-4xl font-black text-black">Rp 17.000</div>
                <p className="text-xs font-bold text-slate-700">sekali bayar</p>
              </div>

              {/* Daftar Fitur */}
              <ul className="space-y-4 pt-4 border-t-2 border-black/10">
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">25 Latihan --bebas di semua seksi (S1, S2, S3, S4, #S5soon)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">Analisis Jawaban Otomatis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">Progress Tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white text-[10px] font-black">✓</span>
                  <span className="text-sm font-bold text-black">5x Simulasi Ujian</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => jalankanSimulasiPembayaran("Paket 3 (Lengkap)")}
              disabled={prosesBayar}
              className="w-full bg-black text-white font-black py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border-2 border-black mt-8"
            >
              {prosesBayar && paketDipilih === "Paket 3 (Lengkap)" ? "Memproses..." : "Pilih Paket Ini \u2192"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}