# Product Requirements Document (PRD) — EDUSPACE

**Versi Dokumen:** 1.0 (MVP)  
**Tanggal:** 17 November 2026  
**Target Pengguna:** Siswa & Guru SMA Kelas XI (Kurikulum Merdeka)  
**Target Penggunaan:** Sesi praktikum kelas 45 menit (ringan, instan tanpa login, siap di desktop & mobile)  
**Referensi Desain:** Google Stitch Project *EDUSPACE Minimalist Virtual Lab* (`5022256206427031785`)

---

## 1. Ringkasan Produk & Batasan Ruang Lingkup

### 1.1 Visi & Tujuan MVP
**EDUSPACE** adalah laboratorium virtual 3D interaktif berbasis web untuk siswa **SMA Kelas XI (Kurikulum Merdeka)** pada mata pelajaran **Fisika, Biologi, dan Matematika**. Aplikasi ini memungkinkan siswa memanipulasi parameter eksperimen secara langsung, mengamati perubahan model **3D isometrik** beserta anotasi dimensi dan vektornya, menganalisis kurva respon rumus, berdiskusi dengan **AI Co-Pilot (Gemini Flash)** yang sadar konteks, serta mencatat dan mengekspor hasil praktikum ke dalam **Lembar Kerja Digital (PDF/Teks)** dalam satu sesi belajar 45 menit.

### 1.2 In-Scope (Termasuk dalam MVP)
- **5 Tahap Alur Inti:**
  1. Landing Page Start minimalis.
  2. Pemilihan Mata Pelajaran & Topik SMA (6 modul terkalibrasi + tab *Pilihan Lainnya*).
  3. 3D Lab Workspace (Kontrol slider kiri + Kanvas 3D Isometrik kanan).
  4. Analisis Rumus, Grafik Respon, 4-Step Guided Task, & Dialog Penuh AI Co-Pilot.
  5. Lembar Kerja Praktikum Digital & Ekspor PDF / Salin Teks langsung di browser.
- **6 Modul Praktikum 3D SMA Kelas XI** (2 Fisika, 2 Biologi, 2 Matematika) dengan perhitungan deterministik eksak di sisi klien.
- **Bar Persisten Data Rumus + AI Co-Pilot** di bagian bawah setiap halaman.
- **Penyimpanan Lokal Sementara** menggunakan React State + `localStorage` (log percobaan, catatan manual, riwayat chat sesi aktif, dan status 4-step guided task).
- **Desain Responsif** untuk Desktop (`≥ 1024px`), Tablet (`768px–1023px`), dan Mobile (`< 768px`).

### 1.3 Out-of-Scope (DILARANG DIMASUKKAN)
Untuk menjaga aplikasi tetap ringan, cepat dimuat, dan fokus pada sesi praktikum 45 menit:
- ❌ Sistem login, registrasi, autentikasi akun, atau manajemen profil pengguna *(catatan: ikon profil pada referensi visual Stitch tidak diimplementasikan sebagai fitur akun; diganti indikator sesi lokal atau tombol bantuan singkat)*.
- ❌ Database backend, server API custom, atau sinkronisasi cloud.
- ❌ Dashboard admin, manajemen kelas/sekolah, atau sistem penilaian/LMS.
- ❌ Gamifikasi, sistem poin, XP, lencana (*badges*), atau papan peringkat (*leaderboard*).
- ❌ Forum sosial, komentar antar pengguna, atau fitur berbagi media sosial.
- ❌ Notifikasi push, service worker background sync, atau pengingat terjadwal.
- ❌ Penghitung FPS (*FPS counter*) atau panel debug performa di UI.
- ❌ Badge, label, atau istilah lomba (misalnya SDG, Subtema, atau penanda kompetisi).
- ❌ Materi jenjang SD maupun SMP.

---

## 2. Design System & Design Tokens (Soft Tactile Neumorphism — 3 Warna)

Antarmuka menerapkan gaya **Soft Tactile Neumorphism** (*Tactile Lab*): permukaan tampak timbul atau terukir lembut dari kanvas yang sama menggunakan pencahayaan dua arah dari **sudut kiri-atas (135°)**, tanpa garis tepi keras (`1px border` dilarang sebagai pemisah utama) dan mempertahankan minimal **40% ruang kosong (whitespace)** dengan skala grid **8px / 16px / 24px**.

### 2.1 Palet 3 Warna Terkunci

| Peran Warna | Nama | Kode Hex | Penggunaan Spesifik |
| :--- | :--- | :--- | :--- |
| **1. Warm Cream** | Base Canvas | `#EFECE4` | Latar belakang utama aplikasi (mengurangi kelelahan mata saat praktikum). |
| | Raised Surface | `#F6F3EC` | Kartu modul, panel kontrol variabel, floating bar, tombol standar, modal. |
| | Inset / Debossed Surface | `#E3DED2` | Stage/bezel kanvas 3D, lintasan (*track*) slider, input teks, kotak rumus, badge status, baris tabel terukir. |
| **2. Deep Charcoal** | Primary Text | `#23272A` | Judul halaman, nama modul, nilai angka hasil ukur, teks isi utama. |
| | Secondary Text | `#5C6064` | Subjudul, label sumbu, satuan ukur, placeholder, teks pendukung. |
| **3. Deep Teal** | Primary Accent | `#0E5A63` | Tombol pill CTA utama, fill slider aktif, ikon garis `2px`, kurva grafik, vektor gaya utama, titik status aktif. |
| *(Kontras Teks Accent)* | On-Accent | `#FFFFFF` | Teks dan ikon di atas tombol Deep Teal `#0E5A63`, serta highlight cahaya lembut. |

### 2.2 Elevasi & Bayangan Takti (*Dual-Light Physics*)
- **Raised (Timbul):**  
  `background: #F6F3EC;`  
  `box-shadow: 6px 6px 14px rgba(0, 0, 0, 0.06), -6px -6px 14px rgba(255, 255, 255, 0.85);`
- **Inset / Debossed (Cekung):**  
  `background: #E3DED2;`  
  `box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.05), inset -3px -3px 6px rgba(255, 255, 255, 0.70);`
- **Primary Accent CTA:**  
  `background: #0E5A63; color: #FFFFFF;`  
  `box-shadow: 4px 4px 10px rgba(14, 90, 99, 0.25);`
- **Pressed / Active State:** Transisi ke bayangan `inset` tanpa pergeseran tata letak.

### 2.3 Tipografi & Skala Spasi
- **UI & Display Font:** `Plus Jakarta Sans` (Weights: 400, 500, 600, 700; line-height minimal `1.5×`).
- **Scientific Monospace Font:** `JetBrains Mono` (Weights: 400, 500, 600) — wajib untuk seluruh rumus matematika/fisika, angka parameter real-time, satuan SI (`m/s²`, `Ω`, `μm`, `cm³`), dan koordinat.
- **Skala Grid & Radius:**
  - Spasi: `8px` (`0.5rem`), `16px` (`1rem`), `24px` (`1.5rem`), `32px` (`2rem`), `48px` (`3rem`).
  - Radius: `8px` (chip rumus/tag), `16px` (tombol standar, slider panel, bubble chat), `24px` (kartu utama & frame kanvas 3D), `9999px` (tombol pill, tab switcher, input bar).

### 2.4 Bar Persisten Bawah: Data Rumus + AI Co-Pilot
Hadir konsisten di bagian bawah seluruh 5 tahap:
- **Pada Tahap 1 & 2:** Floating pill bar terpusat berisi indikator status aktif + rumus ringkas modul aktif/pratinjau (`F = m · a`) di sisi kiri, dan input cepat `"Tanya AI Co-Pilot..."` + tombol kirim bulat `#0E5A63` di sisi kanan.
- **Pada Tahap 3:** Dock terpadu 2-kolom di bawah stage 3D:
  - Kiri: Persamaan dinamis real-time dengan angka ter-update langsung + 2 chip metrik turunan.
  - Kanan: Ringkasan observasi kausal otomatis AI Co-Pilot + input tanya cepat yang dapat membuka/mengarahkan ke Tahap 4.
- **Pada Tahap 4:** Panel penuh AI Co-Pilot menggantikan dock bawah, sedangkan ringkasan rumus berada di panel kiri.
- **Pada Tahap 5:** Bar ringkasan statistik eksperimen (rata-rata hasil & jumlah percobaan terkalibrasi) di sisi kiri + kesimpulan & input ringkas AI Co-Pilot untuk membantu menyusun kesimpulan laporan di sisi kanan.

---

## 3. Spesifikasi 5 Halaman (Desktop & Mobile)

### Tahap 1 — Landing Page Start (`/` | View: `landing`)
- **Tujuan:** Mengenalkan EDUSPACE secara tenang dan mengarahkan siswa langsung masuk ke pemilihan modul dalam < 10 detik.
- **Header:** Logo kubus isometrik + wordmark `EDUSPACE` di kiri; tombol pill CTA `Masuk Lab` (`#0E5A63`) di kanan *(tanpa ikon login/akun)*.
- **Konten Desktop (12 kolom, terpusat):**
  - Kiri (6 kolom): Headline *"Laboratorium 3D Interaktif untuk SMA"*, subjudul *"Pahami konsep Fisika, Biologi, dan Matematika lewat simulasi isometrik dan bimbingan AI Co-Pilot."*, dan tombol pill CTA `Mulai Belajar →`.
  - Kanan (6 kolom): Kartu Raised `#F6F3EC` berisi stage inset `#E3DED2` yang menampilkan pratinjau apparatus 3D isometrik interaktif ringan (Bidang Miring & balok berputar lambat) + metadata `MODUL FISIKA • GERAK PADA BIDANG MIRING`.
- **Reflow Mobile:** Stack vertikal 1 kolom; headline & CTA di atas, kartu preview 3D di bawah, bar AI Co-Pilot menempel rapi di bawah dengan padding aman.

### Tahap 2 — Pemilihan Mata Pelajaran & Topik SMA (`View: catalog`)
- **Tujuan:** Memilih salah satu dari 6 modul praktikum Kelas XI Kurikulum Merdeka.
- **Top Context Bar:** Badge `"Kelas XI · Kurikulum Merdeka / Semester Genap"` + tombol `← Beranda Lab` + chip info `"6 Modul Terkalibrasi"`.
- **Tab Filter Kategori:** `Semua Modul` | `Fisika` | `Biologi` | `Matematika` | `Pilihan Lainnya` (indikator garis bawah `#0E5A63` 3px).
- **Grid Kartu Modul (3 kolom desktop, 2 tablet, 1 mobile):**
  - Setiap kartu menampilkan: Ikon garis geometris `2px` dalam wadah inset `#E3DED2`, label kategori monospace (`Fisika Mekanika`, `Fisika Listrik`, `Fisiologi Manusia`, `Sitologi Seluler`, `Matematika Spasial`, `Kalkulus Lanjut`), judul modul, deskripsi ringkas 1–2 baris, parameter pratinjau (`θ = 30° · μ = 0.20`), dan tombol pill `Buka Simulasi →`.
- **Tab `Pilihan Lainnya` & Aksi Sekunder:**
  - Sesuai referensi Stitch, terdapat kartu aksi *"Unggah Gambar Materi Buku → Preview 3D"*. Agar tetap dalam batas Strict MVP (tanpa pipeline *mesh generation* berat atau backend), fitur ini bekerja secara ringan di klien: siswa dapat mengunggah gambar diagram buku cetak SMA, lalu Gemini Flash Multimodal menganalisis konsep di gambar dan **memetakan langsung ke salah satu dari 6 simulasi 3D parametrik yang paling relevan** beserta preset parameter awalnya (atau menampilkan ringkasan konsep jika di luar 6 topik).

### Tahap 3 — 3D Lab Workspace (`View: workspace`)
- **Tujuan:** Ruang utama praktikum 3D interaktif tempat siswa mengatur variabel dan mencatat data percobaan.
- **Header Kontekstual:** Breadcrumb `EDUSPACE / Pilih Materi / [Nama Modul]`, navigasi cepat tahap (`Simulasi Lab` | `Modul Materi` | `Analisis Data` | `Lembar Kerja`), tombol `Catat Data` (dengan badge counter jumlah data tersimpan), dan tombol `Reset Simulasi`.
- **Layout Desktop (12 kolom):**
  - **Kolom Kiri (4 kolom — Panel Kontrol Variabel):**
    - Judul panel *"Variabel Simulasi"* + subjudul modul.
    - 2–4 **Tactile Slider** (track cekung `#E3DED2`, fill `#0E5A63`, knob bulat `#F6F3EC`) dan/atau selector mode/toggle sesuai matriks modul.
    - Toggle Switch *"Label & Vektor 3D"* (menampilkan/menyembunyikan `CalloutPin` & `DimensionLine3D`).
    - Tombol CTA penuh `#0E5A63`: `Jalankan Simulasi` / `Putar Animasi` (atau kontrol play/pause sesuai modul).
  - **Kolom Kanan (8 kolom — Kanvas 3D Isometrik):**
    - Frame inset `#E3DED2` dengan sudut `24px`.
    - Overlay HUD minimal: Badge `"Kamera Isometrik · Skala 1:1"` + konstanta di kiri atas; `CalloutPin` nilai output real-time utama di kanan atas; tombol `Reset Sudut Pandang` di kanan bawah.
    - Kanvas React Three Fiber merender model 3D clay/matte isometrik interaktif (orbit terkendali, zoom terbatas).
- **Reflow Mobile:** Kanvas 3D berada di atas (`h-72`), diikuti panel slider variabel di bawahnya, lalu ringkasan rumus + AI Co-Pilot.

### Tahap 4 — Analisis Rumus, Grafik Respon & Dialog Penuh AI Co-Pilot (`View: analysis`)
- **Tujuan:** Membimbing siswa memahami hubungan kausalitas rumus dan grafik melalui 4 langkah terstruktur bersama AI Co-Pilot.
- **Layout Desktop (2 kolom: Kiri 45%, Kanan 55%):**
  - **Kolom Kiri (Analisis & Tracker):**
    1. **4-Step Guided Task Tracker:** Stepper horizontal 4 tahap (`1. Atur Parameter` → `2. Amati Visual 3D` → `3. Cek Grafik` → `4. Catat Data`), otomatis menandai progres siswa atau dapat diklik untuk panduan langkah aktif.
    2. **Kotak Rumus Dinamis (Inset `#E3DED2`):** Menampilkan persamaan simbolik + substitusi angka aktual dari slider saat ini + 3 chip nilai turunan.
    3. **Grafik Respon Minimalis (SVG):** Kurva respons variabel utama terhadap parameter kontrol utama (mis. $a$ vs $\theta$ untuk Bidang Miring) dengan titik koordinat aktif dan tooltip pill posisi saat ini.
  - **Kolom Kanan (Panel Penuh AI Co-Pilot):**
    - Header: Judul *"AI Co-Pilot Laboratorium"*, badge status `Aktif` / `Offline Fallback`, dan context pill dinamis yang menampilkan nilai slider terbaca (mis. `Membaca: θ = 30° · m = 5.0 kg · μ = 0.20`).
    - Area percakapan: Bubble siswa (`#0E5A63` teks putih) & bubble AI (`#E3DED2` dengan chip rumus tersemat).
    - **3 Quick-Action Pills** kontekstual per modul (contoh: *"Jelaskan Analogi Sederhana"*, *"Beri Latihan Soal Mandiri"*, *"Variasikan Nilai Parameter"*).
    - Input bar inset + tombol kirim.
- **Reflow Mobile:** Stepper & rumus/grafik berada di bagian atas, panel chat AI Co-Pilot di bawahnya.

### Tahap 5 — Lembar Kerja Praktikum Digital & Ekspor (`View: worksheet`)
- **Tujuan:** Mengumpulkan seluruh data percobaan yang dicatat siswa (`Catat Data`), menambahkan catatan pengamatan, dan mengekspor laporan di akhir sesi 45 menit.
- **Komponen Utama:**
  - **Toast Status:** `"Tersimpan: N data percobaan siap diekspor"`.
  - **Header Kartu Lembar Kerja:** Judul *"Lembar Kerja Praktikum"*, metadata mata pelajaran & modul aktif, serta 2 tombol aksi utama: `Salin Teks` (sekunder raised) dan `Unduh PDF` (primer `#0E5A63`).
  - **Tabel Observasi (Desktop) / Daftar Kartu Observasi (Mobile):**
    - Kolom: `Percobaan` (`Uji 1..N`), `Variabel Input`, `Hasil Perhitungan`, dan tombol `Hapus` per baris.
    - Fitur filter/pengelompokan per modul jika siswa mencoba lebih dari 1 modul dalam satu sesi.
  - **Strip Catatan Manual:** Tombol `+ Tambah Catatan Manual` yang membuka textarea inset `#E3DED2` untuk menuliskan kesimpulan/pengamatan siswa (tersimpan di `localStorage`).
  - **Bar Bawah Ringkasan + AI Co-Pilot:** Menampilkan rata-rata / ringkasan metrik percobaan + input AI Co-Pilot untuk membantu menyusun kesimpulan laporan berdasarkan data tabel yang tercatat.

---

## 4. Matriks 6 Modul Praktikum 3D (SMA Kelas XI — Kurikulum Merdeka)

Seluruh perhitungan dilakukan oleh modul engine deterministik murni (TypeScript) di `src/engines/` sehingga 100% akurat dan teruji.

### 4.1 Fisika 1 — Dinamika Gerak & Vektor Gaya pada Bidang Miring
- **Variabel Input (Slider & Toggle):**
  - Sudut kemiringan ($\theta$): `0° – 60°` (step `1°`, default `30°`) — *opsi tampilan kurva hingga `90°` di Tahap 4*
  - Massa balok ($m$): `1.0 – 10.0 kg` (step `0.5 kg`, default `5.0 kg`)
  - Koefisien gesek ($\mu$): `0.00 – 1.00` (step `0.05`, default `0.20`)
  - Toggle `Label & Vektor 3D`: `ON / OFF` (default `ON`)
  - Konstanta: $g = 9.80\text{ m/s}^2$
- **Rumus Eksak:**
  - $W = m \cdot g$
  - $W_x = W \sin\theta$ *(gaya penggerak sejajar bidang)*
  - $N = W \cos\theta$ *(gaya normal)*
  - $f_{\text{maks}} = \mu \cdot N$
  - Kondisi gerak:
    - Jika $\theta = 0^\circ$ atau $W_x \le f_{\text{maks}}$: $f = W_x$, $F_{\text{net}} = 0\text{ N}$, $a = 0\text{ m/s}^2$ *(Diam / Kesetimbangan Statis)*.
    - Jika $W_x > f_{\text{maks}}$: $f_k = \mu \cdot N$, $F_{\text{net}} = W_x - f_k$, $a = \frac{F_{\text{net}}}{m} = g(\sin\theta - \mu\cos\theta)$.
- **Output Visual 3D Isometrik:**
  - Prisma bidang miring clay yang kemiringannya berubah real-time sesuai $\theta$, balok massa yang dimensinya berskala proporsional terhadap $m$ dan meluncur sepanjang bidang saat `Jalankan Simulasi` ditekan.
  - Vektor gaya 3D: panah $W$ (ke bawah), $N$ (tegak lurus bidang), $W\sin\theta$ (sejajar bidang turun), $f_k$ (berlawanan arah gerak), dan garis bantu $W\cos\theta$.
  - `DimensionLine3D`: Busur sudut $\theta$ di kaki bidang & panjang lintasan $s$.
  - `CalloutPin`: Nilai $F_{\text{net}}$ (N) dan $a$ ($\text{m/s}^2$).
- **Grafik Respon (Tahap 4):** Kurva $a$ ($\text{m/s}^2$) terhadap $\theta$ (`0°–90°`) untuk nilai $\mu$ aktif.
- **4-Step Guided Task:** (1) Atur Sudut $\theta$ → (2) Amati Vektor $W\sin\theta$ & $f_k$ → (3) Cek Grafik $a(\theta)$ → (4) Catat Data ke Lembar Kerja.

### 4.2 Fisika 2 — Rangkaian Listrik Dinamis (Hukum Ohm & Seri/Paralel)
- **Variabel Input (Slider & Selector):**
  - Tegangan Sumber ($V$): `1.5 – 24.0 V` (step `0.5 V`, default `12.0 V`)
  - Hambatan 1 ($R_1$): `2 – 50 Ω` (step `1 Ω`, default `10 Ω`)
  - Hambatan 2 ($R_2$): `2 – 50 Ω` (step `1 Ω`, default `20 Ω`)
  - Konfigurasi Rangkaian: Segmented Toggle `Seri` | `Paralel` (default `Seri`)
- **Rumus Eksak:**
  - **Mode Seri:**
    - $R_{\text{tot}} = R_1 + R_2$
    - $I_{\text{tot}} = \frac{V}{R_{\text{tot}}}$
    - $I_1 = I_2 = I_{\text{tot}}$
    - $V_1 = I_{\text{tot}} \cdot R_1$, $\quad V_2 = I_{\text{tot}} \cdot R_2$
    - $P_{\text{tot}} = V \cdot I_{\text{tot}}$
  - **Mode Paralel:**
    - $R_{\text{tot}} = \frac{R_1 \cdot R_2}{R_1 + R_2}$
    - $I_{\text{tot}} = \frac{V}{R_{\text{tot}}}$
    - $V_1 = V_2 = V$
    - $I_1 = \frac{V}{R_1}$, $\quad I_2 = \frac{V}{R_2}$
    - $P_{\text{tot}} = V \cdot I_{\text{tot}}$
- **Output Visual 3D Isometrik:**
  - Papan uji rangkaian matte/clay dengan sumber tegangan DC 3D, dua resistor silinder 3D (berubah warna aksen/ukuran cincin sesuai nilai $R$), jalur konduktor seri atau bercabang paralel yang berubah otomatis saat toggle ditekan.
  - Partikel aliran arus bergerak di sepanjang loop konduktor dengan kecepatan & kerapatan proporsional terhadap $I_{\text{tot}}$ (atau $I_1, I_2$ di cabang paralel) saat simulasi dijalankan.
  - `DimensionLine3D`: Penanda jalur loop & jarak antar terminal komponen.
  - `CalloutPin`: Pin nilai $I_{\text{tot}}$ (A), $R_{\text{tot}}$ ($\Omega$), dan $V_1 / V_2$ atau $I_1 / I_2$.
- **Grafik Respon (Tahap 4):** Kurva linear Hukum Ohm $I_{\text{tot}}$ (A) terhadap $V$ (`0–24 V`) pada $R_{\text{tot}}$ aktif.
- **4-Step Guided Task:** (1) Pilih Seri/Paralel & Atur $V, R$ → (2) Amati Aliran Arus 3D → (3) Cek Grafik $I\text{-}V$ → (4) Catat Data.

### 4.3 Biologi 1 — Anatomi Tubuh Manusia (Eksplorasi Lapisan Organ 3D)
- **Variabel Input (Slider & Selector):**
  - Kedalaman / Transparansi Lapisan ($\text{Layer}$): `0% – 100%` (step `5%`, default `50%` — transisi mulus: `0–33%` Rangka Toraks/Rusuk → `34–66%` Sistem Respirasi/Paru-paru → `67–100%` Isolasi Kardiovaskular/Jantung & Aorta)
  - Detak Jantung ($HR$): `60 – 160 bpm` (step `2 bpm`, default `72 bpm`)
  - Fokus Organ: Selector `Semua` | `Jantung` | `Paru-paru` | `Pembuluh Utama`
- **Rumus Eksak Fisiologi:**
  - Volume Sekuncup standar ($SV$): $70\text{ mL/denyut}$ *(dengan penyesuaian fisiologis ringan jika diperlukan, dijaga deterministik: $SV = 70\text{ mL}$)*
  - Curah Jantung (*Cardiac Output*): $CO = \frac{HR \cdot SV}{1000}\text{ L/menit}$
  - Periode Siklus Jantung: $T = \frac{60}{HR}\text{ detik}$
  - Estimasi Laju Pernapasan (*Respiratory Rate*): $RR = 12 + 0.12 \cdot (HR - 60)\text{ napas/menit}$
- **Output Visual 3D Isometrik:**
  - Model toraks anatomis bergaya clay/matte di atas alas spesimen: sangkar rusuk yang memudar/terangkat sesuai slider lapisan, paru-paru kiri-kanan mengembang-kempis seirama $RR$, serta jantung 4 ruang + lengkung aorta yang berdenyut real-time dengan frekuensi $HR/60\text{ Hz}$ saat simulasi aktif.
  - `CalloutPin`: Penanda interaktif organ (Serambi Kanan/Kiri, Bilik Kanan/Kiri, Aorta, Trakea/Bronkus, Diafragma) beserta ringkasan fungsi.
  - `DimensionLine3D`: Indikator elevasi lapisan anatomi (anterior–posterior) & skala rongga toraks.
- **Grafik Respon (Tahap 4):** Kurva Curah Jantung $CO$ ($\text{L/menit}$) terhadap $HR$ (`60–160 bpm`) dengan titik posisi $HR$ saat ini.
- **4-Step Guided Task:** (1) Kupas Lapisan Organ → (2) Atur BPM & Amati Denyut → (3) Cek Grafik Curah Jantung → (4) Catat Data.

### 4.4 Biologi 2 — Struktur Mikroskopis Sel Darah & Sel Tumbuhan
- **Variabel Input (Slider & Selector):**
  - Jenis Spesimen: Selector `Sel Tumbuhan` | `Sel Darah (Eritrosit & Leukosit)` (default `Sel Tumbuhan`)
  - Perbesaran Mikroskop ($M$): `100× – 1000×` (step `50×`, default `400×`)
  - Pemisahan Organel (*Exploded View*): `0% – 100%` (step `5%`, default `25%`)
  - Filter Organel Aktif: `Semua` | `Nukleus` | `Kloroplas` | `Mitokondria` | `Dinding/Membran` (menyesuaikan spesimen aktif)
- **Rumus Eksak Sitologi & Mikroskopi:**
  - Diameter Bidang Pandang (*Field of View*): $FOV = \frac{FN}{M} \times 1000\text{ }\mu\text{m}$ *(dengan Field Number standar okuler $FN = 20\text{ mm}$, sehingga pada $400\times \rightarrow FOV = 50\text{ }\mu\text{m}$)*
  - Ukuran Tampak Referensi Sel ($D_{\text{tampak}} = D_{\text{asli}} \times M$): Sel Tumbuhan $D_{\text{asli}} = 50\text{ }\mu\text{m}$, Eritrosit $D_{\text{asli}} = 7.5\text{ }\mu\text{m}$
  - Rasio Luas Permukaan terhadap Volume bola pendekatan ($SA/V = \frac{3}{r}$, dengan $r = D_{\text{asli}}/2$ dalam $\mu\text{m}^{-1}$) sebagai indikator efisiensi difusi sel.
- **Output Visual 3D Isometrik:**
  - Preparat kaca/piringan mikroskop matte di tengah stage.
  - **Sel Tumbuhan:** Dinding sel prisma heksagonal berpotongan (*cutaway*), membran plasma, vakuola sentral, nukleus berinti anak, mitokondria, dan kloroplas berkeping tilakoid yang terangkat terpisah secara *exploded* sesuai slider.
  - **Sel Darah:** Kumpulan eritrosit bikonkaf cekung ganda & leukosit berlobus dengan penampang irisan.
  - Skala visual kamera/zoom merespons halus terhadap nilai Perbesaran ($M$).
  - `CalloutPin`: Label organel terpilih beserta ukuran mikroskopis ($\mu\text{m}$) dan fungsinya.
  - `DimensionLine3D`: Penggaris kalibrasi mikrometer ($\mu\text{m}$) di tepi preparat yang panjang labelnya menyesuaikan $FOV$.
- **Grafik Respon (Tahap 4):** Kurva hiperbolik Diameter Bidang Pandang $FOV$ ($\mu\text{m}$) terhadap Perbesaran $M$ (`100×–1000×`).
- **4-Step Guided Task:** (1) Pilih Spesimen & Perbesaran → (2) Pisahkan Organel (Exploded) → (3) Cek Grafik FOV → (4) Catat Data.

### 4.5 Matematika 1 — Geometri Ruang Dimensi Tiga (Proyeksi Titik, Garis, Bidang 3D)
- **Variabel Input (Slider & Selector):**
  - Panjang Rusuk Kubus ($s$): `2 – 12 cm` (step `1 cm`, default `6 cm`)
  - Posisi Titik Uji ($t$): `0.00 – 1.00` (step `0.05`, default `0.50` — menggeser titik $P$ sepanjang rusuk/diagonal acuan, mis. $P$ pada rusuk $CG$ atau bidang alas)
  - Mode Kasus Proyeksi: Selector `Titik ke Garis (P ke BD)` | `Titik ke Bidang (E ke BDG)` | `Sudut Garis-Bidang (EC dengan BDG)`
- **Rumus Eksak Geometri Analitik $\mathbb{R}^3$:**
  - Diagonal sisi: $d_{\text{sisi}} = s\sqrt{2}$
  - Diagonal ruang: $d_{\text{ruang}} = s\sqrt{3}$
  - Koordinat Kubus $ABCD.EFGH$ dengan $A(0,0,0)$ dan sisi $s$:
    - **Kasus 1 (`P` di rusuk `CG` pada rasio $t$, proyeksi ke garis `BD`):** $P = (s, s, t\cdot s)$, titik tengah $BD$ adalah $O = (s/2, s/2, 0)$, jarak tegak lurus $d(P, BD) = \sqrt{\left(\frac{s}{\sqrt{2}}\right)^2 + (t\cdot s)^2} = s\sqrt{\frac{1}{2} + t^2}$.
    - **Kasus 2 (`P` bergerak sepanjang `AE` pada rasio $t$, jarak ke bidang `BDG`):** Persamaan bidang $BDG$: $x + y + z - 2s = 0$ *(verifikasi: $B(s,0,0)$? Tunggu — jika $A(0,0,0), B(s,0,0), D(0,s,0), G(s,s,s)$? Mari periksa: $B(s,0,0)$ -> $s+0+0-2s \ne 0$! Untuk $B(s,0,0), D(0,s,0), G(s,s,s)$: vektor $\vec{BD}=(-s,s,0)$, $\vec{BG}=(0,s,s)$, normal $\vec{n} = \vec{BD}\times\vec{BG} = (s^2, s^2, -s^2) \propto (1, 1, -1)$ -> persamaan bidang $BDG$ adalah $x + y - z = s$. Cek: $B(s,0,0): s+0-0=s$; $D(0,s,0): 0+s-0=s$; $G(s,s,s): s+s-s=s$! Benar sekali!)*  
      Sehingga jarak titik $P(0, 0, t\cdot s)$ ke bidang $BDG$ ($x+y-z-s=0$) adalah:
      $d(P, BDG) = \frac{|0 + 0 - t\cdot s - s|}{\sqrt{1^2 + 1^2 + (-1)^2}} = \frac{s(1 + t)}{\sqrt{3}}$ *(pada $t=1$, yakni titik $E(0,0,s)$, jarak ke $BDG$ tepat $\frac{2}{3}s\sqrt{3}$, dan pada $t=0$ yakni titik $A(0,0,0)$, jarak ke $BDG$ tepat $\frac{1}{3}s\sqrt{3}$!)*.
    - **Kasus 3 (Sudut antara garis dari $E(0,0,s)$ ke titik $Q(s, s, t\cdot s)$ terhadap bidang alas $ABCD$ / atau bidang $BDG$):** $\sin\alpha = \frac{|\vec{u}\cdot\vec{n}|}{\|\vec{u}\|\|\vec{n}\|}$, memberikan sudut $\alpha$ dalam derajat secara eksak.
- **Output Visual 3D Isometrik:**
  - Kubus $ABCD.EFGH$ berbingkai wireframe presisi dengan label titik sudut $A..H$, bidang irisan $BDG$ semi-transparan berwarna `#0E5A63`, titik $P$ bergerak real-time sesuai $t$, garis proyeksi tegak lurus putus-putus ke titik proyeksi $P'$, dan penanda siku-siku 3D di $P'$.
  - `DimensionLine3D`: Panjang rusuk $s$ dan garis jarak proyeksi $d$.
  - `CalloutPin`: Koordinat $P(x,y,z)$, koordinat proyeksi $P'$, dan nilai jarak eksak (bentuk akar & desimal `cm`).
- **Grafik Respon (Tahap 4):** Kurva jarak proyeksi $d$ (cm) terhadap rasio posisi $t \in [0, 1]$ untuk rusuk $s$ aktif.
- **4-Step Guided Task:** (1) Pilih Kasus & Atur Rusuk $s$ → (2) Geser Titik $P(t)$ & Amati Proyeksi 3D → (3) Cek Grafik Jarak → (4) Catat Data.

### 4.6 Matematika 2 — Integral Tentu (Volume Benda Putar & Pias Riemann 3D)
- **Variabel Input (Slider & Selector):**
  - Kurva Fungsi $f(x)$: Selector `f(x) = √x` | `f(x) = 0.5x + 1` | `f(x) = -0.2x² + 3` (default `f(x) = √x`)
  - Jumlah Partisi ($n$): `2 – 40` (step `1`, default `8`)
  - Batas Bawah ($a$): `0.0 – 2.0` (step `0.5`, default `0.0`)
  - Batas Atas ($b$): `2.5 – 6.0` (step `0.5`, default `4.0`) — *validasi otomatis $b \ge a + 0.5$*
  - Mode Visual: Segmented Toggle `Pias Riemann (Luas)` | `Benda Putar Cakram (Volume)` (default `Benda Putar Cakram`)
- **Rumus Eksak Kalkulus Integral:**
  - Lebar partisi: $\Delta x = \frac{b - a}{n}$
  - Titik sampel tengah (*Midpoint Rule*): $x_i^* = a + \left(i - \frac{1}{2}\right)\Delta x$, untuk $i = 1, \dots, n$
  - **Mode Luas Riemann:**
    - $L_{\text{approx}} = \sum_{i=1}^{n} f(x_i^*)\,\Delta x$
    - $L_{\text{eksak}} = \int_{a}^{b} f(x)\,dx$ *(analitik eksak untuk tiap fungsi pilihan)*
  - **Mode Volume Benda Putar (Sumbu-X):**
    - $V_{\text{approx}} = \pi \sum_{i=1}^{n} \left[f(x_i^*)\right]^2 \Delta x$
    - $V_{\text{eksak}} = \pi \int_{a}^{b} \left[f(x)\right]^2 dx$ *(analitik eksak untuk tiap fungsi pilihan)*
  - Galat Relatif: $\varepsilon = \frac{|\text{Eksak} - \text{Approx}|}{\text{Eksak}} \times 100\%$
- **Output Visual 3D Isometrik:**
  - Sumbu kartesius 3D ($X, Y, Z$) dengan kurva $y = f(x)$ serta selubung benda putar transparan sebagai referensi eksak.
  - $n$ buah cakram silinder 3D (pada mode Volume) atau balok pias 3D (pada mode Luas) berbahan matte teal/cream yang jumlah & ketebalannya ($\Delta x$) berubah seketika saat $n, a, b$ digeser, lengkap dengan animasi putar $360^\circ$ pembentuk benda putar saat `Jalankan Simulasi` ditekan.
  - `DimensionLine3D`: Lebar $\Delta x$ pada salah satu pias dan rentang batas $[a, b]$ di sumbu-$X$.
  - `CalloutPin`: Nilai $V_{\text{approx}}$ (atau $L_{\text{approx}}$), Nilai Eksak, dan Galat $\varepsilon$ (%).
- **Grafik Respon (Tahap 4):** Kurva Konvergensi Pendekatan vs Jumlah Partisi $n$ (`2–40`) lengkap dengan garis horizontal asimtot Nilai Eksak.
- **4-Step Guided Task:** (1) Pilih Kurva & Batas $[a, b]$ → (2) Naikkan Partisi $n$ & Amati Cakram 3D → (3) Cek Grafik Konvergensi → (4) Catat Data.

---

## 5. Arsitektur Teknis & AI Co-Pilot

### 5.1 Tech Stack
- **Framework UI:** React 18+ & TypeScript + Vite
- **Styling:** Tailwind CSS (dikonfigurasi dengan design tokens 3 warna *Tactile Lab* + Google Fonts `Plus Jakarta Sans` & `JetBrains Mono` + `Material Symbols Outlined` atau `lucide-react` ikon 2px)
- **3D Rendering:** Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei` (`OrthographicCamera` / `OrbitControls`, `Html`, `Line`, `Text`)
- **AI SDK:** `@google/genai` (Current SDK Google Gemini) dengan model **`gemini-flash-latest`** (dapat dikonfigurasi via `VITE_GEMINI_MODEL`)
- **State & Storage:** React Context + Custom Hooks + `localStorage` (namespace `eduspace_v1_*`)

### 5.2 Struktur Direktori Target (Untuk Fase Implementasi Setelah Persetujuan)
```text
src/
├── main.tsx
├── App.tsx
├── index.css                    # Tactile Neumorphism utilities & @media print PDF layout
├── types/
│   └── lab.ts                   # Tipe modul, parameter, log percobaan, chat, task step
├── data/
│   └── modules.ts               # Metadata 6 modul SMA Kelas XI & quick-action prompts
├── engines/
│   ├── physicsInclined.ts       # Engine rumus Bidang Miring
│   ├── physicsCircuit.ts        # Engine rumus Rangkaian Listrik
│   ├── biologyAnatomy.ts        # Engine fisiologi Kardiovaskular & Respirasi
│   ├── biologyCell.ts           # Engine sitologi & skala mikroskop
│   ├── mathGeometry3d.ts        # Engine geometri analitik R³
│   └── mathIntegral3d.ts        # Engine pias Riemann & volume benda putar
├── services/
│   ├── geminiCopilot.ts         # Integrasi @google/genai + context injection + fallback lokal
│   ├── storage.ts               # Wrapper localStorage (percobaan, catatan, API key sesi)
│   └── exportReport.ts          # Ekspor Salin Teks, unduh .txt, dan trigger Cetak/PDF A4
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── PersistentBottomBar.tsx
│   ├── ui/
│   │   ├── TactileSlider.tsx
│   │   ├── TactileToggle.tsx
│   │   ├── TactileCard.tsx
│   │   └── ResponseChartSvg.tsx # Komponen grafik SVG responsif untuk Tahap 4
│   └── three/
│       ├── IsometricStage.tsx   # Canvas R3F, pencahayaan clay 135°, OrbitControls, Reset Cam
│       ├── CalloutPin.tsx       # Label anotasi 3D mengambang takti
│       ├── DimensionLine3D.tsx  # Garis ukur & busur dimensi 3D
│       └── scenes/              # 6 scene 3D isometrik per modul + scene preview landing
└── pages/
    ├── LandingPage.tsx          # Tahap 1
    ├── CatalogPage.tsx          # Tahap 2 (+ Tab Pilihan Lainnya)
    ├── LabWorkspacePage.tsx     # Tahap 3
    ├── AnalysisCopilotPage.tsx  # Tahap 4
    └── WorksheetPage.tsx        # Tahap 5
```

### 5.3 Spesifikasi Kanvas 3D Isometrik
- **Kamera:** `OrthographicCamera` (atau `PerspectiveCamera` FOV sempit `28°`) di posisi sudut isometrik standar `[8, 7, 8]` menghadap `[0, 0, 0]`, dengan `OrbitControls` yang membatasi *polarAngle* (`0.2` – `Math.PI / 2.05`) agar panggung tidak terbalik dan tombol `Reset Sudut Pandang` mengembalikan orientasi kamera secara halus.
- **Material & Pencahayaan (Matte / Clay):**
  - Material objek menggunakan `MeshStandardMaterial` dengan `roughness: 0.80`, `metalness: 0.04` dalam nuansa Warm Cream, Charcoal, dan Deep Teal agar menyatu mulus dengan UI Neumorphism.
  - Pencahayaan: `ambientLight` lembut + `directionalLight` utama dari arah kiri-atas (`[-6, 10, 6]`, selaras 135° dengan bayangan CSS) + bayangan kontak lembut di lantai stage.
- **Anotasi Spasial:** `CalloutPin` dan `DimensionLine3D` terhubung langsung ke state React slider dan otomatis tersembunyi/tampil mengikuti toggle `Label & Vektor 3D`.

### 5.4 Arsitektur AI Co-Pilot (Google Gemini Flash)
- **SDK & Model:** Menggunakan `@google/genai`:
  ```ts
  const ai = new GoogleGenAI({ apiKey });
  // model: 'gemini-flash-latest'
  ```
- **Context Injection Otomatis:** Setiap permintaan ke Gemini Flash membungkus prompt siswa dengan *system instruction* + blok konteks JSON/terstruktur:
  - `mata_pelajaran` & `modul_aktif` (Kurikulum Merdeka SMA Kelas XI)
  - `parameter_slider_saat_ini` (nama variabel, nilai, satuan)
  - `hasil_perhitungan_eksak` (seluruh output rumus saat ini)
  - `langkah_guided_task` (`1..4` yang sedang aktif)
  - `jumlah_data_tercatat` di Lembar Kerja
- **Perilaku Pedagogis AI:**
  1. Menjelaskan hubungan **sebab-akibat (kausalitas)** berdasarkan angka nyata yang sedang dilihat siswa (bukan jawaban generik).
  2. Memandu penyelesaian **4-Step Guided Task** tahap demi tahap tanpa langsung memberikan jawaban mentah untuk pertanyaan latihan.
  3. Memformat rumus ringkas dengan simbol jelas agar bisa dirender dalam formula pill di bubble chat.
- **Penanganan Kunci API & Mode Fallback (Sesi Kelas 45 Menit):**
  - API key dibaca dari `import.meta.env.VITE_GEMINI_API_KEY` atau (jika kosong) dari pengaturan sesi lokal ringan (`localStorage`) melalui popover input key opsional tanpa akun/login.
  - Jika API key belum tersedia atau koneksi internet kelas terputus, AI Co-Pilot beralih mulus ke **Mode Fallback Deterministik Lokal** (menggunakan template kausal berbasis output engine rumus saat ini + panduan 4-step) serta menampilkan status jelas `"Mode Offline"` agar praktikum 45 menit tetap berjalan tanpa hambatan.

---

## 6. Spesifikasi Lembar Kerja & Ekspor Laporan (Browser-Only)

### 6.1 Siklus Pencatatan Data
1. Di Tahap 3 (atau Tahap 4), siswa menekan tombol **`Catat Data`**.
2. Snapshot berisi: `{ id, moduleId, moduleTitle, subject, timestamp, inputs, outputs, formulaText }` ditambahkan ke state dan disimpan ke `localStorage`.
3. Counter pada header dan toast di Tahap 5 diperbarui seketika.
4. Siswa dapat menghapus baris percobaan tertentu dan menambahkan **Catatan Pengamatan Manual** (textarea).

### 6.2 Mekanisme Ekspor di Browser
1. **Salin Teks (`Salin Teks`):**
   - Menyusun ringkasan terstruktur (Judul Modul, Tanggal/Waktu Sesi, Daftar Uji 1..N berisi Variabel Input & Hasil Perhitungan, Rata-rata/Ringkasan, serta Catatan Manual Siswa) dan menyalin ke clipboard via `navigator.clipboard.writeText()`.
   - Memberikan umpan balik visual tombol `"Tersalin!"` selama 2 detik (dan menyediakan fallback unduh `.txt` jika izin clipboard dibatasi browser).
2. **Unduh PDF (`Unduh PDF`):**
   - Menggunakan **Dedicated Print-to-PDF Stylesheet (`@media print`)** yang dioptimalkan untuk kertas **A4 Portrait**:
     - Menyembunyikan seluruh chrome navigasi, tombol interaktif, dan bayangan neumorphic berat.
     - Merender dokumen bersih bertipografi `Plus Jakarta Sans` + `JetBrains Mono` (sehingga simbol matematika `θ, μ, Ω, √, ∫, ∑, m/s²` tercetak tajam sempurna sebagai teks vektor, bebas masalah encoding font PDF).
     - Memicu `window.print()` dengan instruksi singkat agar siswa memilih *"Save as PDF / Simpan sebagai PDF"*.

---

## 7. Kriteria Keberhasilan MVP (Acceptance Criteria)
1. Aplikasi memuat cepat (< 2 detik di jaringan sekolah standar) tanpa layar login dan siap digunakan dalam sesi praktikum 45 menit.
2. Tepat 3 palet warna (`#EFECE4`/`#F6F3EC`/`#E3DED2`, `#23272A`/`#5C6064`, `#0E5A63`) diterapkan konsisten di semua 5 tahap baik desktop maupun mobile.
3. Seluruh 6 modul SMA Kelas XI memiliki perhitungan rumus 100% akurat sesuai hukum fisika/biologi/matematika dan terhubung real-time ke model 3D isometrik, `CalloutPin`, `DimensionLine3D`, dan grafik respon SVG.
4. AI Co-Pilot Gemini Flash membaca nilai slider aktual melalui *context injection* dan tetap berfungsi dengan fallback lokal jika tanpa API key/jaringan.
5. Siswa dapat mencatat percobaan, mengedit catatan manual, menyalin teks, dan mencetak/menyimpan Lembar Kerja ke PDF di browser tanpa kehilangan data saat refresh (`localStorage`).
