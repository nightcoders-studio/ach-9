"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function BelajarDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [namaLengkap, setNamaLengkap] = useState("Pengguna");
  const [tipeAkun, setTipeAkun] = useState("Gratis");
  const [memuat, setMemuat] = useState(true);
  const [tampilModalPremium, setTampilModalPremium] = useState(false);

  useEffect(() => {
    async function ambilDataProfil() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/masuk");
        return;
      }

      const { data: profil } = await supabase
        .from("profiles")
        .select("nama_lengkap, tipe_keanggotaan")
        .eq("id", user.id)
        .single();

      if (profil) {
        setNamaLengkap(profil.nama_lengkap);
        setTipeAkun(profil.tipe_keanggotaan || "Gratis");
      }
      setMemuat(false);
    }

    ambilDataProfil();
  }, [router, supabase]);

  // Fungsi Mockup untuk Demo Hackathon
  const tanganiUpgrade = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ tipe_keanggotaan: "Premium" })
        .eq("id", user.id);
      
      if (!error) {
        setTipeAkun("Premium");
        setTampilModalPremium(false);
        alert("Berhasil! Akun Anda sekarang adalah Premium (Mode Demo).");
      }
    }
  };

  const tanganiKeluar = async () => {
    await supabase.auth.signOut();
    router.push("/auth/masuk");
  };

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-12">
      {/* Navbar Sederhana */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl tracking-wide">
          <span className="bg-teal-600 text-white px-2 py-0.5 rounded-lg shadow-sm">UKBI</span>
          <span className="text-slate-800 dark:text-white">Garuda</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{namaLengkap}</p>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{tipeAkun} Member</p>
          </div>
          <button 
            onClick={tanganiKeluar}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Selamat datang, {namaLengkap.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Mari lanjutkan progres belajarmu hari ini.
            </p>
          </div>
          
          {tipeAkun === "Gratis" && (
            <Link 
              href="/bayar" 
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 text-sm text-center"
            >
              ⭐ Upgrade ke Premium
            </Link>
          )}
        </div>

        {/* Grid Fitur Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kartu Simulasi UKBI */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 dark:bg-teal-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Simulasi UKBI</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[60px]">
              Uji kemampuan bahasamu dengan standar resmi. Dapatkan analisis langsung berbasis AI.
            </p>
            <div className="space-y-3">
              <Link href="/simulasi" className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Mulai Simulasi
              </Link>
            </div>
          </div>

          {/* Kartu Modul Belajar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Modul Interaktif</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[60px]">
              Modul Belajar Bahasa Indonesia dan Modul Belajar BIPA.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Kosakata Budaya Aceh</span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded">20%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Tata Bahasa A1</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">Mulai</span>
              </div>
              <Link href="/modul" className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2">
                Lihat Semua Modul &rarr;
              </Link>
            </div>
          </div>

          {/* Kartu Marketplace Tutor (Sudah Diperbaiki) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Marketplace Tutor</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[60px]">
              Temukan pengajar Bahasa Indonesia dan praktisi BIPA terbaik di Aceh untuk bimbingan intensif.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Tutor Aktif Tersedia</span>
                <span className="text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  15 Pengajar
                </span>
              </div>
              <Link href="/tutor" className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Cari Pengajar Terbaik
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Modal / Popup Upgrade Premium Khusus Hackathon */}
      {tampilModalPremium && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Buka Potensi Penuhmu!</h2>
              <p className="text-orange-50 mt-1">Upgrade ke UKBI Garuda Premium</p>
            </div>
            
            <div className="p-6 space-y-6">
              <ul className="space-y-3">
                {[
                  "Akses penuh ke semua paket Simulasi UKBI (Seksi I - V)",
                  "Penilaian Menulis & Berbicara instan oleh AI (Whisper)",
                  "Modul BIPA Premium & Audio Penutur Asli",
                  "Lencana khusus di Komunitas & Prioritas Mentoring"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Harga Spesial Demo Hackathon</p>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Rp 0 <span className="text-base font-normal text-slate-500">/ selamanya</span></div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setTampilModalPremium(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Nanti Saja
                </button>
                <button 
                  onClick={tanganiUpgrade}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md shadow-orange-500/20 transition-colors"
                >
                  Simulasikan Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}