# Rangkuman Lengkap Fitur Web 3D — EDUSPACE Virtual Lab

**EDUSPACE** (*Laboratorium Sains dan Matematika 3D Model*) adalah aplikasi web laboratorium virtual interaktif berbasis 3D untuk jenjang **Sekolah Menengah Atas (Kurikulum Merdeka)** yang mencakup mata pelajaran **Fisika**, **Biologi**, dan **Matematika**. Aplikasi ini memadukan kanvas 3D isometrik real-time, mesin kalkulasi deterministik, grafik SVG animasi, rendering rumus matematika KaTeX, Asisten Cerdas berbasis Gemini AI (beserta fallback lokal offline), serta Lembar Kerja siswa yang dapat diekspor ke teks maupun PDF.

---

## 1. Gambaran Umum & Alur Pengalaman Pengguna (5 Tahap)

Aplikasi disusun dalam **5 tahap alur belajar** (`ViewStage`) yang terhubung melalui navigasi header kontekstual dan panel bawah adaptif:

1. **Tahap 1 — Beranda Lab (`landing`)**
   - Menampilkan identitas kurikulum (*Jenjang Sekolah Menengah Atas · Kurikulum Merdeka*), tipografi utama adaptif (*fluid title*), dan tombol CTA **Mulai Belajar** / **Masuk Lab**.
   - **Showcase Apparatus 3D Interaktif**: Panel pratinjau 3D langsung dengan pemilih 3 bidang studi (**Fisika 3D**, **Biologi 3D**, dan **Matematika 3D**) yang merender adegan 3D nyata (*Bidang Miring*, *Sel Tumbuhan*, dan *Transformasi Geometri*) lengkap dengan orbit kamera dan tautan pintas langsung masuk ke modul terkait.
2. **Tahap 2 — Katalog Pemilihan Modul (`catalog`)**
   - Menampilkan seluruh **5 modul praktikum 3D terkalibrasi** dalam tata letak grid kartu taktil.
   - **Filter Kategori Mata Pelajaran**: *Semua Modul*, *Fisika*, *Biologi*, dan *Matematika*.
   - Setiap kartu menampilkan ikon subjek, label kategori, judul modul, deskripsi, ringkasan parameter pratinjau (`previewBadge`), dan tombol **Buka Simulasi**.
3. **Tahap 3 — Ruang Simulasi 3D (`workspace`)**
   - Tata letak 2 kolom responsif: **Panel Kontrol Variabel / Eksplorasi 3D** (4 kolom desktop) dan **Kanvas 3D Isometrik** (8 kolom desktop).
   - **Overlay Kanvas**: Indikator *Kamera Isometrik · Skala 1:1*, badge konstanta/hukum modul, *callout readout* nilai aktif real-time, atribusi lisensi model 3D (khusus modul Biologi), serta tombol **Reset Sudut Pandang**.
   - **Kontrol Umum Workspace**: Toggle visibilitas **Label & Vektor 3D / CalloutPin** dan tombol **Jalankan / Hentikan Simulasi** (atau ritme detak/napas & efek cahaya/metabolisme).
   - **Panel Bawah Kontekstual**: Setiap modul memiliki panel ringkasan rumus/penjelasan real-time khusus di bawah kanvas (`InclinedBottomPanel`, `CircuitBottomPanel`, `AnatomyBottomPanel`, `PlantCellBottomPanel`, `GeometryBottomPanel`).
4. **Tahap 4 — Analisis, Rumus, Grafik & Asisten Cerdas (`analysis`)**
   - Dilengkapi **4-Step Guided Task Tracker** interaktif (*Langkah 1–4*) untuk memandu alur praktikum siswa pada setiap modul.
   - Menampilkan tampilan analisis khusus tiap modul: penjabaran kalkulasi langkah demi langkah dengan **KaTeX**, grafik kurva animasi SVG (untuk Fisika), alur fisiologis adaptif (untuk Anatomi), perbandingan terang vs gelap (untuk Sel Tumbuhan), atau matriks 2×2 & teorema lingkaran (untuk Matematika), berdampingan dengan panel dialog penuh **Asisten Cerdas Laboratorium**.
5. **Tahap 5 — Lembar Kerja & Laporan Hasil Praktikum (`worksheet`)**
   - Mencatat hasil percobaan dan eksplorasi 3D secara **real-time & terisolasi per modul**.
   - Menyediakan **Pemilih Hasil Eksplorasi 3D**, **Tabel Observasi** (desktop & kartu stacked di mobile), **Rangkuman Otomatis Real-Time**, **Catatan Pengamatan Manual**, serta ekspor laporan (**Salin Teks**, **Unduh `.txt`**, dan **Unduh PDF**).

---

## 2. Rincian Lengkap 5 Modul Praktikum 3D

### Modul 1: Fisika Mekanika — Bidang Miring & Vektor Gaya (`physics-inclined`)
- **Objek Simulasi 3D (`objectType`)**:
  - **Peti Barang (`CargoCrate3D`)**: Ukuran peti menyesuaikan massa benda.
  - **Mobil & Bukit (`HillCar3D`)**: Model mobil 3D dengan keempat roda yang berputar sebanding dengan jarak tempuh di atas lingkungan lereng perbukitan prosedural (`InclinedWorldEnvironment`: perbukitan, pepohonan, tekstur aspal/kerikil yang kepadatannya menyesuaikan koefisien gesek μ).
- **Variabel Kontrol**:
  - **Sudut Kemiringan (`θ`)**: `0°` – `60°` (step `1°`), tersinkronisasi dua arah dengan tinggi `h`.
  - **Tinggi Bidang / Bukit (`h`)**: `0.00` – `5.20 m` (berdasarkan `h = L·sin θ` dengan panjang lintasan default `L = 6.0 m`).
  - **Massa Benda (`m`)**: `1.0` – `10.0 kg` (step `0.5 kg`), tersinkronisasi dua arah dengan gaya berat `W`.
  - **Gaya Berat (`W`)**: `9.8` – `98.0 N` (`W = m·g`, dengan `g = 9.80 m/s²`).
  - **Koefisien Gesek (`μ`)**: `0.00` (Licin) – `1.00` (Kasar) (step `0.05`).
- **Visualisasi 3D**:
  - Prisma bidang miring dinamis mengikuti sudut `θ` dan busur sudut `θ` di kaki lereng.
  - Animasi luncuran objek saat simulasi dijalankan (`isSimRunning`), partikel debu gesekan (`FrictionParticles3D`), serta efek getaran halus pada permukaan kasar (`μ > 0.25`).
  - Panah vektor gaya (`VectorArrow3D`) + `CalloutPin` untuk **Berat (`W`)**, **Gaya Normal (`N`)**, **Gaya Dorong (`W·sin θ`)**, dan **Gaya Gesek (`f_s` / `f_k`)**, plus garis dimensi tinggi `h` dan panjang `L` (`DimensionLine3D`).
- **Analisis & Grafik (`InclinedAnalysisView` & `AnimatedPhysicsChartSvg`)**:
  - Penjabaran kalkulasi 4 langkah dengan KaTeX, penjelasan kondisi **Diam (Statis)** vs **Meluncur (GLBB)**, sudut kritis `θ_c = arctan(μ)`, laju di dasar `v`, dan daftar **6 rumus acuan**.
  - **3 Variasi Grafik SVG Animasi** dengan garis *scanner* bergerak & tombol Play/Pause:
    1. Percepatan `a` terhadap Sudut `θ` (`a-theta`) dengan garis batas sudut kritis.
    2. Gaya Penggerak `W·sin θ` vs Gaya Gesek `f` terhadap `θ` (`forces-theta`).
    3. Percepatan `a` terhadap Koefisien Gesek `μ` (`a-mu`).

---

### Modul 2: Fisika Listrik Dinamis — Rangkaian Listrik Dinamis (`physics-circuit`)
- **Topologi Rangkaian (`mode`)**:
  - **Seri (`seri`)**: Loop tunggal `R₁` dan `R₂` (ditambah lampu jika aktif).
  - **Paralel (`paralel`)**: Percabangan simpul node dengan `R₁` dan `R₂` sejajar.
  - **Campuran (`campuran`)**: `R₁` dirangkai seri terhadap cabang paralel `R₂ ∥ R₃`.
- **Variabel Kontrol**:
  - **Tegangan Sumber (`V`)**: `1.5` – `24.0 V` (step `0.5 V`).
  - **Hambatan `R₁`, `R₂`, dan `R₃` (mode campuran)**: `2` – `50 Ω` (step `1 Ω`).
  - **Saklar Interaktif (`hasSwitch` & `switchClosed`)**: Dapat dipasang/dilepas dan diubah **Tertutup (ON)** atau **Terbuka (OFF)**, baik dari panel maupun dengan **mengklik langsung model Saklar Pisau 3D (`KnifeSwitch3D`)** di kanvas.
  - **Lampu Beban (`hasLamp`, `lampType`, `lampPlacement`)**: Opsional, dengan 3 pilihan jenis lampu (**LED 5 Ω**, **Pijar 10 Ω**, **Filamen/Halogen 20 Ω**) dan opsi penempatan di **Jalur Utama** atau **Cabang `R₂`** (pada mode Paralel/Campuran).
- **Visualisasi 3D**:
  - Papan uji praktikum matte dengan grid, terminal pos konduktor, baterai DC (`BatteryPack3D`), resistor berkode warna (`Resistor3D`), saklar 3D interaktif, dan lampu 3D (`LabLamp3D`) yang intensitas nyalanya berubah sesuai daya lampu (`lampBrightness`) atau padam saat saklar OFF.
  - **14 Partikel Aliran Muatan Listrik** yang bergerak menyusuri lintasan tiap cabang dengan kecepatan proporsional terhadap kuat arus (`I₁`, `I₂`, `I₃`), serta berhenti jika saklar OFF.
  - `CalloutPin` nilai tegangan/arus pada sumber, tiap resistor, saklar, lampu, dan `DimensionLine3D` untuk `I_tot` & `R_tot`.
- **Analisis & Grafik (`CircuitAnalysisView` & `AnimatedCircuitChartSvg`)**:
  - Penjabaran kalkulasi 4 langkah, bukti numerik real-time **Hukum Ohm (`V = I·R`)**, **Hukum I Kirchhoff (`ΣI_masuk = ΣI_keluar`)**, dan **Hukum II Kirchhoff (`Σε − ΣIR = 0`)**.
  - Tab **Keterangan Rumus per Susunan Rangkaian** (*Seri*, *Paralel*, *Campuran*) lengkap dengan penjelasan simbol (`V`, `I`, `R`, `P`).
  - **3 Variasi Grafik SVG Animasi** (`i-v`, `i-r`, dan perbandingan arus/tegangan cabang) dengan scanner interaktif.

---

### Modul 3: Biologi — Anatomi Organ Kardiorespirasi (`biology-anatomy`)
- **Model 3D Realistis (`.glb`)**:
  - **Toraks Terpadu (`/models/anatomi_kardiorespirasi.glb`)** dengan 12 node GLB terpisah untuk bagian utuh, depan, dan dalam dari Jantung, Paru Kanan, Paru Kiri, dan Aorta.
  - **Model Detail Khusus per Fokus Organ**:
    - **Jantung (`/models/heart.glb` — `HeartDetailModel`)**: Model jantung berdenyut realistis dengan pin interaktif ruang & katup.
    - **Paru-paru Normal (`/models/lungs-normal.glb`) & Transparan (`/models/lungs-transparent.glb` — `LungsDetailModel`)**: Pada mode Transparan dapat mengamati dan mengklik struktur dalam seperti *Trakea*, *Bronkus Kanan/Kiri*, *Laring*, *Epiglotis*, dan *Pita Suara*.
    - **Aorta (`/models/aorta.glb` — `AortaDetailModel`)**: Detail lengkung aorta, percabangan arteri kepala-lengan, serta zona penyempitan lumen (**Koarktasio Aorta**).
- **Kontrol Eksplorasi 3D**:
  - **Fokus Organ (`focusOrgan`)**: *Semua*, *Jantung*, *Paru-paru*, *Aorta*.
  - **Mode Inspeksi 3D (`inspectionMode`)** (saat fokus *Semua*):
    - **Utuh**: Tampilan anatomi toraks normal.
    - **Pisahkan**: Memisahkan posisi Jantung, Paru Kanan, Paru Kiri, dan Aorta dengan animasi lerp halus; tersedia tombol **Pisah Semua**, **Satukan**, atau klik langsung organ di kanvas 3D.
    - **Belah Organ**: Membuka penampang dalam (cutaway) untuk menginspeksi *Serambi Kanan*, *Bilik Kanan*, *Serambi Kiri*, *Bilik Kiri*, *Katup & Sekat*, *Bronkus Kanan*, *Bronkus & Alveolus*, dan *Lumen Aorta*.
  - **Tampilan Paru-paru (`lungVariant`)**: *Normal* vs *Transparan*.
  - **Animasi Ritme Fisiologis**: Tombol **Putar Ritme Detak & Napas** menganimasikan denyut jantung (~72 bpm) dan kembang-kempis paru (~14 napas/menit).
- **Analisis & Panel Bawah (`AnatomyAnalysisPanel` & `AnatomyBottomPanel`)**:
  - Penjelasan struktur aktif (nama Indonesia, nama Latin, letak anatomis, ringkasan fungsi, dan mekanisme fisiologis).
  - **Alur Fisiologis Adaptif** bertahap (Sirkulasi Ganda / 4 Ruang Jantung / Saluran Napas & Difusi Alveolus / Distribusi Aorta & Koarktasio) dengan tombol *Lihat Alur Keseluruhan*.
  - **Referensi Fisiologis Normal**: Denyut jantung (`60–100 bpm`), laju respirasi (`12–16 napas/menit`), volume sekuncup (`±70 mL/denyut`), dan curah jantung (`±5,04 L/menit`).

---

### Modul 4: Biologi — Struktur & Organel Sel Tumbuhan (`biology-cell`)
- **Model 3D Realistis (`.gltf`)**:
  - Menggunakan model `/models/plant_cell_-_cell_structure/scene.gltf` yang dinormalisasi ukurannya pada alas kaca preparat 3D.
- **13 Organel + Tampilan Utuh (`focusOrganelle`)**:
  - *Semua Bagian* serta 13 struktur spesifik: **Nukleus**, **Kloroplas**, **Vakuola Sentral**, **Mitokondria**, **RE Kasar**, **RE Halus**, **Badan Golgi**, **Ribosom**, **Lisosom**, **Peroksisom**, **Plasmodesmata**, **Dinding & Membran Sel**, dan **Sitoplasma**.
- **Fitur Interaksi 3D & Auto-Zoom**:
  - Mengklik nama organel di panel kontrol, tombol pintas panel bawah, atau **mengklik langsung mesh organel pada model 3D** akan memicu **Auto-Zoom kamera** halus ke pusat geometri organel tersebut dengan `zoomMultiplier` terkalibrasi.
  - Saat fokus pada organel bagian dalam (*isInnerStructure*), lapisan pelindung luar (*Dinding Sel* & *Sitoplasma*) otomatis menjadi semi-transparan (`opacity: 0.22`) dan organel target disorot dengan efek *emissive* teal agar mudah diamati.
- **Simulasi Kondisi Pencahayaan (`lightCondition`: `terang` vs `gelap`)**:
  - **Terkena Cahaya (`terang`)**: Pencahayaan cerah, kerucut sinar cahaya + animasi partikel foton bergerak menuju Kloroplas, serta Kloroplas menyala hijau aktif (menunjukkan reaksi terang & Siklus Calvin).
  - **Tanpa Cahaya / Gelap (`gelap`)**: Pencahayaan kanvas meredup, Kloroplas non-aktif, dan Mitokondria disorot jingga hangat sebagai pusat produksi ATP melalui respirasi seluler.
- **Analisis Kualitatif (`PlantCellAnalysisView`)**:
  - Disajikan secara murni kualitatif (tanpa grafik maupun rumus matematika yang tidak relevan), menampilkan letak & ultrastruktur, fungsi biologis utama, perbandingan respons organel saat Terang vs Gelap, serta dampak kondisi cahaya pada sel secara keseluruhan.

---

### Modul 5: Matematika — Transformasi Geometri & Lingkaran (`math-geometry3d`)
Terbagi menjadi **2 Sub-Mode Materi (`subMode`)** pada papan koordinat Kartesius/Isometrik 3D:

1. **Sub-Mode Transformasi Geometri (`transformasi`)**:
   - Memvisualisasikan bangun segitiga awal `ABC` (warna krem-abu) dan bayangan hasil transformasi `A'B'C'` (warna teal `#0E5A63`) di atas papan Kartesius 3D bergrid (`-8` s.d. `8`) lengkap dengan garis penghubung titik `A → A'`, garis sumbu cermin (saat refleksi), dan busur sudut putar (saat rotasi).
   - **4 Jenis Transformasi (`transformType`)**:
     - **Translasi**: Atur pergeseran `a` (`tx`: `-5` s.d. `5`) dan `b` (`ty`: `-5` s.d. `5`).
     - **Refleksi**: Pilih sumbu/garis cermin (`Sumbu X`, `Sumbu Y`, `y = x`, `y = -x`).
     - **Rotasi (Pusat O)**: Atur sudut putar `α` (`-180°` s.d. `180°`, step `15°`).
     - **Dilatasi (Pusat O)**: Atur faktor skala `k` (`0.50` s.d. `2.50`, step `0.25`).
   - **Pengaturan Titik Awal A (`pointAx`, `pointAy`)**: `-3` s.d. `3` (step `0.5`).
   - **Analisis Matriks 2×2**: Menampilkan matriks transformasi `2×2`, nilai mutlak determinan `|det(M)|`, sifat kekongruenan/kesebangunan, dan pembuktian luas bayangan `L' = |det(M)| × L_awal`.

2. **Sub-Mode Lingkaran (`lingkaran`)**:
   - Memvisualisasikan cakram lingkaran 3D interaktif dengan jari-jari `r` (`2.0` – `6.0 cm`) dan sudut pusat juring `θ` (`30°` – `300°`).
   - **Toggle Unsur Interaktif**:
     - **Garis Singgung Lingkaran (`showTangent`)**: Menampilkan garis singgung `PT`, jari-jari `OT`, garis bantu `OP`, penanda sudut siku-siku `90°` di titik singgung `T`, dan slider jarak titik luar `OP` untuk menghitung `PT = √(OP² − r²)`.
     - **Tali Busur & Sudut Keliling (`showChord`)**: Menampilkan tali busur `AB`, titik keliling `C`, serta pembuktian visual sudut keliling `α = θ / 2`.
   - Menghitung otomatis **Panjang Busur (`s`)**, **Luas Juring**, **Luas Total & Keliling Lingkaran**, **Panjang Tali Busur**, dan **Panjang Garis Singgung**.

---

## 3. Fitur Kanvas 3D & Infrastruktur Visual (`IsometricStage`)

- **Kamera Ortografik Isometrik**: Menggunakan `@react-three/fiber` dan `OrthographicCamera` dari `@react-three/drei` dengan `OrbitControls` (rotasi 3D, zoom scroll, damping halus, tanpa pan agar spesimen tetap terpusat, serta penyesuaian zoom otomatis untuk layar ponsel `< 460px`).
- **Pencahayaan Soft Tactile**: Cahaya ambient + directional shadow-casting dari sudut kiri-atas 135° (selaras dengan bayangan neumorfisme UI) dan dukungan `dimmedLighting` untuk simulasi gelap pada sel tumbuhan.
- **Sistem Anotasi 3D Terproyeksi (`ProjectedHtml3D`, `CalloutPin`, `DimensionLine3D`, `VectorArrow3D`)**: Label 3D dirender sebagai overlay DOM murni di luar tree R3F agar tajam, ringan, dan mengikuti proyeksi 3D ke 2D secara real-time.
- **Penanganan Error WebGL (`CanvasErrorBoundary`)**: Fallback informatif apabila browser tidak mendukung/mengaktifkan akselerasi WebGL.

---

## 4. Fitur Asisten Cerdas Laboratorium (`geminiCopilot.ts` & `CopilotChatPanel`)

- **Integrasi Google Gemini API (`@google/genai`)**:
  - Mendukung *streaming response* real-time dengan pencoba model berjenjang otomatis (*candidate models*: `VITE_GEMINI_MODEL`, `gemini-2.5-flash-lite`, `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-flash-lite-latest`, `gemini-flash-latest`).
  - Mendukung konfigurasi kunci API lewat environment variable (`VITE_GEMINI_API_KEY`) maupun penyimpanan kunci sesi di browser (`localStorage`).
- **Context-Aware Per Modul**:
  - Mengirimkan *system instruction* terisolasi sesuai modul aktif (termasuk kondisi parameter slider, organ/organel yang sedang disorot, langkah *guided step* 1–4, jumlah data tercatat, dan maksimal 6 riwayat percakapan terakhir).
- **Mode Fallback Deterministik Lokal (Offline)**:
  - Apabila API key belum tersedia, jaringan terputus, atau server mengembalikan error/limit, sistem otomatis menjawab dengan analisis deterministik lokal yang merujuk pada data simulasi aktif siswa.
- **Quick-Action Pills & Rich Math Rendering**:
  - Tombol pertanyaan cepat (*quick actions*) yang spesifik per modul (bahkan dinamis mengikuti organel yang sedang dipilih pada Sel Tumbuhan).
  - Komponen `RichMathMessage` dan `FormulaText` merender inline math (`$...$`, `\(...\)`), display math (`$$...$$`, `\[...\]`), bold, bullet/ordered list, serta simbol ilmiah ke **KaTeX** secara rapi.

---

## 5. Fitur Lembar Kerja, Penyimpanan Lokal & Ekspor Laporan

- **Sinkronisasi Real-Time & Isolasi Data per Modul (`storage.ts` & `LabContext.tsx`)**:
  - Setiap perubahan parameter diskret (ganti mode, klik organ/organel, ubah saklar/lampu) langsung terekam, sedangkan perubahan slider di-*debounce* selama `650 ms` agar riwayat eksplorasi tidak dipenuhi duplikat.
  - Seluruh data tabel observasi (`eduspace_v1_records_by_module`), riwayat eksplorasi 3D (`eduspace_v1_explored_by_module`), catatan siswa (`eduspace_v1_notes_by_module`), langkah panduan (`eduspace_v1_guided_steps`), dan modul aktif (`eduspace_v1_active_module`) tersimpan di `localStorage` secara **terpisah untuk masing-masing modul** (disertai migrasi & sanitasi otomatis dari format lama).
- **Pemilih Hasil Eksplorasi 3D**:
  - Siswa dapat mencentang item hasil eksplorasi 3D tertentu (*Pilih Semua*, *Hapus Pilihan*, *Bersihkan Riwayat*), memasukkannya ke tabel observasi, atau menekan **Susun Rangkuman dari Pilihan** untuk mengisi kotak kesimpulan secara otomatis.
- **Tabel Observasi & Rangkuman Otomatis**:
  - Kolom tabel menyesuaikan tipe modul (format *Uji + Input + Output/Rumus* untuk Fisika/Matematika, dan format *Observasi + Organ/Kondisi + Struktur + Fungsi Fisiologis* untuk Biologi).
  - Tersedia pula tombol **Catat Data** di header untuk mencatat snapshot kondisi aktif kapan saja, serta opsi hapus per baris atau bersihkan tabel modul.
- **Ekspor Multi-Format (`exportReport.ts` & `index.css`)**:
  - **Salin Teks**: Menyalin laporan terstruktur ke clipboard (beserta fallback `execCommand` untuk browser lama).
  - **Unduh `.txt`**: Mengunduh berkas teks laporan (`lembar-kerja-<moduleId>.txt`) lengkap dengan atribusi lisensi model 3D jika relevan.
  - **Unduh PDF**: Menggunakan `window.print()` dengan stylesheet `@media print` khusus kertas **A4 Portrait** yang menyembunyikan elemen kontrol UI (`.no-print`) dan menampilkan lembar laporan putih bersih siap cetak/simpan PDF.

---

## 6. Desain Antarmuka & Stack Teknologi

- **Estetika Visual**: *Soft Tactile Neumorphism* dengan palet warna hangat (`#EFECE4` kanvas krem, `#F6F3EC` kartu timbul, `#E3DED2` ceruk inset, `#23272A` teks charcoal, `#0E5A63` aksen teal), dipadukan font **Plus Jakarta Sans** & **JetBrains Mono**, serta komponen UI khusus (`TactileCard`, `TactileSlider`, `TactileSegmented`, `TactileSwitch`).
- **Teknologi Inti**:
  - **Frontend**: React 19, TypeScript 7, Vite 8, Tailwind CSS v4.
  - **3D & Grafis**: Three.js (`0.187`), `@react-three/fiber` (`9.8`), `@react-three/drei` (`10.7`), Lucide React icons.
  - **Matematika & AI**: KaTeX (`0.19`), `@google/genai` (`3.4`).
  - **Kualitas Kode & Pengujian**: Oxlint & Vitest (`src/engines/engines.test.ts` untuk memverifikasi kelima engine kalkulasi, template lembar kerja, dan format ekspor laporan).
