# PLAN_ISOLASI_MODUL_COPILOT.md — Rencana Penyederhanaan Katalog, Isolasi Lembar Kerja, & Konsistensi Font Rumus

Dokumen ini merancang pembaruan menyeluruh arsitektur navigasi, katalog modul, penyimpanan lembar kerja, dan tipografi rumus **EDUSPACE**:
1. **Hapus AI Co-Pilot di halaman pemilihan materi (`CatalogPage`) & beranda (`LandingPage`)**, sehingga AI Co-Pilot **hanya muncul di dalam modul yang dipilih** (`workspace` non-anatomi dan `analysis`).
2. **Hapus tombol `Lembar Kerja` pada halaman pemilihan modul praktikum (`CatalogPage`)**.
3. **Pisahkan `Lembar Kerja` & catatan per modul (`ModuleId`)** agar setiap modul memiliki lembar kerja sendiri yang tidak saling terhubung.
4. **Hapus modul `Kalkulus Lanjut` (`math-integral3d` — *Integral Riemann & Volume Putar 3D*)**.
5. **Hapus fitur `Unggah Gambar Materi Buku` (beserta tab `Pilihan Lainnya`)** di `CatalogPage`.
6. **Gunakan font lokal yang sudah di-bundle (`KaTeX` + `@fontsource/plus-jakarta-sans` + `@fontsource/jetbrains-mono`) untuk seluruh tampilan UI, perhitungan matematika, dan informasi rumus** di semua modul agar tipografi rumus tidak rusak saat offline atau beda perangkat.

> **Prinsip Desain & Aturan Eksekusi:**
> - Tetap mempertahankan **Soft Tactile Neumorphism 3 Warna** (`#EFECE4`/`#F6F3EC`/`#E3DED2`, `#23272A`/`#5C6064`, `#0E5A63`).
> - Dokumen perencanaan ini disusun terlebih dahulu untuk ditinjau dan disetujui sebelum kode diubah.

---

## 1. Pembatasan AI Co-Pilot & Penghapusan Tombol Lembar Kerja di Pemilihan Modul

1. **`src/components/layout/PersistentBottomBar.tsx`**:
   - Pada `view === 'landing' || view === 'catalog'`, kembalikan `null` (menghapus floating pill bar `Tanya AI Co-Pilot...`).
   - AI Co-Pilot **hanya aktif di dalam modul terpilih**:
     - `view === 'workspace'` untuk modul non-anatomi (bar rumus + Co-Pilot).
     - `view === 'analysis'` untuk semua modul (panel dialog AI Co-Pilot penuh).
   - `view === 'worksheet'` tetap bersih tanpa AI Co-Pilot.
2. **`src/App.tsx`**:
   - Hapus `isFloatingBottom` dan padding ekstra `pb-28` karena floating bar pada Landing/Catalog telah dihapus.
3. **`src/components/layout/Header.tsx`**:
   - Hapus tombol `Lembar Kerja (N)` pada blok `{view === 'catalog' ? ... : null}` sehingga Lembar Kerja hanya diakses di dalam modul yang sedang dibuka.

---

## 2. Isolasi `Lembar Kerja` & Catatan Pengamatan per Modul (`ModuleId`)

1. **Penyimpanan Terpisah (`src/services/storage.ts`)**:
   - Simpan data dalam struktur peta per modul:
     - `eduspace_v1_records_by_module` (`Partial<Record<ModuleId, ExperimentRecord[]>>`)
     - `eduspace_v1_notes_by_module` (`Partial<Record<ModuleId, string>>`)
   - Sertakan migrasi otomatis satu kali dari data lama (`eduspace_v1_records`) dengan mengelompokkan tiap record ke bucket `rec.moduleId` masing-masing (mengabaikan `math-integral3d` yang sudah dihapus).
2. **State Manager (`src/context/LabContext.tsx`)**:
   - Ganti state global tunggal menjadi `recordsByModule` & `notesByModule`.
   - Turunkan `records = recordsByModule[activeModuleId] ?? []` dan `manualNote = notesByModule[activeModuleId] ?? ''`.
   - Seluruh aksi (`recordCurrentExperiment`, `removeRecord`, `clearRecords`, `setManualNote`, `addExploredItemsToWorksheet`) hanya memodifikasi bucket `[activeModuleId]`.
3. **Tampilan & Ekspor (`src/pages/WorksheetPage.tsx` & `src/services/exportReport.ts`)**:
   - Judul & header laporan mencantumkan nama modul aktif (`Lembar Kerja Praktikum — ${mod.title}`).
   - Nama file ekspor `.txt` dibuat spesifik per modul (`lembar-kerja-${activeModuleId}.txt`).
   - Karena data 100% terisolasi, modul `biology-anatomy` selalu merender kolom anatomi (`Observasi`, `Organ & Mode`, `Struktur yang Diidentifikasi`, `Fungsi Fisiologis`), sedangkan modul Fisika/Biologi Sel/Matematika selalu merender kolom kuantitatif secara terpisah.

---

## 3. Penghapusan Modul `Kalkulus Lanjut` (`math-integral3d`) & `Unggah Gambar Materi Buku`

### 3.1 Hapus Modul `Kalkulus Lanjut` (`math-integral3d`)
Katalog akan menjadi **5 Modul Terkalibrasi** (2 Fisika, 2 Biologi, 1 Matematika Dimensi Tiga):
- `src/types/lab.ts`: Hapus `'math-integral3d'` dari `ModuleId`, hapus `Integral3DParams`, dan hapus entri `'math-integral3d'` dari `ModuleParamsMap`.
- `src/data/modules.ts`: Hapus definisi modul `math-integral3d` dari `MODULES`.
- `src/engines/index.ts`: Hapus `computeIntegral3DResult`, default params `'math-integral3d'`, dan `case 'math-integral3d'`.
- `src/engines/mathIntegral3d.ts` & `src/components/three/scenes/IntegralRiemannScene.tsx`: Hapus file engine & scene 3D integral.
- `src/components/three/Module3DCanvas.tsx`, `src/pages/LabWorkspacePage.tsx`, `src/pages/CatalogPage.tsx`: Hapus import/case `'math-integral3d'`, dan perbarui badge `"6 Modul Terkalibrasi"` menjadi `"5 Modul Terkalibrasi"`.
- `src/services/storage.ts`, `src/services/geminiCopilot.ts`, `src/engines/engines.test.ts`: Hapus referensi & test `math-integral3d` (dengan fallback aman ke `'physics-inclined'` jika `localStorage` masih menyimpan `'math-integral3d'`).

### 3.2 Hapus Fitur `Unggah Gambar Materi Buku` & Tab `Pilihan Lainnya`
- `src/types/lab.ts`: Ubah `CatalogFilter = 'semua' | SubjectCategory` (hapus `'lainnya'`).
- `src/pages/CatalogPage.tsx`:
  - Hapus tab `{ id: 'lainnya', label: 'Pilihan Lainnya' }`.
  - Hapus kartu penjelasan pemetaan gambar buku, tombol sekunder *"Unggah Gambar Materi Buku → Preview 3D"*, modal file upload, serta state & handler terkait (`showBookModal`, `isAnalyzing`, `bookResult`, `fileInputRef`, `handleFileChange`).
- `src/services/geminiCopilot.ts`: Hapus `TextbookMappingResult` dan fungsi `analyzeTextbookDiagram()`.

---

## 4. Penggunaan Font Lokal & Rendering Font Matematika (KaTeX) di Seluruh Modul

### Masalah yang Diselesaikan
1. `index.html` saat ini masih memanggil `Plus Jakarta Sans` dan `JetBrains Mono` dari CDN `fonts.googleapis.com` yang berisiko gagal/lambat dan membuat tampilan huruf/angka fallback ke font sistem standar.
2. Perhitungan matematika & informasi rumus di `AnalysisCopilotPage.tsx` (`primaryEquation`), `PersistentBottomBar.tsx`, `WorksheetPage.tsx`, serta chip formula chat masih banyak dirender sebagai string teks Unicode mentah (`√3`, `θ`, `μ`, `₁`, `²`, `·`) dengan font monospace biasa, sehingga karakter matematika rentan terlihat tidak sejajar atau rusak di beberapa perangkat.

### Rancangan Perbaikan Font & Rumus
1. **Self-Host Font Lokal (`@fontsource` + KaTeX lokal)**:
   - Memasang `@fontsource/plus-jakarta-sans` dan `@fontsource/jetbrains-mono` sebagai dependensi lokal dan mengimpornya di `src/main.tsx` bersama `'katex/dist/katex.min.css'` (yang sudah memiliki seluruh file `.woff2`/`.woff`/`.ttf` KaTeX ter-bundle lokal di `node_modules/katex/dist/fonts/`).
   - Menghapus tag `<link href="https://fonts.googleapis.com/...">` eksternal di `index.html` sehingga seluruh aplikasi 100% menggunakan font yang sudah terunduh/ter-bundle secara lokal.
2. **Komponen `FormulaText.tsx` Berbasis KaTeX Lokal (`src/components/ui/FormulaText.tsx`)**:
   - Membangun komponen `FormulaText` (inline & display) yang merender rumus matematika menggunakan `katex.renderToString()` (font `KaTeX_Main`, `KaTeX_Math`, `KaTeX_AMS` lokal), plus helper `toLatexExpression()` yang aman mengonversi baik ekspresi LaTeX eksplisit (`primaryLatex`) maupun teks persamaan dengan simbol (`θ`, `μ`, `√`, `π`, `α`, `Ω`, `Δ`, `₁`, `₂`, `²`, `·`, `×`, `−`).
   - Menambahkan properti opsional `primaryLatex?: string` pada `ComputedModuleResult` dan mengisinya pada engine perhitungan matematika/fisika/biologi sel (`physicsInclined.ts`, `physicsCircuit.ts`, `biologyCell.ts`, `mathGeometry3d.ts`) agar pecahan (`\frac`), akar (`\sqrt`), pangkat/subskrip (`m/s^2`, `R_1`, `R_{\text{tot}}`), dan simbol Yunani (`\theta`, `\mu`, `\alpha`) tampil presisi dengan font KaTeX lokal.
   - Menerapkan `FormulaText` pada:
     - **Kotak Persamaan Utama** di `AnalysisCopilotPage.tsx` (seluruh modul perhitungan).
     - **Bar Bawah Simulasi 3D** di `PersistentBottomBar.tsx`.
     - **Formula Chip** di gelembung chat AI Co-Pilot (`AnalysisCopilotPage.tsx`).
     - **Kolom Rumus / Persamaan** di `WorksheetPage.tsx` (untuk modul perhitungan kuantitatif).
   - Memperkuat `RichMathMessage.tsx` agar token LaTeX maupun simbol matematika di dalam respons AI Co-Pilot ter-render konsisten dengan font KaTeX lokal dan angka/kode dengan `JetBrains Mono` lokal.

---

## 5. Daftar File yang Akan Diubah & Dihapus

| Status | Path File | Ringkasan Perubahan |
| :--- | :--- | :--- |
| **Pasang Paket** | `package.json` | Tambah `@fontsource/plus-jakarta-sans` dan `@fontsource/jetbrains-mono` agar seluruh font lokal ter-bundle offline-ready. |
| **Baru** | `src/components/ui/FormulaText.tsx` | Komponen render rumus berbasis KaTeX lokal (`katex/dist/fonts`) + konversi simbol ke LaTeX yang bersih. |
| **Ubah** | `index.html` & `src/main.tsx` | Hapus CDN `fonts.googleapis.com`, impor lokal `@fontsource/plus-jakarta-sans`, `@fontsource/jetbrains-mono`, dan `katex/dist/katex.min.css`. |
| **Ubah** | `src/types/lab.ts` | Hapus `'math-integral3d'`, `Integral3DParams`, `'lainnya'` dari `CatalogFilter`, dan tambah `primaryLatex?: string` di `ComputedModuleResult`. |
| **Ubah** | `src/data/modules.ts` | Hapus modul `math-integral3d` (menjadi 5 modul). |
| **Ubah** | `src/engines/index.ts`, `physicsInclined.ts`, `physicsCircuit.ts`, `biologyCell.ts`, `mathGeometry3d.ts` | Hapus `math-integral3d` dan lengkapi `primaryLatex` untuk tampilan rumus KaTeX lokal di setiap modul hitungan. |
| **Hapus** | `src/engines/mathIntegral3d.ts`, `src/components/three/scenes/IntegralRiemannScene.tsx` | Menghapus file modul Kalkulus Lanjut beserta scene 3D-nya. |
| **Ubah** | `src/components/three/Module3DCanvas.tsx` & `src/pages/LabWorkspacePage.tsx` | Hapus `math-integral3d` / `IntegralRiemannScene`. |
| **Ubah** | `src/pages/CatalogPage.tsx` | Hapus `math-integral3d`, ubah ke `"5 Modul Terkalibrasi"`, dan hapus tab `Pilihan Lainnya` beserta fitur & modal *Unggah Gambar Materi Buku*. |
| **Ubah** | `src/components/layout/Header.tsx` | Hapus tombol `Lembar Kerja` pada `view === 'catalog'`. |
| **Ubah** | `src/components/layout/PersistentBottomBar.tsx` & `src/App.tsx` | Hapus floating Co-Pilot bar pada `landing` & `catalog`, rapikan padding `App.tsx`, dan gunakan `FormulaText` untuk tampilan rumus di bar bawah. |
| **Ubah** | `src/services/storage.ts` & `src/context/LabContext.tsx` | Pisahkan `recordsByModule` & `notesByModule` per `ModuleId` dengan migrasi aman data lama. |
| **Ubah** | `src/pages/AnalysisCopilotPage.tsx`, `src/components/ui/RichMathMessage.tsx` | Gunakan `FormulaText` untuk kotak persamaan utama & formula chip chat dengan font KaTeX lokal. |
| **Ubah** | `src/pages/WorksheetPage.tsx`, `src/services/exportReport.ts` | Judul modul spesifik, ekspor `.txt` per modul, dan rendering `FormulaText` pada kolom persamaan modul hitungan. |
| **Ubah** | `src/services/geminiCopilot.ts` & `src/engines/engines.test.ts` | Hapus `analyzeTextbookDiagram` & `math-integral3d`, tambah test `primaryLatex` dan isolasi data per modul. |

---

## 6. Langkah Eksekusi (Setelah Plan Disetujui)

1. **Langkah 1 — Font Lokal & Komponen `FormulaText`**: Pasang `@fontsource/plus-jakarta-sans` dan `@fontsource/jetbrains-mono`, perbarui `index.html` & `src/main.tsx`, buat `FormulaText.tsx`, dan perbarui `RichMathMessage.tsx`.
2. **Langkah 2 — Hapus Modul Kalkulus Lanjut & Unggah Gambar Buku**: Bersihkan `math-integral3d` dan fitur `Unggah Gambar Materi Buku` / tab `Pilihan Lainnya` dari `types/lab.ts`, `modules.ts`, `engines/`, `Module3DCanvas.tsx`, `LabWorkspacePage.tsx`, `CatalogPage.tsx`, `geminiCopilot.ts`, dan hapus file engine/scene integral.
3. **Langkah 3 — Pembatasan Co-Pilot & Isolasi Lembar Kerja per Modul**: Hapus Co-Pilot di `landing`/`catalog` (`PersistentBottomBar.tsx`, `App.tsx`), hapus tombol `Lembar Kerja` di `catalog` (`Header.tsx`), dan pisahkan penyimpanan `recordsByModule` + `notesByModule` di `storage.ts` & `LabContext.tsx`.
4. **Langkah 4 — Integrasi Rumus KaTeX & Pembaruan Halaman Analisis/Lembar Kerja**: Lengkapi `primaryLatex` pada 4 engine perhitungan (`physicsInclined`, `physicsCircuit`, `biologyCell`, `mathGeometry3d`) serta terapkan `FormulaText` pada `AnalysisCopilotPage.tsx`, `PersistentBottomBar.tsx`, `WorksheetPage.tsx`, dan perbarui `exportReport.ts`.
5. **Langkah 5 — Pengujian & Verifikasi**: Perbarui `engines.test.ts`, jalankan `npm test`, `npm run lint`, `npm run build`, dan verifikasi visual di browser (memastikan hanya 5 modul tampil, tidak ada unggah gambar buku, tidak ada Co-Pilot/Lembar Kerja di halaman materi, tiap modul punya Lembar Kerja sendiri, dan font KaTeX/lokal rumus tampil rapi).
