"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";

export default function MasukPage() {
  // Inisialisasi router dan klien Supabase
  const router = useRouter();
  const supabase = createClient();

  // State untuk form
  const [surel, setSurel] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [memuat, setMemuat] = useState(false);

  // Fungsi penanganan login utama
  const tanganiMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemuat(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email: surel,
      password: kataSandi,
    });

    if (error) {
      alert(`Gagal masuk: ${error.message}`);
      setMemuat(false);
    } else {
      // Cek email untuk redirect berbasis admin
      const email = data.user?.email?.toLowerCase();

      if (email === "nandahax@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/belajar");
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Sisi Kiri: Panel Ilustrasi & Branding (Tersembunyi di Mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Pola Dekoratif Minimalis */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
            <span className="bg-white text-emerald-700 px-3 py-1 rounded-xl shadow-md">UKBI</span>
            <span>Garuda</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-3xl font-light leading-relaxed italic">
wawqwaw 
          </blockquote>
          <div>
            <p className="font-semibold text-lg text-emerald-200">Latihan UKBI Nyata & Kontekstual</p>
            <p className="text-sm text-emerald-100/80 mt-1">
              Tingkatkan kompetensi berbahasa, ikuti simulasi berbasis AI, dan bergabunglah dengan komunitas belajar terbesar di Aceh.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/60">
          &copy; 2026 Tutur. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Sisi Kanan: Form Autentikasi */}
      <div className="flex flex-col col-span-1 lg:col-span-7 justify-center items-center p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          
          {/* Header Form */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Selamat Datang Kembali
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Masuk untuk melanjutkan simulasi dan melihat progres belajarmu.
            </p>
          </div>

          {/* Form Utama */}
          <form onSubmit={tanganiMasuk} className="space-y-5">
            <div className="space-y-2">
              <label 
                htmlFor="surel" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Alamat Surel (Email)
              </label>
              <input
                id="surel"
                type="email"
                placeholder="nama@contoh.com"
                required
                value={surel}
                onChange={(e) => setSurel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="kata-sandi" 
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Kata Sandi
                </label>
                <a 
                  href="#" 
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <input
                id="kata-sandi"
                type="password"
                placeholder="••••••••"
                required
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={memuat}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {memuat ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Menghubungkan...</span>
                </>
              ) : (
                "Masuk ke Akun"
              )}
            </button>
          </form>

          {/* Pembatas atau Opsi Pendaftaran */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400">
            Belum punya akun?{" "}
            <Link 
              href="/auth/daftar" 
              className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}