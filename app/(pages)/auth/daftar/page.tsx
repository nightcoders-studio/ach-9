"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";

export default function DaftarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [surel, setSurel] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [pesanEror, setPesanEror] = useState("");

  const tanganiDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemuat(true);
    setPesanEror("");

    // Registrasi ke Supabase Auth dengan membawa metadata profil baru
    const { error } = await supabase.auth.signUp({
      email: surel,
      password: kataSandi,
      options: {
        data: {
          nama_lengkap: namaLengkap,
          peran: "User", // Menjamin nilai sesuai dengan CHECK constraint (User/Admin)
        },
      },
    });

    if (error) {
      setPesanEror(error.message);
      setMemuat(false);
    } else {
      alert("Pendaftaran berhasil! Silakan masuk menggunakan akun baru Anda.");
      router.push("/auth/masuk");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-slate-900 font-sans">
      
      {/* Sisi Kiri: Panel Ilustrasi & Branding */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-teal-700 to-emerald-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
            <span className="bg-white text-teal-700 px-3 py-1 rounded-xl shadow-md">UKBI</span>
            <span>Garuda</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-3xl font-light leading-relaxed italic">
            "Peugah haba ngon budi basa, peumulia bansa ngon bhah bahasa."
          </blockquote>
          <div>
            <p className="font-semibold text-lg text-teal-200">Mulailah Perjalanan Literasimu</p>
            <p className="text-sm text-teal-100/80 mt-1">
              Dapatkan akses ke simulasi interaktif paket resmi, materi adaptif kebahasaan, dan komunitas belajar terbesar di Aceh.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-teal-200/60">
          &copy; 2026 UKBI Garuda. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Sisi Kanan: Form Registrasi */}
      <div className="flex flex-col col-span-1 lg:col-span-7 justify-center items-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          
          {/* Header Form */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Buat Akun Baru
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Isi data di bawah ini untuk memulai langkah pembelajaran gratis Anda.
            </p>
          </div>

          {/* Pesan Kesalahan jika ada */}
          {pesanEror && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900">
              ⚠️ {pesanEror}
            </div>
          )}

          {/* Form Utama */}
          <form onSubmit={tanganiDaftar} className="space-y-4">
            
            {/* Input Nama Lengkap */}
            <div className="space-y-1.5">
              <label htmlFor="namaLengkap" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nama Lengkap
              </label>
              <input
                id="namaLengkap"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-1.5">
              <label htmlFor="surel" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Alamat Surel (Email)
              </label>
              <input
                id="surel"
                type="email"
                placeholder="nama@contoh.com"
                required
                value={surel}
                onChange={(e) => setSurel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* Input Kata Sandi */}
            <div className="space-y-1.5">
              <label htmlFor="kata-sandi" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <input
                id="kata-sandi"
                type="password"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* Tombol Buat Akun */}
            <button
              type="submit"
              disabled={memuat}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-teal-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {memuat ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                "Daftar Akun"
              )}
            </button>
          </form>

          {/* Navigasi Kembali ke Login */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400">
            Sudah memiliki akun?{" "}
            <Link 
              href="/auth/masuk" 
              className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
            >
              Masuk Di Sini
            </Link>
          </div>

        </div>
      </div>
    </div>
  ); 
}