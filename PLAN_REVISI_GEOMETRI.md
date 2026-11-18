# PLAN REVISI MODUL GEOMETRI: TRANSFORMASI GEOMETRI & LINGKARAN (KELAS XI KURIKULUM MERDEKA)

> **Status Dokumen:** Rancangan lengkap untuk ditinjau dan disetujui pengguna. Belum ada kode aplikasi yang diubah sebelum rencana ini disetujui.

---

## 1. Tujuan & Prinsip Desain

Memperbarui modul Matematika (`math-geometry3d`) yang sebelumnya bertema **Geometri Ruang Dimensi Tiga** (kubus `ABCD.EFGH`) menjadi modul **Transformasi Geometri & Lingkaran (Matematika SMA Kelas XI Kurikulum Merdeka)** dengan tetap mempertahankan:
- **Gaya Visual:** *Soft Tactile Neumorphism 3 Warna* (`#EFECE4` / `#F6F3EC` / `#E3DED2`, `#23272A` / `#5C6064`, dan aksen tunggal `#0E5A63`).
- **Tipografi & Rumus:** Seluruh perhitungan, matriks $2\times 2$, pecahan, akar, dan notasi sudut dirender dengan font lokal bundled (`Plus Jakarta Sans`, `JetBrains Mono`, dan font matematika lokal `KaTeX` melalui komponen `FormulaText`).
- **Arsitektur Bersih & Fokus:** Menghindari fitur berlebihan dan menjaga 4 modul lainnya tetap utuh.

---

## 2. Cakupan Revisi Mendetail

### A. Pembaruan Identitas Modul & 2 Sub-Mode (`Simulasi 3D`)

1. **Identitas & State Registry:**
   - Pertahankan key `ModuleId` `'math-geometry3d'` pada tipe registry agar kompatibel dengan arsitektur routing dan penyimpanan lokal per modul, namun perbarui seluruh label tampilan UI di `src/data/modules.ts`:
     - `title`: `'Transformasi Geometri & Lingkaran'`
     - `shortTitle`: `'Matematika: Transformasi & Lingkaran'`
     - `categoryLabel`: `'Matematika Kelas XI'`
     - `previewBadge`: `'Matriks 2×2 · Busur & Juring'`
     - `stageTag`: `'MODUL MATEMATIKA • TRANSFORMASI & LINGKARAN'`
     - `constantBadge`: `'Kurikulum Merdeka · R²'`
   - Sanitasi riwayat `localStorage` lama bertema kubus (`BDG`, `P → BD`, `rusuk`) di `src/services/storage.ts` pada bucket `'math-geometry3d'` agar data lama tidak tercampur dengan modul baru.

2. **Penyesuaian Panel `Variabel Simulasi` (Sidebar Kiri di `LabWorkspacePage.tsx`):**
   - Seluruh kontrol lama kubus Dimensi Tiga (`Mode Kasus P → BD / P → BDG / Sudut`, `Panjang Rusuk s`, `Posisi Titik t`) **diganti total** menjadi kontrol dinamis yang menyesuaikan sub-mode & materi baru yang dipilih siswa:
   - **Pemilih Utama Sub-Mode** (`TactileSegmented`): **`Transformasi Geometri`** | **`Lingkaran`**.

3. **Sub-Mode 1 — Transformasi Geometri (`subMode: 'transformasi'`):**
   - Kontrol di Panel `Variabel Simulasi`:
     - Segmented **`Jenis Transformasi`**: **`Translasi`** | **`Refleksi`** | **`Rotasi`** | **`Dilatasi`**.
     - **Kontrol Dinamis sesuai Jenis Transformasi:**
       - **Translasi** (`transformType: 'translasi'`): slider komponen geser $a$ (`tx`: $-5$ s.d. $+5$, step $0.5$) dan $b$ (`ty`: $-5$ s.d. $+5$, step $0.5$).
       - **Refleksi** (`transformType: 'refleksi'`): segmented garis cermin **`Sumbu X`** | **`Sumbu Y`** | **`y = x`** | **`y = -x`**.
       - **Rotasi** (`transformType: 'rotasi'`): slider sudut putar $\alpha$ ($-180^\circ$ s.d. $+180^\circ$, step $15^\circ$, pusat $O(0,0)$).
       - **Dilatasi** (`transformType: 'dilatasi'`): slider faktor skala $k$ ($0.5$ s.d. $2.5$, step $0.25$, pusat $O(0,0)$).
     - **Slider Posisi Titik Awal $A(x_A, y_A)$**: slider **`Absis Titik A (x)`** ($-3$ s.d. $+3$, step $0.5$) dan **`Ordinat Titik A (y)`** ($-3$ s.d. $+3$, step $0.5$) yang menggeser posisi segitiga awal $ABC$ di kuadran Kartesius sehingga siswa dapat menguji transformasi dari titik awal mana saja.
   - **Objek Uji & Visualisasi Kartesius 3D Isometrik:**
     - Bidang koordinat Kartesius 3D (`x ∈ [-8, 8]`, `y ∈ [-8, 8]`) dengan sumbu $X$ dan $Y$ jelas di atas papan matte.
     - Bangun datar **Objek Awal** berupa segitiga non-simetris agar arah pencerminan & rotasi tampak tegas: bertitik acuan $A(x_A, y_A)$, $B(x_A + 3, y_A)$, $C(x_A + 1, y_A + 2)$ (luas awal tetap $3\text{ satuan}^2$), dirender dengan warna netral `#5C6064` / `#E3DED2`.
     - Bangun **Objek Bayangan** ($A'B'C'$) dirender menonjol dengan aksen `#0E5A63` (plus ketebalan prismatik tipis agar tampak tajam di kamera isometrik).
     - **Garis Bantu Spasial:**
       - Translasi: vektor perpindahan berpanah dari $A \to A'$ dan $C \to C'$.
       - Refleksi: garis sumbu cermin berwarna kontras + garis proyeksi tegak lurus putus-putus antara $A$ dan $A'$.
       - Rotasi: busur sudut rotasi $\alpha$ berpusat di $O(0,0)$ dari jari-jari $OA$ ke $OA'$.
       - Dilatasi: garis sinar proyeksi dari $O(0,0)$ menembus titik asal hingga bayangan.
     - **`CalloutPin` terkalibrasi:** Menunjuk ke titik uji utama **`A(x, y)`** dan bayangannya **`A'(x', y')`** dengan `labelOffset` dan arah panah agar tidak bertumpuk.

4. **Sub-Mode 2 — Lingkaran (`subMode: 'lingkaran'`):**
   - Kontrol di Panel `Variabel Simulasi`:
     - Slider **Jari-jari Lingkaran** ($r$: $2.0$ s.d. $6.0\text{ cm}$, step $0.5$).
     - Slider **Sudut Pusat** ($\theta$: $30^\circ$ s.d. $300^\circ$, step $10^\circ$).
     - Switch **Tampilkan Garis Singgung** (`showTangent: boolean`) + Slider **Jarak Titik Luar ke Pusat ($OP$)** (`externalDistanceOffset`: $+1.5$ s.d. $+6.0\text{ cm}$ di atas $r$, muncul otomatis saat Garis Singgung aktif) sehingga panjang garis singgung $PT = \sqrt{OP^2 - r^2}$ berubah real-time.
     - Switch **Tampilkan Tali Busur & Sudut Keliling** (`showChord: boolean`).
   - **Visualisasi Cakram Lingkaran 3D Isometrik:**
     - Cakram lingkaran 3D presisi berpusat di $O(0,0)$ lengkap dengan garis jari-jari $OA$ dan $OB$.
     - **Sektor Juring** menyala dengan aksen `#0E5A63` semi-transparan bertingkat tipis agar menonjol secara 3D.
     - **Panjang Busur $AB$** berupa kurva tebal menyala di tepi lingkaran.
     - Bila `showChord === true`: **Tali Busur $AB$** (segmen garis lurus antara $A$ dan $B$) + titik $C$ pada busur mayor beserta segmen $CA$ dan $CB$ yang memperlihatkan **Sudut Keliling ($\theta/2$)** berhadapan langsung dengan busur yang sama!
     - Bila `showTangent === true`: titik singgung $T$ pada lingkaran, segmen jari-jari $OT$, **simbol siku-siku $90^\circ$** di $T$, dan **Garis Singgung $PT$** yang menyentuh tepat satu titik hingga titik luar $P$.
     - `CalloutPin` & `DimensionLine3D` menampilkan `r`, `θ`, `Busur s`, `θ/2`, dan `Garis Singgung PT`.

---

### B. Revisi Bar Bawah pada Tab `Simulasi 3D` (Hapus AI Co-Pilot)

- Buat komponen **`src/components/layout/GeometryBottomPanel.tsx`** dan pasang pada `src/components/layout/PersistentBottomBar.tsx` saat `view === 'workspace' && activeModuleId === 'math-geometry3d'`.
- **AI Co-Pilot dihapus sepenuhnya dari halaman `Simulasi 3D`** untuk modul Geometri ini (kolom input dan ringkasan AI tidak ditampilkan di dock bawah).
- **Tata Letak 2 Kolom Dock Bawah:**
  - **Kolom Kiri (`Rumus Ringkas Aktif`):** Menampilkan rumus utama aktif menggunakan `FormulaText` (KaTeX lokal) dan 3 chip angka hasil ringkas:
    - Mode Transformasi: Persamaan matriks $2\times 2$ / translasi pada $A(x,y) \to A'(x',y')$, determinan $|\det(M)|$, serta perbandingan luas awal vs bayangan.
    - Mode Lingkaran: Rumus Panjang Busur / Luas Juring aktif, Sudut Keliling $\theta/2$, dan Panjang Garis Singgung $PT$.
  - **Kolom Kanan (`Panel Penjelasan Sifat & Komponen Geometri Real-Time`):** Menjelaskan secara otomatis perubahan geometris sesuai slider yang sedang digeser siswa (sifat kongruen vs sebangun, arah pencerminan/rotasi, hubungan sudut pusat $= 2\times$ sudut keliling, atau sifat garis singgung selalu tegak lurus jari-jari di titik singgung) + tombol `"Buka Analisis & AI →"`.

---

### C. Revisi Tab `Analisis & AI` (Hapus Grafik → Detailing Rumus + AI Co-Pilot Kontekstual)

- Buat komponen **`src/components/analysis/GeometryAnalysisView.tsx`** dan sambungkan di `src/pages/AnalysisCopilotPage.tsx` ketika `activeModuleId === 'math-geometry3d'`.
- **Kolom Kiri (Tanpa Grafik Garis → Panel *Detailing* Rumus & Langkah Perhitungan KaTeX):**
  - *4-Step Guided Task Tracker* yang disesuaikan untuk eksplorasi Transformasi Geometri & Lingkaran.
  - Ringkasan hasil utama (`FormulaText`) + metrik kunci (tanpa memanggil `ResponseChartSvg`).
  - **Langkah Perhitungan Rinci (KaTeX Lokal):**
    - Jika **Transformasi Geometri**:
      1. Identifikasi matriks transformasi $M_{2\times 2}$ atau vektor geser $\begin{pmatrix} a \\ b \end{pmatrix}$.
      2. Penjabaran perkalian matriks / operasi aljabar pada **ke-3 titik sudut objek** ($A \to A'$, $B \to B'$, $C \to C'$) lengkap dengan substitusi angka nyata.
      3. Perhitungan determinan $|\det(M)|$ dan luas bayangan: $L_{\text{bayangan}} = |\det(M)| \times L_{\text{awal}}$ beserta kesimpulan sifat (kongruen jika $|\det(M)| = 1$, sebangun jika $|\det(M)| \neq 1$).
    - Jika **Lingkaran**:
      1. Langkah perhitungan **Panjang Busur**: $s = \frac{\theta}{360^\circ} \cdot 2\pi r$.
      2. Langkah perhitungan **Luas Juring**: $L_{\text{juring}} = \frac{\theta}{360^\circ} \cdot \pi r^2$.
      3. Langkah perhitungan **Sudut Keliling** ($\alpha = \frac{1}{2}\theta$) dan **Panjang Tali Busur** ($c = 2r\sin(\theta/2)$).
      4. Langkah perhitungan **Panjang Garis Singgung** dari titik luar $P$: $PT = \sqrt{OP^2 - r^2}$ disertai pembuktian siku-siku $OT \perp PT$.
- **Kolom Kanan (`AI Co-Pilot Laboratorium`):**
  - Menggunakan `<CopilotChatPanel />` (status `Gemini Flash` / `Mode Lokal` + konteks parameter aktif real-time).
  - 4 tombol *quick actions* kontekstual di `src/data/modules.ts`:
    - `'🔢 Cara Baca Matriks Transformasi 2×2'`
    - `'📐 Mengapa Luas = |det(M)| × Luas Awal?'`
    - `'⭕ Hubungan Sudut Pusat vs Sudut Keliling'`
    - `'📏 Pembuktian Garis Singgung 90° (Pythagoras)'`
  - Pembaruan `src/services/geminiCopilot.ts` (`geometryParams` di `CopilotContextPayload`, `systemInstruction` khusus Transformasi Geometri & Lingkaran Kelas XI Kurikulum Merdeka, serta cabang `buildDeterministicFallback` khusus untuk pertanyaan matriks, translasi, refleksi, rotasi, dilatasi, determinan luas, busur, juring, sudut keliling, tali busur, dan garis singgung).

---

### D. Revisi Tab `Lembar Kerja` (`Catat Data`)

- Memperbarui konfigurasi `WORKSHEET_CONFIG_BY_MODULE['math-geometry3d']` dan builder `createExploredItemFromModuleState` di `src/data/worksheetTemplates.ts`:
  - `pickerTitle`: `'Pilih Variasi Transformasi & Lingkaran 3D'`
  - `col1Label`: `'Sub-Mode & Parameter Input'`
  - `col2Label`: `'Koordinat Bayangan / Sifat Lingkaran'`
  - `summaryHeaderPrefix`: `'RANGKUMAN TRANSFORMASI GEOMETRI & LINGKARAN'`
- Format penyimpanan item observasi (`Catat Data` dan pemilih rangkuman):
  - **Transformasi Geometri**: mencatat jenis transformasi, nilai parameter ($a,b$ / cermin / $\alpha$ / $k$), perpindahan koordinat $A(x,y) \to A'(x',y')$, determinan $|\det(M)|$, serta luas bayangan dalam kolom input, output, dan persamaan KaTeX (`formulaLatex`).
  - **Lingkaran**: mencatat $r$, $\theta$, jarak titik luar $OP$, hasil panjang busur $s$, luas juring, sudut keliling $\theta/2$, panjang tali busur, dan panjang garis singgung $PT$.
- Memastikan seluruh perubahan parameter diskrit (`subMode`, `transformType`, `reflectionAxis`, `showTangent`, `showChord`) terekam seketika melalui `isDiscretePatch` di `src/context/LabContext.tsx`.

---

## 3. Struktur State & File yang Terdampak

### File Baru yang Akan Dibuat
1. `src/components/layout/GeometryBottomPanel.tsx` — Bar bawah 2 kolom di Simulasi 3D (rumus KaTeX + panel sifat & komponen geometri real-time, tanpa AI Co-Pilot).
2. `src/components/analysis/GeometryAnalysisView.tsx` — Halaman tab `Analisis & AI` khusus Transformasi Geometri & Lingkaran (kolom kiri *detailing* rumus & langkah KaTeX tanpa grafik; kolom kanan `CopilotChatPanel` terhubung konteks modul).

### Struktur State Baru (`src/types/lab.ts`)
```ts
export type GeometrySubMode = 'transformasi' | 'lingkaran';
export type TransformType = 'translasi' | 'refleksi' | 'rotasi' | 'dilatasi';
export type ReflectionAxis = 'sumbu-x' | 'sumbu-y' | 'y=x' | 'y=-x';

export interface Geometry3DParams {
  subMode: GeometrySubMode;
  // Sub-mode 1: Transformasi Geometri
  transformType: TransformType;
  pointAx: number;
  pointAy: number;
  tx: number;
  ty: number;
  reflectionAxis: ReflectionAxis;
  rotationDeg: number;
  dilationScale: number;
  // Sub-mode 2: Lingkaran
  radius: number;
  centralAngleDeg: number;
  externalDistanceOffset: number;
  showTangent: boolean;
  showChord: boolean;
}
```

### File Existing yang Akan Diperbarui
- `src/types/lab.ts` — Definisi `Geometry3DParams` dan tipe pendukung baru.
- `src/engines/index.ts` — Pembaruan `DEFAULT_MODULE_PARAMS['math-geometry3d']`.
- `src/engines/mathGeometry3d.ts` — Engine deterministik lengkap Transformasi Geometri (matriks $2\times 2$, titik bayangan $A'B'C'$, determinan, luas) dan Lingkaran (busur, juring, sudut keliling, tali busur, garis singgung) + helper `buildGeometryAnalysisDetails` & `computeGeometry3DResult`.
- `src/components/three/scenes/Geometry3DScene.tsx` — Adegan 3D Kartesius (Objek Awal vs Bayangan `#0E5A63`, garis cermin/vektor/busur rotasi/sinar dilatasi) dan ade­gan 3D Lingkaran (juring menyala, busur, tali busur, sudut keliling, garis singgung $90^\circ$).
- `src/pages/LabWorkspacePage.tsx` — Kontrol Sidebar Kiri untuk 2 sub-mode (`Transformasi Geometri` | `Lingkaran`) beserta slider & toggle masing-masing.
- `src/components/layout/PersistentBottomBar.tsx` — Menghapus AI Co-Pilot pada dock bawah `Simulasi 3D` untuk `'math-geometry3d'` dengan mengembalikan `<GeometryBottomPanel />`.
- `src/pages/AnalysisCopilotPage.tsx` — Merender `<GeometryAnalysisView />` saat `activeModuleId === 'math-geometry3d'`.
- `src/data/modules.ts` — Identitas modul baru **"Transformasi Geometri & Lingkaran"**, 4 *guided steps*, dan 4 *quick actions* baru.
- `src/context/LabContext.tsx` — Penambahan key diskrit (`subMode`, `transformType`, `reflectionAxis`, `showTangent`, `showChord`) pada `isDiscretePatch`, pengiriman `geometryParams` ke `askCopilot`, dan pesan sambutan khusus modul.
- `src/services/geminiCopilot.ts` — Konteks *system instruction* dan *deterministic fallback* khusus Transformasi Geometri & Lingkaran Kelas XI.
- `src/data/worksheetTemplates.ts` & `src/services/storage.ts` — Konfigurasi Lembar Kerja, format ringkasan & `Catat Data` baru, serta filter pembersih riwayat dimensi tiga lama di `localStorage`.
- `src/engines/engines.test.ts` — Pembaruan unit test untuk menguji keakuratan Transformasi Geometri (Translasi, Refleksi, Rotasi, Dilatasi, determinan & luas) serta Lingkaran (busur, juring, sudut keliling, tali busur, garis singgung) dan `worksheetTemplates`.

---

## 4. Langkah Eksekusi Bertahap (Setelah Disetujui)

1. **Tahap 1 — Data Model & Engine Deterministik:** Perbarui `src/types/lab.ts`, `src/engines/index.ts`, dan bangun ulang `src/engines/mathGeometry3d.ts`.
2. **Tahap 2 — Visualisasi 3D Isometrik:** Bangun ulang `src/components/three/scenes/Geometry3DScene.tsx` untuk sub-mode Kartesius Transformasi Geometri dan sub-mode Cakram Lingkaran lengkap dengan `CalloutPin` dan `DimensionLine3D` yang rapi.
3. **Tahap 3 — Kontrol Workspace & Dock Bawah Tanpa Co-Pilot:** Perbarui Sidebar Kiri di `src/pages/LabWorkspacePage.tsx`, buat `src/components/layout/GeometryBottomPanel.tsx`, dan pasang pada `src/components/layout/PersistentBottomBar.tsx`.
4. **Tahap 4 — Halaman `Analisis & AI` & Konteks AI Co-Pilot:** Buat `src/components/analysis/GeometryAnalysisView.tsx`, hubungkan di `src/pages/AnalysisCopilotPage.tsx`, serta perbarui `src/data/modules.ts`, `src/context/LabContext.tsx`, dan `src/services/geminiCopilot.ts`.
5. **Tahap 5 — Lembar Kerja & Verifikasi Menyeluruh:** Perbarui `src/data/worksheetTemplates.ts`, `src/services/storage.ts`, `src/engines/engines.test.ts`, serta perbarui `TASKS.md`; jalankan `npm test`, `npm run lint`, `npm run build`, dan uji interaksi langsung di browser.
