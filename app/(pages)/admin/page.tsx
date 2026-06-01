"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";

interface ProfilUser {
  id: string;
  nama_lengkap: string;
  peran: string;
  tipe_keanggotaan: string;
  total_poin: number;
  dibuat_pada: string;
}

export default function DaftarPenggunaAdminPage() {
  const supabase = createClient();
  const [daftarUser, setDaftarUser] = useState<ProfilUser[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    async function ambilSemuaUser() {
      // Mengambil seluruh data pengguna dari tabel profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("dibuat_pada", { ascending: false });

      if (!error && data) {
        setDaftarUser(data);
      }
      setMemuat(false);
    }

    ambilSemuaUser();
  }, [supabase]);

  if (memuat) return <div className="p-8 text-white">Memuat daftar pengguna...</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black">Panel Manajemen Pengguna</h1>
          <p className="text-sm text-slate-400">Total terdaftar: {daftarUser.length} pengguna</p>
        </div>

        {/* Tabel Daftar Pengguna */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold">
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Hak Akses (Peran)</th>
                <th className="p-4">Status Paket</th>
                <th className="p-4">Skor Poin</th>
                <th className="p-4">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {daftarUser.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-semibold text-white">{user.nama_lengkap}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.peran === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {user.peran}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.tipe_keanggotaan !== 'Gratis' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {user.tipe_keanggotaan}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-teal-400 font-bold">{user.total_poin} pts</td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(user.dibuat_pada).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}