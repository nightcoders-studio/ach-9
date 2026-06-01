# TaskHub MVP (Hackathon Demo)

TaskHub adalah *marketplace* sederhana yang mempertemukan orang yang membutuhkan bantuan untuk sebuah tugas (Pemberi Tugas) dengan orang yang bersedia mengerjakannya demi imbalan (Pekerja).

Proyek ini dibangun sebagai **Minimum Viable Product (MVP)** dalam waktu sangat terbatas (target 3 jam) untuk demonstrasi *hackathon*. Fokus utama adalah membuktikan alur kerja inti.

## 🚀 Filosofi MVP: Pemangkasan Agresif

Untuk mencapai target waktu pembangunan, fitur-fitur berikut **SENGAJA TIDAK DIBUAT** pada versi ini:
* ❌ Wallet & Payment Gateway (Pembayaran dilakukan di luar sistem).
* ❌ Sistem Rating & Review.
* ❌ Notifikasi Real-time.
* ❌ Fitur Chat (Hanya pesan singkat saat *bidding*).
* ❌ Upload Bukti Kerja & Verifikasi KTP.

## ✅ Fitur Utama yang Diimplementasikan

Aplikasi ini berfokus sepenuhnya pada alur inti:
1.  **Autentikasi Sederhana:** Login/Register otomatis hanya menggunakan Email dan Nama (Disimpan di database dan LocalStorage untuk sesi demo).
2.  **Buat Tugas:** Pengguna dapat memposting tugas dengan Judul, Deskripsi, dan Budget fix.
3.  **Daftar Tugas:** Menampilkan semua tugas yang berstatus `OPEN`.
4.  **Sistem Bid:** Pengguna lain dapat mengajukan penawaran harga dan pesan singkat pada tugas yang diminati.
5.  **Pilih Pemenang:** Pemilik tugas dapat melihat daftar penawaran dan menerima salah satu *bid*. Status tugas akan berubah menjadi `ASSIGNED`.
6.  **Dashboard Sederhana:** Menampilkan ringkasan tugas yang dibuat pengguna dan tugas yang diambil/dimenangkan pengguna.

## 🛠️ Stack Teknologi

* **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
* **Bahasa:** [TypeScript](https://www.typescript.lang.org/)
* **ORM:** [Prisma v5](https://www.prisma.io/)
* **Database:** [SQLite](https://www.sqlite.org/) (Menggunakan file lokal `dev.db` untuk kemudahan demo tanpa setup server DB).
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 🔧 Catatan Teknis & Konfigurasi (Penting)

Selama pengembangan MVP ini, dilakukan penyesuaian teknis penting untuk mengatasi batasan waktu dan kompatibilitas teknologi:

1.  **Prisma Downgrade (v5):** Kami menggunakan Prisma versi 5. Perintah `url = "file:./dev.db"` di dalam `schema.prisma` **tidak lagi didukung di Prisma v7** tanpa konfigurasi rumit. Jangan mengupgrade ke v7 untuk proyek ini.
2.  **SQLite & Enums:** Karena SQLite tidak mendukung tipe data `Enum` asli secara native di Prisma, semua status (`TaskStatus`, `BidStatus`) diimplementasikan sebagai tipe data `String` di database, dengan validasi logika di tingkat aplikasi (contoh default: `"OPEN"`, `"PENDING"`).

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
* Node.js (versi terbaru direkomendasikan)
* npm atau yarn

### Langkah-langkah

1.  **Clone Repositori:**
    ```bash
    git clone <url-repositori-anda>
    cd mitabut
    ```

2.  **Instal Dependensi (Pastikan menggunakan Prisma v5):**
    ```bash
    npm install
    # atau jika menggunakan package.json yang sudah ada:
    npm install prisma@5 @prisma/client@5 --save-dev
    ```

3.  **Setup Database (SQLite):**
    Jalankan perintah ini untuk membuat file database lokal (`prisma/dev.db`) dan membuat tabel berdasarkan skema Prisma.
    ```bash
    npx prisma db push
    ```
    *Catatan: Anda tidak perlu menjalankan `npx prisma migrate dev` untuk demo hackathon, cukup `db push`.*

4.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

5.  **Jalankan Server Pengembangan:**
    ```bash
    npm run dev
    ```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📝 Struktur Skema Database (Ringkas)

Skema lengkap ada di `prisma/schema.prisma`. Berikut ringkasannya:

* **User:** Menyimpan `id`, `name`, `email`.
* **Task:** Detail tugas (`title`, `budget`, `status`) dan relasi ke pembuat (`userId`).
* **Bid:** Penawaran harga (`price`, `message`, `status`) dari user ke task tertentu.
* **TaskAssignment:** Mencatat siapa pekerja yang memenangkan tugas tertentu.

*(Tabel lain seperti Chat, Review, Verification ada di skema tetapi tidak digunakan dalam logika MVP ini).*
