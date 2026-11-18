# TASKS.md — Rencana Eksekusi Bertahap EDUSPACE MVP

Dokumen ini berisi daftar tugas implementasi yang atomik, berurutan, dan realistis untuk membangun **EDUSPACE** berdasarkan [PRD.md](./PRD.md) serta referensi 10 layar (Desktop & Mobile) dari Google Stitch.

> **Catatan Status:** Eksekusi dimulai **hanya setelah** `PRD.md` dan `TASKS.md` ditinjau dan disetujui.

---

## Fase 1 — Setup Proyek & Dependensi Inti
- [x] **1.1** Inisialisasi proyek Vite + React + TypeScript di `d:\3D_LAB_SAINS_MATEMATIKA` (`npm create vite@latest` template `react-ts`).
- [x] **1.2** Pasang dependensi utama UI & 3D: `tailwindcss`, `@tailwindcss/vite` (atau config Tailwind v3/v4), `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react` (ikon garis `2px`), dan `@google/genai`.
- [x] **1.3** Pasang dependensi unit test ringan untuk verifikasi rumus: `vitest` (devDependency).
- [x] **1.4** Konfigurasi font Google (`Plus Jakarta Sans` dan `JetBrains Mono`) di `index.html`, set `<html lang="id">`, judul halaman `"EDUSPACE — Laboratorium 3D Interaktif SMA"`, serta siapkan `.env.example` dengan `VITE_GEMINI_API_KEY=` dan `VITE_GEMINI_MODEL=gemini-flash-latest`.

## Fase 2 — Design System & Utilitas Soft Tactile Neumorphism (3 Warna)
- [x] **2.1** Konfigurasi token warna terkunci di Tailwind & `src/index.css`:
  - Warm Cream (`#EFECE4` canvas, `#F6F3EC` raised, `#E3DED2` inset).
  - Deep Charcoal (`#23272A` teks utama, `#5C6064` sekunder).
  - Deep Teal (`#0E5A63` aksen/CTA, `#FFFFFF` teks di atas aksen).
- [x] **2.2** Buat utility class takti pada `src/index.css`: `.tactile-raised`, `.tactile-inset`, `.tactile-pill-cta`, `.tactile-pressed`, skala radius (`8px`, `16px`, `24px`, `9999px`), skala grid `8px/16px/24px`, serta aturan `@media print` untuk ekspor PDF A4 bersih.
- [x] **2.3** Bangun komponen UI atomik di `src/components/ui/`:
  - `TactileCard.tsx` (varian `raised` dan `inset`, tanpa hard border 1px).
  - `TactileSlider.tsx` (track cekung `#E3DED2`, fill aktif `#0E5A63`, knob bulat `#F6F3EC`, label & badge monospace, aksesibilitas keyboard/ARIA).
  - `TactileToggle.tsx` (switch pill untuk toggle `Label & Vektor 3D` dan segmented toggle `Seri/Paralel` atau `Riemann/Cakram`).
  - `ResponseChartSvg.tsx` (komponen grafik kurva respons SVG bersih dengan grid halus, titik posisi aktif `#0E5A63`, dan tooltip nilai real-time).

## Fase 3 — Tipe Data, 6 Engine Rumus Eksak, & Penyimpanan Lokal
- [x] **3.1** Definisikan skema tipe terpusat di `src/types/lab.ts`: `ViewStage`, `SubjectCategory`, `ModuleId`, `ModuleDefinition`, `SliderConfig`, `ComputedResult`, `ExperimentRecord`, `ChatMessage`, dan `GuidedStep`.
- [x] **3.2** Susun katalog metadata 6 modul SMA Kelas XI & quick-action prompts di `src/data/modules.ts` (Fisika, Biologi, Matematika).
- [x] **3.3** Implementasikan 6 engine perhitungan deterministik murni di `src/engines/`:
  - `physicsInclined.ts` ($W, W\sin\theta, N, f_s/f_k, F_{\text{net}}, a$ + generator kurva $a(\theta)$).
  - `physicsCircuit.ts` ($R_{\text{tot}}, I_{\text{tot}}, I_1, I_2, V_1, V_2, P_{\text{tot}}$ mode Seri & Paralel + generator kurva $I(V)$).
  - `biologyAnatomy.ts` ($CO, T, RR$ dari $HR$ & $SV$, serta metadata lapisan organ & titik fungsi).
  - `biologyCell.ts` ($FOV$, $D_{\text{tampak}}$, $SA/V$ untuk Sel Tumbuhan & Sel Darah pada perbesaran $M$ + kurva $FOV(M)$).
  - `mathGeometry3d.ts` ($d_{\text{sisi}}, d_{\text{ruang}}$, koordinat $P$ & proyeksi $P'$, jarak titik ke garis `BD`, jarak titik ke bidang `BDG`, sudut garis-bidang + kurva $d(t)$).
  - `mathIntegral3d.ts` ($\Delta x$, jumlah Riemann & Volume cakram midpoint, nilai integral analitik eksak, galat $\varepsilon\%$ + kurva konvergensi terhadap $n$).
- [x] **3.4** Implementasikan `src/services/storage.ts` untuk persistensi `localStorage` (`eduspace_records`, `eduspace_notes`, `eduspace_module_state`, `eduspace_api_key`) dan state manager sesi praktikum di React Context (`LabContext`).

## Fase 4 — Shell Layout & 5 Halaman Antarmuka (Desktop + Mobile)
- [x] **4.1** Bangun `Header.tsx`: logo kubus isometrik `EDUSPACE`, breadcrumb kontekstual, navigasi tahap cepat di Tahap 3–5, tombol `Catat Data` (dengan counter), `Reset Simulasi`, dan indikator sesi lokal kelas XI *(tanpa elemen login/akun)*.
- [x] **4.2** Bangun `PersistentBottomBar.tsx` yang tampil konsisten di bawah setiap halaman (menyesuaikan ringkasan rumus aktif + input tanya cepat AI Co-Pilot sesuai tahap).
- [x] **4.3** Bangun **Tahap 1** (`LandingPage.tsx`): Hero 2-kolom dengan CTA `Mulai Belajar →`, kartu stage inset kanan berisi pratinjau apparatus 3D isometrik interaktif, dan reflow mobile 1 kolom.
- [x] **4.4** Bangun **Tahap 2** (`CatalogPage.tsx`): Top context bar `"Kelas XI · Kurikulum Merdeka"`, tab filter (`Semua Modul`, `Fisika`, `Biologi`, `Matematika`, `Pilihan Lainnya`), grid kartu 3×2 untuk 6 modul uji coba, serta tampilan tab `Pilihan Lainnya` dengan fitur ringan *"Unggah Gambar Materi Buku → Preview 3D"*.
- [x] **4.5** Bangun **Tahap 3** (`LabWorkspacePage.tsx`): Grid 12-kolom asimetris (Panel kontrol slider dinamis 4 kolom di kiri + Stage kanvas 3D 8 kolom di kanan), lengkap dengan HUD status isometrik, `CalloutPin` metrik utama, tombol `Reset Sudut Pandang`, dan reflow mobile (`kanvas di atas, slider di bawah`).
- [x] **4.6** Bangun **Tahap 4** (`AnalysisCopilotPage.tsx`): Kolom kiri (45%) berisi **4-Step Guided Task Tracker**, Kotak Rumus Dinamis + 3 chip metrik, dan `ResponseChartSvg`; Kolom kanan (55%) berisi panel dialog penuh AI Co-Pilot dengan context pill parameter aktif, bubble chat berformula chip, dan 3 *quick-action pills*.
- [x] **4.7** Bangun **Tahap 5** (`WorksheetPage.tsx`): Toast jumlah percobaan tersimpan, tabel observasi (desktop) / kartu observasi (mobile), tombol hapus baris, textarea `Tambah Catatan Manual`, tombol `Salin Teks`, dan tombol `Unduh PDF`.

## Fase 5 — Infrastruktur 3D Isometrik & 6 Scene Modul (React Three Fiber)
- [x] **5.1** Bangun `IsometricStage.tsx`: setup `<Canvas>`, kamera isometrik (`OrthographicCamera` / sudut `[8, 7, 8]`), pencahayaan 135° kiri-atas untuk estetika matte/clay, `OrbitControls` terkendali, dan hook `resetCamera()` yang terhubung ke tombol `Reset Sudut Pandang`.
- [x] **5.2** Bangun komponen anotasi 3D bersama:
  - `CalloutPin.tsx`: pin bulat `#0E5A63` + label kartu takti `#F6F3EC` monospace yang mengikuti koordinat 3D dan menghormati toggle `Label & Vektor 3D`.
  - `DimensionLine3D.tsx`: garis ukur, tick ujung, busur sudut, dan label jarak/sudut yang berubah real-time sesuai state slider.
- [x] **5.3** Implementasikan Scene 3D **Fisika 1** (`InclinedPlaneScene.tsx`): prisma bidang miring dinamis berdasarkan $\theta$, balok massa berskala $m$, animasi luncur kinematik saat `Jalankan Simulasi` ditekan, panah vektor 3D ($W, N, W\sin\theta, W\cos\theta, f_k$), busur sudut $\theta$, dan pin $F_{\text{net}}, a$.
- [x] **5.4** Implementasikan Scene 3D **Fisika 2** (`ElectricCircuitScene.tsx`): papan rangkaian clay, sumber DC, resistor $R_1, R_2$ berkode warna, konduktor seri/paralel yang berubah sesuai mode, animasi partikel muatan sebanding $I$, serta `CalloutPin` & `DimensionLine3D`.
- [x] **5.5** Implementasikan Scene 3D **Biologi 1** (`HumanAnatomyScene.tsx`): model toraks berlapis (sangkar rusuk transparan/terangkat via slider lapisan, paru-paru mengembang seirama $RR$, jantung & aorta berdenyut seirama $HR$), seleksi fokus organ, dan `CalloutPin` fungsi organ.
- [x] **5.6** Implementasikan Scene 3D **Biologi 2** (`CellMicroscopeScene.tsx`): preparat kaca & penggaris skala $\mu\text{m}$ (`DimensionLine3D` sesuai $FOV$), model *cutaway* Sel Tumbuhan (dinding sel, vakuola, nukleus, kloroplas, mitokondria) dan Sel Darah (eritrosit bikonkaf & leukosit) dengan animasi *exploded view* dan zoom perbesaran $M$.
- [x] **5.7** Implementasikan Scene 3D **Matematika 1** (`Geometry3DScene.tsx`): kubus wireframe $ABCD.EFGH$ berskala $s$, bidang irisan $BDG$ transparan, titik $P(t)$ bergerak, garis proyeksi tegak lurus putus-putus ke $P'$, penanda siku-siku 3D, serta `DimensionLine3D` jarak & rusuk.
- [x] **5.8** Implementasikan Scene 3D **Matematika 2** (`IntegralRiemannScene.tsx`): sumbu 3D, kurva $f(x)$, selubung benda putar referensi transparan, $n$ cakram/balok pias dinamis antara $[a, b]$, animasi rotasi $360^\circ$ saat `Jalankan Simulasi`, dan penanda lebar $\Delta x$.

## Fase 6 — Integrasi AI Co-Pilot (Gemini Flash) & Ekspor Browser
- [x] **6.1** Implementasikan `src/services/geminiCopilot.ts` menggunakan `@google/genai` (`gemini-flash-latest`) dengan *context injection* penuh (`module`, `inputs`, `outputs`, `guidedStep`, `recordedCount`).
- [x] **6.2** Tambahkan **Mode Fallback Deterministik Lokal** di `geminiCopilot.ts` untuk kondisi tanpa API key atau offline, serta popover pengaturan API key sesi lokal opsional (tanpa sistem akun).
- [x] **6.3** Implementasikan fitur multimodal ringan di tab `Pilihan Lainnya` (`Unggah Gambar Materi Buku → Preview 3D`): membaca gambar buku cetak dengan Gemini Flash Vision untuk memetakan ke modul & preset parameter terdekat dari 6 modul yang ada.
- [x] **6.4** Implementasikan `src/services/exportReport.ts`: format laporan teks terstruktur ke `navigator.clipboard.writeText()` (dengan fallback unduh `.txt`) dan fungsi `exportWorksheetPdf()` berbasis `@media print` A4.

## Fase 7 — Pengujian Akurasi Rumus, Audit Strict MVP, & Verifikasi Build
- [x] **7.1** Tulis dan jalankan unit test Vitest untuk seluruh 6 engine di `src/engines/*.test.ts` (menguji kasus batas: $\theta = 0^\circ$, kesetimbangan statis vs meluncur, seri vs paralel, $FOV$ mikroskop, jarak titik-bidang `BDG`, dan konvergensi integral Riemann vs analitik eksak).
- [x] **7.2** Audit Strict MVP & UI: pastikan **tidak ada** login/register, backend DB, dashboard admin, gamifikasi, forum, push notif, penghitung FPS, materi SD/SMP, ataupun istilah lomba; verifikasi konsistensi 3 warna (`#EFECE4`/`#F6F3EC`/`#E3DED2`, `#23272A`/`#5C6064`, `#0E5A63`) dan kehadiran bar bawah AI Co-Pilot di semua halaman.
- [x] **7.3** Verifikasi responsivitas pada viewport Desktop (`1280×800`) dan Mobile (`390×844`), uji alur end-to-end 5 tahap (Pilih Modul → Atur Slider & 3D → Analisis & AI Co-Pilot → Catat Data → Ekspor Teks/PDF), dan pastikan `npm run build` & `tsc --noEmit` lulus tanpa error.

---

## Fase 8 — Revisi Modul Biologi: Anatomi Organ (Model GLB & Eksplorasi Fisiologis)

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_ANATOMI.md](./PLAN_REVISI_ANATOMI.md).

- [x] **8.1** Fondasi data & state anatomi: buat `src/data/anatomyData.ts`, perbarui `AnatomyParams` & `ExperimentRecord` di `src/types/lab.ts`, revisi `src/engines/biologyAnatomy.ts`, `src/engines/index.ts`, dan metadata `biology-anatomy` di `src/data/modules.ts`.
- [x] **8.2** Integrasi `.glb` & 3 mode inspeksi di `HumanAnatomyScene.tsx`: muat `public/models/anatomi_kardiorespirasi.glb` dengan 12 node eksak via `useGLTF`, `traverse`, `<primitive>`, mode `Utuh` / `Pisahkan` (click-to-separate) / `Belah Organ` (cutaway), ritme detak/napas, dan `CalloutPin` bagian dalam.
- [x] **8.3** Revisi UI Simulasi 3D: ubah Sidebar Kiri di `LabWorkspacePage.tsx` (Mode Inspeksi, Fokus Organ, Toggle `Label Bagian Dalam`, Play/Pause ritme) serta buat `AnatomyBottomPanel.tsx` di `PersistentBottomBar.tsx` untuk penjelasan komponen anatomi real-time.
- [x] **8.4** Revisi halaman `Analisis & AI`: hapus grafik garis `CO vs HR` pada modul anatomi dan ganti dengan `AnatomyAnalysisPanel.tsx` (alur peredaran darah & respirasi, rincian struktur dalam, info normal pelengkap); sesuaikan konteks & quick actions AI Co-Pilot di `geminiCopilot.ts` & `LabContext.tsx`.
- [x] **8.5** Revisi `WorksheetPage.tsx`, ringkasan Tahap 5 `PersistentBottomBar.tsx`, `exportReport.ts` (kolom adaptif `Organ & Mode`, `Struktur yang Diidentifikasi`, `Fungsi Fisiologis`), tambahkan atribusi lisensi **CC BY-NC-SA 4.0**, perbarui `src/engines/engines.test.ts`, dan verifikasi `npm test`, `tsc`, & `npm run build`.

---

## Fase 9 — Revisi Lanjutan Modul Anatomi: Multi-Model per Fokus Organ (`sceneheart`, `scenenormal`, `scenelungstransparan`, `sceneaorta`)

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_ANATOMI.md](./PLAN_REVISI_ANATOMI.md).

- [x] **9.1** Siapkan & konversi aset ke-4 model (`sceneheart`, `scenenormal`, `scenelungstransparan`, `sceneaorta`) beserta `scene.bin` & `textures/` ke `.glb` PBR standar di `public/models/` (mengatasi `KHR_materials_pbrSpecularGlossiness` untuk Three.js `0.187.0`).
- [x] **9.2** Perbarui tipe, katalog, & engine: tambah `lungVariant: 'normal' | 'transparan'` di `src/types/lab.ts`, petakan bone joints `sceneheart`, 12 node objek `scenelungstransparan`, segmen `scenenormal` & `sceneaorta` di `src/data/anatomyData.ts`, serta perbarui `biologyAnatomy.ts` dan `LabContext.tsx`.
- [x] **9.3** Bangun komponen 3D per fokus organ: `HeartDetailModel.tsx` (animasi detak & pelacakan bone joint), `LungsDetailModel.tsx` (switch Paru Normal vs Paru Transparan dengan klik & penamaan objek internal), `AortaDetailModel.tsx` (auto-normalize `Box3`), dan hubungkan di `HumanAnatomyScene.tsx`.
- [x] **9.4** Perbarui UI `LabWorkspacePage.tsx` (switch `Normal` vs `Transparan` saat Fokus Paru), `AnatomyBottomPanel.tsx`, `AnatomyAnalysisPanel.tsx`, `geminiCopilot.ts`, dan atribusi multi-lisensi (CC BY 4.0 & CC BY-NC-SA 4.0) di `WorksheetPage.tsx`.
- [x] **9.5** Tambah unit test di `src/engines/engines.test.ts`, lalu verifikasi `npm test`, `npm run lint`, `npm run build`, dan uji visual browser di semua Fokus Organ.

---

## Fase 10 — Penyempurnaan Pin Jantung, Analisis Adaptif, Rangkuman Pilihan 3D, & Penghapusan Co-Pilot di Lembar Kerja

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_ANATOMI.md](./PLAN_REVISI_ANATOMI.md).

- [x] **10.1** Perbaiki penamaan & garis `CalloutPin` pada `HeartDetailModel.tsx` (resolusi nama joint tersanitasi Three.js tanpa titik `.`, sinkronisasi matriks awal, dan kalibrasi offset agar garis menunjuk tepat ke ruang & katup jantung).
- [x] **10.2** Buat `AnatomyAnalysisPanel.tsx` adaptif terhadap pilihan `focusOrgan` di Simulasi 3D (`Semua` → keseluruhan sistem; `Paru-paru` → alur respirasi & pertukaran gas; `Jantung` → alur sirkulasi & katup jantung; `Aorta` → distribusi sistemik & koarktasio).
- [x] **10.3** Tambahkan pelacakan item yang diklik di Simulasi 3D (`AnatomyExploredItem` di `LabContext.tsx` & `storage.ts`) serta UI pemilih item di `WorksheetPage.tsx` untuk menyusun **Rangkuman Siswa** otomatis yang dapat diedit & diekspor.
- [x] **10.4** Hapus fitur/input AI Co-Pilot pada halaman `Lembar Kerja` di `PersistentBottomBar.tsx`.
- [x] **10.5** Perbarui unit test di `src/engines/engines.test.ts`, jalankan `npm test`, `npm run lint`, `npm run build`, dan verifikasi visual browser untuk keempat perbaikan di atas.

---

## Fase 11 — Isolasi Lembar Kerja per Modul, Penghapusan Kalkulus & Unggah Buku, & Font Lokal Rumus

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_ISOLASI_MODUL_COPILOT.md](./PLAN_ISOLASI_MODUL_COPILOT.md).

- [x] **11.1** Pasang font lokal `@fontsource/plus-jakarta-sans` & `@fontsource/jetbrains-mono`, hapus CDN eksternal di `index.html`, impor font lokal + `katex.min.css` di `src/main.tsx`, dan buat `FormulaText.tsx` berbasis KaTeX lokal untuk seluruh tampilan perhitungan & rumus.
- [x] **11.2** Hapus modul Kalkulus Lanjut (`math-integral3d`) beserta file `mathIntegral3d.ts` & `IntegralRiemannScene.tsx`, serta hapus tab `Pilihan Lainnya` & fitur `Unggah Gambar Materi Buku` di `CatalogPage.tsx` dan `geminiCopilot.ts` (katalog menjadi 5 modul).
- [x] **11.3** Hapus AI Co-Pilot pada halaman Pemilihan Materi (`CatalogPage`) & Beranda (`LandingPage`) di `PersistentBottomBar.tsx` + `App.tsx`, serta hapus tombol `Lembar Kerja` di `Header.tsx` saat `view === 'catalog'`.
- [x] **11.4** Pisahkan penyimpanan & state `records` serta `manualNote` per `ModuleId` (`recordsByModule`, `notesByModule`) di `src/services/storage.ts` (dengan migrasi otomatis data lama) dan `src/context/LabContext.tsx`, lalu perbarui `WorksheetPage.tsx` dan `exportReport.ts`.
- [x] **11.5** Lengkapi `primaryLatex` pada engine perhitungan dan terapkan `FormulaText` pada `AnalysisCopilotPage.tsx`, `PersistentBottomBar.tsx`, `RichMathMessage.tsx`, & `WorksheetPage.tsx`; perbarui `engines.test.ts` lalu verifikasi `npm test`, `npm run lint`, `npm run build`, dan uji visual browser.

---

## Fase 12 — Pemisahan Total Aspek Lembar Kerja & Pemilih Rangkuman 3D per Modul

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_LEMBAR_KERJA_PER_MODUL.md](./PLAN_LEMBAR_KERJA_PER_MODUL.md).

- [x] **12.1** Tambah `ModuleExploredItem` di `src/types/lab.ts` dan buat `src/data/worksheetTemplates.ts` berisi konfigurasi kolom tabel, judul pemilih rangkuman 3D, serta generator rangkuman siswa yang unik untuk setiap 5 modul.
- [x] **12.2** Perbarui `src/services/storage.ts` (`loadExploredByModule` / `saveExploredByModule` dengan migrasi aman) dan `src/context/LabContext.tsx` (pelacakan terisolasi per `ModuleId` dengan immediate click capture & debounced slider capture).
- [x] **12.3** Perbarui `src/pages/WorksheetPage.tsx` dan `src/services/exportReport.ts` agar kartu pemilih rangkuman 3D, header tabel observasi, dan ekspor sepenuhnya spesifik & terisolasi per modul aktif.
- [x] **12.4** Tambah unit test di `src/engines/engines.test.ts`, jalankan `npm test`, `npm run lint`, `npm run build`, dan verifikasi browser lintas modul bahwa tiap modul punya pemilih rangkuman 3D sendiri tanpa kebocoran data Anatomi.

---

## Fase 13 — Revisi Modul Fisika Vektor: Dunia Perbukitan, 2 Simulasi (Barang/Mobil), Variabel Lengkap ($h, W$), Label Berarah, & Analisis Grafik Animasi (Tanpa AI Co-Pilot)

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_FISIKA_VEKTOR.md](./PLAN_REVISI_FISIKA_VEKTOR.md).

- [x] **13.1** Perbarui `InclinedParams` (`objectType: 'barang' | 'mobil'`, `rampLengthMeters`) dan perluas `src/engines/physicsInclined.ts` (relasi $h = L\sin\theta$, $W = mg$, $\theta_{\text{kritis}}$, 4 langkah penjabaran KaTeX + penjelasan sederhana, dan 3 variasi kurva).
- [x] **13.2** Tingkatkan `CalloutPin.tsx` & `DimensionLine3D.tsx` (garis penunjuk berarah agar tidak menempel bidang), lalu bangun `InclinedWorldEnvironment.tsx` (area perbukitan & objek dunia prosedural) + `InclinedVehiclesAndCargo.tsx` (Peti Barang & Mobil beroda + animasi partikel gesekan $\mu$) di `InclinedPlaneScene.tsx`.
- [x] **13.3** Tambahkan kontrol `Peti Barang | Mobil & Bukit` serta slider $h$ dan $W$ tersinkronisasi di `LabWorkspacePage.tsx`, dan ganti bar bawah AI Co-Pilot dengan `InclinedBottomPanel.tsx` (daftar rumus KaTeX + penjelasan simulasi & Hukum II Newton).
- [x] **13.4** Bangun `AnimatedPhysicsChartSvg.tsx` (animasi bergerak + 3 variasi kurva `a(θ)`, `F(θ)`, `a(μ)`) dan `InclinedAnalysisView.tsx` (penjabaran langkah KaTeX + daftar rumus lengkap & Hukum II Newton tanpa AI Co-Pilot), hubungkan ke `AnalysisCopilotPage.tsx` & `Header.tsx`.
- [x] **13.5** Perbarui `worksheetTemplates.ts` & `engines.test.ts`, lalu jalankan `npm test`, `npm run lint`, `npm run build`, serta verifikasi visual browser untuk modul Fisika Vektor.

---

## Fase 14 — Penambahan AI Co-Pilot pada Halaman Analisis & Rumus (Fisika: Bidang Miring)

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_COPILOT_ANALISIS_BIDANG_MIRING.md](./PLAN_COPILOT_ANALISIS_BIDANG_MIRING.md).

- [x] **14.1** Buat `src/components/analysis/CopilotChatPanel.tsx` sebagai komponen panel AI Co-Pilot reusable (header Gemini Flash/Lokal, konteks parameter real-time, rendering KaTeX `RichMathMessage` & `FormulaText`, quick action chips, dan form chat) dan pakai di `src/pages/AnalysisCopilotPage.tsx`.
- [x] **14.2** Tambahkan `<CopilotChatPanel />` pada bagian bawah grid 2 kolom di `src/components/analysis/InclinedAnalysisView.tsx` tanpa mengubah atau menghapus elemen analisis, grafik animasi, simulasi, Hukum II Newton, maupun daftar rumus yang sudah ada.
- [x] **14.3** Isi `quickActions` untuk `physics-inclined` di `src/data/modules.ts` dan tambahkan cabang topik bidang miring (`μ`, `h`, `W`, `Peti vs Mobil`, Hukum II Newton) pada `buildDeterministicFallback` di `src/services/geminiCopilot.ts`.
- [x] **14.4** Jalankan `npm test`, `npm run lint`, `npm run build`, serta verifikasi browser langsung pada tab **Analisis & Rumus** modul Fisika: Bidang Miring.

---

## Fase 15 — Revisi Modul Fisika Rangkaian Listrik: Rangkaian Campuran, Saklar & Lampu 3D Interaktif, Hapus Co-Pilot di Simulasi 3D, Grafik Animasi & Co-Pilot Kontekstual

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_FISIKA_LISTRIK.md](./PLAN_REVISI_FISIKA_LISTRIK.md).

- [x] **15.1** Perbarui `CircuitParams` (`src/types/lab.ts`), `DEFAULT_MODULE_PARAMS` (`src/engines/index.ts`), dan bangun engine Seri/Paralel/Campuran + Saklar + variasi Lampu + `buildCircuitAnalysisDetails` di `src/engines/physicsCircuit.ts`.
- [x] **15.2** Buat `src/components/three/scenes/circuit/CircuitComponents3D.tsx` dan perbarui `ElectricCircuitScene.tsx` + `Module3DCanvas.tsx` (topologi Campuran, saklar 3D klik-langsung, lampu berpijar dinamis sesuai daya, elektron cabang proporsional, label pin terkalibrasi).
- [x] **15.3** Perbarui kontrol panel kiri (`LabWorkspacePage.tsx`), `isDiscretePatch` (`LabContext.tsx`), buat `CircuitBottomPanel.tsx`, dan pasang ke `PersistentBottomBar.tsx` (hapus AI Co-Pilot di halaman Simulasi 3D, ganti dengan penjelasan rumus & Hukum Ohm/Kirchhoff).
- [x] **15.4** Buat `AnimatedCircuitChartSvg.tsx` (3 grafik hubungan beranimasi + panduan membaca grafik) dan `CircuitAnalysisView.tsx` (penjabaran langkah KaTeX, penjelasan Hukum Ohm/Kirchhoff I-II, keterangan rumus Seri/Paralel/Campuran, serta `<CopilotChatPanel />`) lalu integrasikan di `AnalysisCopilotPage.tsx`.
- [x] **15.5** Perbarui `modules.ts`, `geminiCopilot.ts` (konteks penuh listrik dinamis & fallback), `worksheetTemplates.ts`, dan `engines.test.ts`; jalankan `npm test`, `npm run lint`, `npm run build`, dan verifikasi browser langsung.

---

## Fase 16 — Revisi Modul Biologi Sel: Model GLTF Sel Tumbuhan, Auto-Zoom Organel (Tanpa Explode), Simulasi Cahaya, & Analisis Non-Perhitungan + Co-Pilot Real-Time

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_SEL_TUMBUHAN.md](./PLAN_REVISI_SEL_TUMBUHAN.md).

- [x] **16.1** Buat `src/data/plantCellData.ts` (13 node organel GLTF + detail struktur & respon Terang/Gelap + lisensi Vida Systems) dan perbarui `CellParams` (`src/types/lab.ts`), `DEFAULT_MODULE_PARAMS` (`src/engines/index.ts`), serta refaktor `src/engines/biologyCell.ts` tanpa perhitungan maupun Sel Darah.
- [x] **16.2** Tambahkan `cameraFocus` auto-zoom halus di `IsometricStage.tsx`, bangun ulang `CellMicroscopeScene.tsx` memakai `public/models/plant_cell_-_cell_structure/scene.gltf` (klik 3D, auto-zoom organel, visualisasi cahaya Terang vs Gelap, tanpa Explode), dan hubungkan di `Module3DCanvas.tsx`.
- [x] **16.3** Perbarui kontrol workspace `biology-cell` (`LabWorkspacePage.tsx`), buat `PlantCellBottomPanel.tsx`, dan pasang ke `PersistentBottomBar.tsx` (hapus AI Co-Pilot di Simulasi 3D dan ganti penjelasan singkat non-perhitungan).
- [x] **16.4** Buat `PlantCellAnalysisView.tsx` (murni pengamatan, penjelasan rinci organel & efek cahaya Terang vs Gelap, tanpa grafik/perhitungan + `<CopilotChatPanel />` real-time) dan perbarui `AnalysisCopilotPage.tsx`, `geminiCopilot.ts`, serta `LabContext.tsx`.
- [x] **16.5** Perbarui `modules.ts`, `worksheetTemplates.ts`, `WorksheetPage.tsx`, `exportReport.ts`, dan `engines.test.ts`; jalankan `npm test`, `npm run lint`, `npm run build`, serta verifikasi browser langsung.

---

## Fase 17 — Revisi Modul Matematika: Transformasi Geometri & Lingkaran (Kurikulum Merdeka Kelas XI)

> **Catatan Status:** Selesai diimplementasikan dan diverifikasi berdasarkan [PLAN_REVISI_GEOMETRI.md](./PLAN_REVISI_GEOMETRI.md).

- [x] **17.1** Perbarui `Geometry3DParams` (`src/types/lab.ts`), `DEFAULT_MODULE_PARAMS` (`src/engines/index.ts`), dan bangun ulang `src/engines/mathGeometry3d.ts` (Transformasi Geometri matriks 2×2 + determinan luas, serta Lingkaran busur, juring, sudut keliling $\theta/2$, tali busur, garis singgung $PT = \sqrt{OP^2 - r^2}$).
- [x] **17.2** Bangun ulang `src/components/three/scenes/Geometry3DScene.tsx` dengan sub-mode Kartesius 3D (Objek Awal vs Bayangan `#0E5A63`, garis cermin/vektor/busur rotasi/sinar dilatasi, `CalloutPin`) dan Cakram Lingkaran 3D (juring menyala, busur, tali busur, sudut keliling, garis singgung $90^\circ$).
- [x] **17.3** Sesuaikan Sidebar Kiri `Variabel Simulasi` di `LabWorkspacePage.tsx`, buat `GeometryBottomPanel.tsx`, dan pasang di `PersistentBottomBar.tsx` (hapus AI Co-Pilot di tab `Simulasi 3D`).
- [x] **17.4** Buat `GeometryAnalysisView.tsx` (*detailing* rumus KaTeX tanpa grafik garis + `CopilotChatPanel` kontekstual) dan perbarui `AnalysisCopilotPage.tsx`, `modules.ts`, `LabContext.tsx`, serta `geminiCopilot.ts`.
- [x] **17.5** Perbarui `worksheetTemplates.ts`, `storage.ts` (sanitasi riwayat Dimensi Tiga lama), dan `engines.test.ts`; jalankan `npm test`, `npm run lint`, `npm run build`, serta verifikasi browser langsung.
