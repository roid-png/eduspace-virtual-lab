# Planning Revisi Modul Biologi Sel: Model 3D Sel Tumbuhan, Auto-Zoom Organel, Simulasi Cahaya & Analisis Non-Perhitungan

> **Status Dokumen:** Rancangan lengkap untuk ditinjau dan disetujui pengguna sebelum implementasi kode dimulai.

---

## 1. Masalah Saat Ini & Tujuan Revisi

Berdasarkan kondisi aplikasi saat ini (termasuk pesan sambutan Co-Pilot *Sel Darah & Sel Tumbuhan / FOV*):
1. Modul `biology-cell` masih memakai spesimen ganda (**Sel Tumbuhan & Sel Darah**) dengan geometri prosedural sederhana, fitur **Exploded View** (pemisahan organel), serta perhitungan **Mikroskopi FOV / SA:V** dan grafik kurva.
2. Folder model 3D realistis sudah tersedia di `public/models/plant_cell_-_cell_structure/` (`scene.gltf`, `scene.bin`, `textures/`, `license.txt` oleh *Vida Systems*, lisensi `CC BY-NC-ND 4.0`) dengan **13 bagian organel terpisah dalam node GLTF**:
   - `cell` (Dinding & Membran Sel)
   - `cytoplasm` (Sitoplasma)
   - `nucleus` (Nukleus)
   - `chloroplast.in` & `chloroplast.out` (Kloroplas: membran luar & tilakoid/grana)
   - `vacuole` (Vakuola Sentral)
   - `mitochondria` (Mitokondria)
   - `rough.ER` (Retikulum Endoplasma Kasar)
   - `smooth.ER` (Retikulum Endoplasma Halus)
   - `golgi.appratus` (Badan Golgi)
   - `ribosomes` (Ribosom)
   - `lysosome` (Lisosom)
   - `peroxisome` (Peroksisom)
   - `plasmodesma` (Plasmodesmata)

### Tujuan Revisi (Fase 16):
- **Khusus Sel Tumbuhan saja**: Hapus seluruh referensi, model 3D, UI, dan teks tentang **Sel Darah (Eritrosit / Leukosit)**.
- **Model 3D GLTF & Auto-Zoom Organel (Tanpa Explode / Pemisahan)**: Ganti objek 3D prosedural dengan `plant_cell_-_cell_structure/scene.gltf`. Tidak ada slider `Explode` atau pemisahan bagian. Siswa hanya melakukan **Zoom** (manual via scroll/pinch dan **Auto-Zoom otomatis ke koordinat organel** saat memilih bagian seperti Nukleus, Kloroplas, Vakuola, Mitokondria, dll. baik lewat panel kiri maupun klik langsung pada mesh 3D).
- **Simulasi Kondisi Cahaya (`Terkena Cahaya` vs `Tidak Terkena Cahaya`)**: Tambahkan mode pencahayaan di Simulasi 3D yang memengaruhi visual 3D (sinar foton & aktivitas kloroplas saat terang vs redup/dominasi respirasi mitokondria saat gelap) dan dampaknya dijelaskan lengkap pada tab **Analisis & AI**.
- **Tanpa Perhitungan & Tanpa Grafik**: Hapus semua perhitungan (`FOV`, `SA/V`, perbesaran `M ×`, `ukuran tampak`) dan grafik kurva di modul ini.
- **Hapus AI Co-Pilot di Tab Simulasi 3D**: Ganti dock bawah pada Simulasi 3D (`PersistentBottomBar`) dengan **penjelasan singkat organel & kondisi cahaya Sel Tumbuhan**.
- **Tab `Analisis & AI` Murni Pengamatan + Penjelasan Rinci Tiap Organel + AI Co-Pilot Real-Time**: Menampilkan detail lengkap seluruh struktur sel tumbuhan, efek kondisi cahaya Terang vs Gelap, serta **AI Co-Pilot khusus modul Sel Tumbuhan** yang terhubung langsung (real-time) dengan organel & kondisi cahaya yang sedang diamati siswa dan fleksibel menjawab pertanyaan apa saja tentang sel tumbuhan.

---

## 2. Arsitektur & Perubahan Detail per Bagian

### A. Basis Pengetahuan Sel Tumbuhan (`src/data/plantCellData.ts`)
- **File baru:** `src/data/plantCellData.ts`
- Menyimpan:
  - `PLANT_CELL_MODEL_URL = '/models/plant_cell_-_cell_structure/scene.gltf'`
  - `PLANT_CELL_LICENSE_ATTRIBUTION`: `'Model 3D: "Plant Cell - Cell Structure" (Vida Systems, CC BY-NC-ND 4.0)'`
  - Pemetaan exact GLTF node ke ID organel (`PLANT_CELL_GLTF_NODES`) untuk 13 bagian:
    `semua` (Sel Tumbuhan Utuh), `nucleus` (Nukleus), `chloroplast` (`chloroplast.in` + `chloroplast.out`), `vacuole`, `mitochondria`, `rough-er` (`rough.ER`), `smooth-er` (`smooth.ER`), `golgi` (`golgi.appratus`), `ribosomes`, `lysosome`, `peroxisome`, `plasmodesma`, `cell-wall` (`cell`), `cytoplasm`.
  - Metadata biologis detail SMA Kelas XI untuk setiap organel (`PlantCellOrganelleInfo`):
    - `id`, `name`, `latinName`, `shortLabel`, `category` (`Pelindung & Sitosol` | `Kontrol Genetik` | `Energi & Metabolisme` | `Sistem Endomembran & Transport`)
    - `structureDetail`: deskripsi ultrastruktur rinci (membran, komponen penyusun).
    - `mainFunction`: fungsi fisiologis detail di sel tumbuhan.
    - `lightResponse`: respon khusus organel saat **Terkena Cahaya (Terang)**.
    - `darkResponse`: respon khusus organel saat **Tidak Terkena Cahaya (Gelap)**.
    - `zoomMultiplier`: faktor zoom otomatis kamera optimal sesuai ukuran organel (misal Nukleus `2.1x`, Ribosom `2.8x`, Vakuola `1.7x`, Sel Utuh `1.0x`).
  - Penjelasan perbandingan menyeluruh **`PLANT_CELL_LIGHT_EFFECTS`**:
    - Dampak kondisi **Terkena Cahaya** (aktivasi klorofil, reaksi terang di membran tilakoid menghasilkan ATP & NADPH, siklus Calvin di stroma membentuk glukosa, turgor sel terjaga, pengeluaran $O_2$).
    - Dampak kondisi **Tidak Terkena Cahaya / Gelap** (reaksi fotosintesis berhenti, sel beralih mengandalkan pemecahan pati/glukosa melalui respirasi seluler di **Mitokondria** untuk menyuplai ATP, perubahan aliran metabolit).

### B. Tipe Data & Engine Kualitatif Non-Perhitungan (`src/types/lab.ts`, `src/engines/index.ts`, `src/engines/biologyCell.ts`)
1. Perbarui `CellParams` di `src/types/lab.ts`:
   ```ts
   export type PlantCellLightCondition = 'terang' | 'gelap';

   export type PlantCellOrganelleId =
     | 'semua'
     | 'cell-wall'
     | 'cytoplasm'
     | 'nucleus'
     | 'chloroplast'
     | 'vacuole'
     | 'mitochondria'
     | 'rough-er'
     | 'smooth-er'
     | 'golgi'
     | 'ribosomes'
     | 'lysosome'
     | 'peroxisome'
     | 'plasmodesma';

   export interface CellParams {
     focusOrganelle: PlantCellOrganelleId;
     lightCondition: PlantCellLightCondition;
   }
   ```
   *(Hapus total `specimen: 'tumbuhan' | 'darah'`, `magnification`, dan `exploded`.)*
2. Perbarui `DEFAULT_MODULE_PARAMS['biology-cell']` di `src/engines/index.ts`:
   - `{ focusOrganelle: 'semua', lightCondition: 'terang' }`.
3. Refaktor total `src/engines/biologyCell.ts`:
   - Hapus `calculateCellMicroscopy`, `OCULAR_FIELD_NUMBER_MM`, seluruh rumus FOV/SA:V, dan data grafik kurva.
   - Sediakan resolver biologis deterministik `resolvePlantCellObservation(params: CellParams)` dan `computeCellResult(params: CellParams)` yang mengembalikan ringkasan kualitatif non-perhitungan (`equationTitle: 'Identifikasi Organel & Respon Sel Tumbuhan'`, `calloutPrimary`: nama organel aktif, `calloutSecondary`: kondisi cahaya aktif, `copilotInsight`: ringkasan biologis organel + efek cahaya tanpa angka perhitungan/rumus).

### C. Scene 3D GLTF Sel Tumbuhan + Auto-Zoom Kamera + Simulasi Cahaya (`IsometricStage.tsx`, `CellMicroscopeScene.tsx`, `Module3DCanvas.tsx`)
1. **Tingkatkan `IsometricStage.tsx` dengan Auto-Zoom Target Halus**:
   - Tambahkan prop opsional `cameraFocus?: { target: [number, number, number]; zoomMultiplier: number } | null` di `IsometricStageProps` & `CameraController`.
   - Saat `cameraFocus` berubah (misal siswa memilih **Nukleus** atau **Kloroplas**), `useFrame` di `CameraController` melakukan interpolasi halus (`THREE.MathUtils.lerp`) pada `ctrl.target` menuju koordinat tengah dunia organel tersebut serta mengubah `orthoCam.zoom` secara halus (`responsiveZoom * cameraFocus.zoomMultiplier`), dan otomatis berhenti me-lerp saat user menggeser/scroll manual (`onStart` di `OrbitControls`) atau saat target tercapai — sehingga user tetap bebas **memutar & zoom manual kapan saja**!
   - Naikkan batas `maxZoom` pada `OrbitControls` (misal `responsiveZoom * 4.0`) agar organel kecil seperti Ribosom/Peroksisom/Mitokondria bisa di-zoom dekat dengan jelas.
2. **Bangun ulang `src/components/three/scenes/CellMicroscopeScene.tsx`**:
   - Muat `/models/plant_cell_-_cell_structure/scene.gltf` memakai `useGLTF` dalam `<Suspense>` (beserta fallback ringkas saat loading).
   - Normalisasi skala & posisi root GLTF via `THREE.Box3().setFromObject(...)` agar seluruh sel pas di atas alas preparat panggung isometrik (`scale` otomatis sekitar lebar `3.8` unit).
   - **Interaktivitas Klik Langsung & Sorotan Organel (Tanpa Explode)**:
     - Kloning material tiap mesh secara aman (seperti pola `HumanAnatomyScene.tsx`).
     - Tidak ada pergeseran/pemisahan posisi mesh (`explodeOffset` dihapus).
     - Saat siswa mengklik mesh organel di model 3D atau memilih di panel kiri (`focusOrganelle !== 'semua'`):
       - Organel terpilih disorot jelas (emissive highlight lembut `#0E5A63` / emas hangat),
       - Lapisan luar (`cell` & `cytoplasm`) otomatis dibuat semi-transparan tipis bila organel target berada di bagian dalam sel agar inti sel/organel dalam terlihat jernih,
       - Menghitung bounding-box tengah organel terpilih secara dinamis dan memanggil callback `onCameraFocusChange({ target, zoomMultiplier })` sehingga kamera otomatis zoom menuju organel tersebut!
     - Tampilkan `CalloutPin` terkalibrasi pada organel yang relevan (atau menyorot pin organel yang dipilih saat mode fokus aktif).
   - **Visualisasi Simulasi Cahaya (`lightCondition: 'terang' | 'gelap'`)**:
     - Saat **`Terkena Cahaya (Terang)`**: `directionalLight` hangat mengarah ke sel, berkas sinar lembut & partikel foton kuning-hijau bergerak turun menuju area Kloroplas, serta node `chloroplast.in`/`chloroplast.out` memancarkan pendar hijau fotosintesis lembut.
     - Saat **`Tidak Terkena Cahaya (Gelap)`**: cahaya utama meredup bernuansa redup/teduh, berkas foton & pendar kloroplas padam, sedangkan node `mitochondria` memancarkan denyut emissive hangat halus sebagai penanda respirasi seluler dominan saat gelap!

### D. Kontrol Workspace 3D & Dock Bawah Tanpa AI Co-Pilot (`LabWorkspacePage.tsx`, `PlantCellBottomPanel.tsx`, `PersistentBottomBar.tsx`)
1. Perbarui `case 'biology-cell'` di `src/pages/LabWorkspacePage.tsx`:
   - **Kondisi Cahaya**: `TactileSegmented` **`Terkena Cahaya (Terang)`** | **`Tidak Terkena Cahaya (Gelap)`** dengan keterangan efek singkat.
   - **Pilih Organel (Auto-Zoom 3D)**: Daftar tombol/grid seluruh organel utama Sel Tumbuhan (Utuh / Semua, Dinding & Membran Sel, Sitoplasma, Nukleus, Kloroplas, Vakuola Sentral, Mitokondria, RE Kasar, RE Halus, Badan Golgi, Ribosom, Lisosom, Peroksisom, Plasmodesmata) — mengklik salah satunya langsung menggerakkan kamera **auto-zoom ke objek tersebut**.
   - **Hapus total** kontrol Jenis Spesimen (Sel Darah), slider Perbesaran (`M ×`), dan slider `Pemisahan Organel (Explode)`.
   - Tampilkan kotak petunjuk **Zoom Manual & Klik Organel 3D** + atribusi lisensi `PLANT_CELL_LICENSE_ATTRIBUTION` di pojok kiri bawah kanvas 3D.
   - Sesuaikan teks tombol aksi di panel kiri bila `biology-cell`: `"Putar Efek Cahaya & Metabolisme"` / `"Jeda Efek Simulasi"` (menggerakkan animasi foton/denyut organel, bukan rotasi cepat spesimen).
2. Buat **`src/components/layout/PlantCellBottomPanel.tsx`** & pasang di `src/components/layout/PersistentBottomBar.tsx`:
   - Saat `view === 'workspace' && activeModuleId === 'biology-cell'`, **AI Co-Pilot dihapus dari tampilan Simulasi 3D** dan diganti panel 2 kolom bebas perhitungan:
     - **Kiri**: Identitas organel terpilih (Nama + Latin + Kategori) + deskripsi struktur singkat + pemilih cepat beberapa organel kunci.
     - **Kanan**: Penjelasan fungsi fisiologis organel pada Sel Tumbuhan dan dampaknya pada kondisi cahaya aktif (**Terang** vs **Gelap**) + tombol `"Buka Analisis & AI →"`.

### E. Tab `Analisis & AI` Murni Pengamatan + Penjelasan Rinci + Co-Pilot Real-Time (`PlantCellAnalysisView.tsx`, `AnalysisCopilotPage.tsx`, `geminiCopilot.ts`, `modules.ts`)
1. Buat **`src/components/analysis/PlantCellAnalysisView.tsx`** dan hubungkan ke `src/pages/AnalysisCopilotPage.tsx` saat `activeModuleId === 'biology-cell'`:
   - **Tanpa Grafik & Tanpa Perhitungan**: Tidak memanggil `ResponseChartSvg`, tidak menampilkan `FormulaText` / angka FOV / SA:V.
   - **Kolom Kiri (Hasil Pengamatan & Penjelasan Rinci Organel)**:
     1. *Guided 4-Step Tracker* eksplorasi sel tumbuhan.
     2. **Panel Pengamatan Aktif & Efek Cahaya**: Menampilkan status cahaya saat ini (`Terkena Cahaya` vs `Tidak Terkena Cahaya`) beserta penjelasan menyeluruh mekanisme perubahan aktivitas sel tumbuhan (Fotosintesis Kloroplas di Terang vs Respirasi Mitokondria & Konservasi Energi di Gelap), lengkap dengan tombol switch cepat `Bandingkan Terang vs Gelap` tanpa harus bolak-balik!
     3. **Penjelasan Detail Organel Terpilih**: Uraian ultrastruktur mendalam, fungsi utama di tingkat seluler SMA Kelas XI, serta tabel perbandingan langsung respon organel tersebut saat Terang vs Gelap.
     4. **Eksplorasi Cepat 13 Organel Sel Tumbuhan**: Kartu pilih ringkas seluruh bagian sel yang ada di model 3D (`Nukleus`, `Kloroplas`, `Vakuola`, `Mitokondria`, `RE Kasar`, `RE Halus`, `Golgi`, `Ribosom`, `Lisosom`, `Peroksisom`, `Plasmodesmata`, `Dinding & Membran Sel`, `Sitoplasma`) sehingga siswa bisa meninjau penjelasan rinci tiap organel satu per satu.
   - **Kolom Kanan (AI Co-Pilot Khusus Sel Tumbuhan Real-Time)**:
     - Menggunakan `<CopilotChatPanel />` dengan badge `Gemini Flash` / `Mode Lokal`.
     - Context pill real-time: `Membaca: {namaOrganel} · Kondisi {Terkena Cahaya / Gelap}` (tidak pernah menampilkan *Sel Darah* atau *FOV*).
     - Menyediakan *quick actions* kontekstual & dinamis yang menyertakan organel yang sedang diamati siswa (misal `"🔍 Detail struktur & fungsi {namaOrganel}"`, `"☀️ Pengaruh cahaya terang vs gelap pada sel"`, `"🌿 Peran Kloroplas, Vakuola & Dinding Sel"`, `"📝 Uji pemahaman / kuis organel sel"`), serta kolom chat bebas agar siswa bisa bertanya tentang objek apa pun secara langsung real-time dan berganti-ganti pertanyaan.
2. Perbarui `src/services/geminiCopilot.ts`:
   - Tambah `cellParams?: CellParams` di `CopilotContextPayload` (dioper dari `LabContext.tsx`).
   - Buat `systemInstruction` khusus `biology-cell` yang secara eksplisit melarang materi Sel Darah maupun perhitungan FOV/SA:V, dan menyuntikkan konteks real-time organel yang sedang dizoom (`structureDetail`, `mainFunction`, `lightResponse`, `darkResponse`) serta kondisi cahaya (`Terkena Cahaya` vs `Tidak Terkena Cahaya`).
   - Perbarui `buildDeterministicFallback` khusus `biology-cell` agar dapat menjawab pertanyaan apa pun tentang semua 13 organel tumbuhan (Nukleus, Kloroplas, Mitokondria, Vakuola, RE Kasar/Halus, Badan Golgi, Ribosom, Lisosom, Peroksisom, Plasmodesmata, Dinding Sel, Sitoplasma) dan perbedaan kondisi Terang vs Gelap secara detail dan tepat sasaran.
   - Perbarui pesan sambutan awal (`chatMessages` di `LabContext.tsx`) agar khusus `biology-cell` menyapa sebagai Co-Pilot **Struktur & Organel Sel Tumbuhan** (tanpa angka FOV, tanpa Exploded, tanpa Sel Darah!).

### F. Pembaruan `modules.ts`, `worksheetTemplates.ts`, `PersistentBottomBar.tsx`, `exportReport.ts`, & `engines.test.ts`
- **`src/data/modules.ts`**: Ubah kartu modul `biology-cell` menjadi `Struktur & Organel Sel Tumbuhan` (`previewBadge: 'Model 3D Organel · Terang/Gelap'`, `constantBadge: '13 Organel Sel Tumbuhan'`, hapus seluruh kata *Sel Darah* & *Exploded View*).
- **`src/context/LabContext.tsx`**: Tambahkan `'lightCondition'` dan `'focusOrganelle'` di `isDiscretePatch` untuk `biology-cell` (plus kirim `cellParams` ke `askCopilot` dan pesan sambutan bebas perhitungan).
- **`src/data/worksheetTemplates.ts` & `src/pages/WorksheetPage.tsx` & `src/services/exportReport.ts` & `src/components/layout/PersistentBottomBar.tsx`**:
  - Jadikan `biology-cell` memakai tata letak observasi kualitatif (tanpa nilai numerik/rumus/FOV): kolom `Organel & Kondisi Cahaya` | `Bagian Sel yang Diamati` | `Fungsi & Respon Cahaya` (dengan menyertakan atribut `PLANT_CELL_LICENSE_ATTRIBUTION` saat ekspor).
- **`src/engines/engines.test.ts`**: Ganti pengujian `FOV`/`tumbuhan vs darah` pada `biology-cell` dengan pengujian `resolvePlantCellObservation` & `computeCellResult` (memverifikasi 13 organel sel tumbuhan, efek `terang` vs `gelap`, ketiadaan teks `Sel Darah` / `FOV`, serta item lembar kerja kualitatif).

---

## 3. Rencana Tahapan Implementasi (Fase 16)

- **16.1** Buat `src/data/plantCellData.ts` (pemetaan 13 node GLTF + deskripsi rinci & respon Terang/Gelap + atribusi lisensi) dan perbarui `CellParams` (`src/types/lab.ts`), `DEFAULT_MODULE_PARAMS` (`src/engines/index.ts`), serta refaktor total `src/engines/biologyCell.ts` tanpa perhitungan maupun Sel Darah.
- **16.2** Tingkatkan `IsometricStage.tsx` (dukungan `cameraFocus` smooth auto-zoom & `maxZoom`), bangun ulang `CellMicroscopeScene.tsx` memakai `/models/plant_cell_-_cell_structure/scene.gltf` (klik 3D, auto-zoom organel, efek cahaya Terang vs Gelap, tanpa Explode), dan sambungkan di `Module3DCanvas.tsx`.
- **16.3** Perbarui panel kontrol `biology-cell` di `LabWorkspacePage.tsx` (pemilih organel auto-zoom + kondisi cahaya Terang/Gelap, tanpa Sel Darah/Explode/FOV), buat `PlantCellBottomPanel.tsx`, dan pasang ke `PersistentBottomBar.tsx` (hapus AI Co-Pilot di Simulasi 3D).
- **16.4** Buat `PlantCellAnalysisView.tsx` (murni pengamatan, penjelasan detail 13 organel + dampak Terang vs Gelap, tanpa grafik & tanpa perhitungan, disertai `<CopilotChatPanel />` real-time) dan integrasikan di `AnalysisCopilotPage.tsx` + perbarui `geminiCopilot.ts` & `LabContext.tsx`.
- **16.5** Perbarui `modules.ts`, `worksheetTemplates.ts`, `WorksheetPage.tsx`, `exportReport.ts`, dan `engines.test.ts`; jalankan `npm test`, `npm run lint`, `npm run build`, serta verifikasi visual browser langsung (uji auto-zoom nukleus & organel lain, simulasi Terang vs Gelap, tab Analisis & AI bebas grafik/perhitungan dengan Co-Pilot real-time, dan Lembar Kerja).
