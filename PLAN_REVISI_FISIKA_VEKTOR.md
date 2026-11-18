# PLAN_REVISI_FISIKA_VEKTOR.md — Rencana Revisi Menyeluruh Modul Fisika: Bidang Miring & Vektor Gaya

Dokumen ini merancang pembaruan komprehensif untuk modul **Fisika: Bidang Miring & Vektor Gaya** (`physics-inclined`) di **EDUSPACE** mencakup:
1. **2 Mode Simulasi Objek 3D Prosedural (`Barang/Peti` & `Bukit & Mobil`) + Lingkungan Dunia Nyata Perbukitan + Animasi Koefisien Gesek ($\mu$)**.
2. **Variabel Simulasi Lengkap ($h$, $W$, $m$, $\theta$, $\mu$)** yang saling tersinkronisasi secara matematis.
3. **Perbaikan Arah Garis Penunjuk Label (`CalloutPin` & `DimensionLine3D`)** agar tidak menempel atau bertumpuk di atas bidang/objek.
4. **Penghapusan AI Co-Pilot Khusus Modul Fisika Vektor**, diganti dengan **Panel Rumus Lengkap, Penjelasan Detail Simulasi, & Hukum II Newton** di Bar Bawah dan Kolom Kanan Halaman Analisis.
5. **Grafik Analisis Beranimasi Bergerak dengan Variasi Kurva (`a(θ)`, `F(θ)`, `a(μ)`) serta Penjabaran Langkah-demi-Langkah Berbasis Font Matematika (`KaTeX`) yang Sederhana & Mudah Dimengerti**.

> **Prinsip Desain & Aturan Eksekusi:**
> - Tetap mempertahankan **Soft Tactile Neumorphism 3 Warna** (`#EFECE4`/`#F6F3EC`/`#E3DED2`, `#23272A`/`#5C6064`, `#0E5A63`).
> - Menggunakan font lokal ter-bundle (`Plus Jakarta Sans`, `JetBrains Mono`, `KaTeX`).
> - Modul lain (`physics-circuit`, `biology-anatomy`, `biology-cell`, `math-geometry3d`) tetap dipertahankan utuh tanpa regresi.
> - **TIDAK mengeksekusi perubahan kode sebelum perencanaan ini disetujui pengguna.**

---

## 1. Pembaruan State & Variabel Simulasi Lengkap (`src/types/lab.ts` & `src/engines/physicsInclined.ts`)

### 1.1 Struktur Parameter Baru (`InclinedParams`)
```ts
export type InclinedObjectType = 'barang' | 'mobil';

export interface InclinedParams {
  /** Jenis simulasi objek & lintasan: 'barang' (peti di bidang miring) | 'mobil' (mobil di lereng bukit) */
  objectType: InclinedObjectType;
  /** Sudut kemiringan bidang/lereng bukit (derajat, 0° - 60°) */
  theta: number;
  /** Massa benda/mobil (kg, 1.0 - 10.0 kg) */
  mass: number;
  /** Koefisien gesek permukaan (0.00 licin - 1.00 kasar) */
  mu: number;
  /** Panjang lintasan miring acuan L (meter, default 6.0 m) — dipakai untuk relasi eksak h = L·sin(θ) */
  rampLengthMeters: number;
}
```

### 1.2 Sinkronisasi Lengkap Variabel $h$, $W$, $m$, $\theta$, $\mu$ di Sidebar Kiri (`LabWorkspacePage.tsx`)
Agar siswa dapat mengatur **$h$** dan **$W$** secara langsung maupun lewat **$\theta$** dan **$m$** tanpa melanggar konsistensi Hukum II Newton:
1. **Pemilih Objek Simulasi (`TactileSegmented`)**:
   - `Peti Barang` (`'barang'`) | `Mobil & Bukit` (`'mobil'`)
2. **Slider Sudut Kemiringan ($\theta$)** (`0° – 60°`, step `1°`):
   - Mengubah $\theta$ otomatis memperbarui tinggi vertikal $h = L \sin\theta$.
3. **Slider Ketinggian Bidang / Bukit ($h$)** (`0.00 m – 5.20 m`, step `0.05 m`, dengan panjang lintasan $L = 6.00\text{ m}$):
   - Menggeser slider $h$ langsung menghitung $\theta = \arcsin\left(\min\left(\frac{h}{L}, \sin 60^\circ\right)\right)$ secara real-time sehingga sudut bukit/bidang di kanvas 3D dan seluruh rumus ikut berubah!
4. **Slider Massa Benda ($m$)** (`1.0 kg – 10.0 kg`, step `0.5 kg`):
   - Mengubah $m$ otomatis memperbarui gaya berat $W = m \cdot g$ ($g = 9.80\text{ m/s}^2$).
5. **Slider Gaya Berat ($W$)** (`9.8 N – 98.0 N`, step `4.9 N` atau `0.5 N`):
   - Menggeser slider $W$ langsung memperbarui massa $m = W / g$ secara sinkron dua arah!
6. **Slider Koefisien Gesek ($\mu$)** (`0.00` Licin – `1.00` Kasar, step `0.05`):
   - Mengubah gaya gesek ($f_s$ / $f_k$) sekaligus tampilan material & animasi partikel gesekan di kanvas 3D.

### 1.3 Keluaran Engine Deterministik (`physicsInclined.ts`)
Memperluas `InclinedPhysicsValues` dan `computeInclinedResult()`:
- Menghitung: `rampHeightMeters` ($h = L\sin\theta$), `baseRunMeters` ($x = L\cos\theta$), `criticalAngleDeg` ($\theta_{\text{kritis}} = \arctan(\mu)$), `weight` ($W = m g$), `normalForce` ($N = W\cos\theta$), `drivingForce` ($W\sin\theta$), `maxStaticFriction` ($\mu N$), `frictionForce`, `netForce`, `acceleration`, dan `velocityEnd` ($v = \sqrt{2 a L}$ bila meluncur).
- Menyediakan `breakdownSteps` (4 langkah penjabaran rumus LaTeX + penjelasan bahasa sederhana) serta data untuk 3 variasi kurva grafik (`a(θ)`, `F(θ)` perbandingan $W\sin\theta$ vs $\mu N$, dan `a(μ)`).

---

## 2. Kanvas 3D Isometrik: 2 Simulasi, Area Perbukitan Prosedural, & Animasi Koefisien Gesek

Di `src/components/three/scenes/InclinedPlaneScene.tsx` (dibantu sub-komponen prosedural terstruktur di `src/components/three/scenes/inclined/`):

### 2.1 Lingkungan Dunia Nyata Prosedural (Area Perbukitan & Benda Dunia)
Dibangun 100% secara prosedural dengan geometri Three.js dalam palet Soft Tactile Neumorphism (`#EFECE4`, `#E3DED2`, `#D8D2C5`, `#C8C1B0`, `#0E5A63`, `#23272A`):
1. **Area Perbukitan Berundak (*Isometric Terraced Hills*)**:
   - Lapisan bukit berundak di sisi belakang, kiri, dan kanan lintasan utama untuk memberi konteks ruang dunia nyata.
   - Tumpukan batu (*boulders* polihedral halus), pepohonan pinus/cemara prosedural (batang silinder + kerucut bertingkat nuansa muted teal `#2C6268` / `#0E5A63`), pagar pengaman jalan (*guardrail* tiang + rel sepanjang sisi lereng), rambu peringatan kemiringan $\theta$ di tepi bukit, dan marka jalan putus-putus pada lintasan mobil.
2. **2 Objek Simulasi Pilihan**:
   - **Mode `Peti Barang` (`'barang'`)**:
     - Peti kargo kayu/logistik prosedural (badan peti `#D9CBB5`, rangka kayu gelap `#5C6064`, pita pengaman `#0E5A63`, dan titik pusat massa yang jelas) di atas bidang miring bertekstur papan/beton.
   - **Mode `Mobil & Bukit` (`'mobil'`)**:
     - Mobil prosedural lengkap (sasis bawah, bodi aerodinamis `#0E5A63`, kabin kaca `#CFE2E4`, bumper, lampu depan/belakang, serta **4 roda bervelg** yang **berotasi nyata** sesuai jarak tempuh $\Delta\phi = \Delta s / r_{\text{roda}}$ saat menuruni jalan bukit!).
3. **Animasi Koefisien Gesek ($\mu$)**:
   - **Visual Tekstur Permukaan Adaptif $\mu$**:
     - $\mu \le 0.10$ (*Licin*): permukaan mengilap halus (`roughness: 0.16`, warna terang `#D7E4E5`).
     - $0.10 < \mu < 0.55$ (*Sedang*): permukaan aspal/kayu matte bertekstur (`roughness: 0.78`).
     - $\mu \ge 0.55$ (*Kasar / Berbatu*): muncul butiran kerikil/tonjolan mikro prosedural di permukaan lintasan (`roughness: 0.96`), memvisualkan kekasaran yang menghambat gerak!
   - **Animasi Partikel Gesekan & Getaran Saat Meluncur**:
     - Ketika `isSimRunning && physics.isMoving` dan $\mu > 0.05$, sistem partikel ringan (`InstancedMesh` / grup partikel kecil `#8B8578`) muncul di belakang roda/dasar peti sebanding dengan besar $\mu$, disertai getaran mikro halus saat melewati permukaan kasar.
     - Saat diam setimbang ($\tan\theta \le \mu$), benda/mobil tertahan di puncak dengan penanda gaya gesek statis $f_s$ aktif menahan.

### 2.2 Perbaikan Arah Garis Penunjuk Label (`CalloutPin` & `DimensionLine3D`)
Mengatasi masalah label menempel/menumpuk pada bidang miring (seperti di screenshot user):
- Menambahkan dukungan arah kepala panah/ujung titik jangkar pada `CalloutPin` (`showAnchorArrow` / `elbow` yang mengarah keluar menjauhi bidang) dan memperluas offset ruang bebas:
  - `W` (Berat): menempel di ujung panah bawah dan ditarik keluar ke kiri-bawah (`[-0.95, -0.35, 0.85]`).
  - `N` (Gaya Normal): ditarik keluar ke kanan-atas di ruang terbuka (`[0.95, 0.75, -0.55]`).
  - `W·sin θ` (Gaya Penggerak): ditarik keluar sejajar depan (`[1.15, 0.25, 0.85]`).
  - `f` (Gaya Gesek $f_s/f_k$): ditarik keluar ke kiri-atas belakang (`[-1.15, 0.65, -0.55]`).
- Memindahkan garis ukur tinggi `h` ke sisi kiri luar dengan garis proyeksi putus-putus ke puncak bidang + label offset keluar (`[-0.75, 0, 0]`) sehingga tidak pernah bertabrakan dengan vektor `W`.
- Mengganti posisi garis ukur panjang lintasan/alas (`L = 6.0 m`, `m`, dan busur `θ`) agar memiliki jarak celah (*clearance*) minimal `0.45` unit dari tepi bidang dan ber-leader line keluar ke depan-kanan, sehingga tidak ada lagi label yang menempel pada bidang atau saling menumpuk!

---

## 3. Penghapusan AI Co-Pilot Khusus Modul Fisika Vektor → Panel Rumus Lengkap & Hukum II Newton

Sesuai permintaan user agar **AI Co-Pilot dihapus pada modul Fisika Vektor (`physics-inclined`)**:

### 3.1 Bar Bawah Simulasi 3D (`PersistentBottomBar.tsx` + `InclinedBottomPanel.tsx`)
Ketika `view === 'workspace' && activeModuleId === 'physics-inclined'`:
- **Hapus** blok `AI CO-PILOT LABORATORIUM` dan input tanya AI di sisi kanan bar bawah.
- **Ganti** dengan **Panel Rumus Lengkap & Penjelasan Simulasi Hukum II Newton**:
  - **Sisi Kiri**: Rumus utama yang digunakan beserta seluruh rumus pendukung dalam font matematika **`FormulaText` (KaTeX lokal)**:
    - $W = m \cdot g$
    - $W_x = W\sin\theta$, $\quad N = W\cos\theta$
    - $f_{s,\text{maks}} = \mu N$, $\quad a = g(\sin\theta - \mu\cos\theta)$
    - $h = L\sin\theta$
  - **Sisi Kanan**: Penjelasan detail kondisi simulasi saat ini & ringkasan **Hukum II Newton** ($\Sigma F = m \cdot a$) dengan bahasa sederhana (menjelaskan mengapa benda diam atau meluncur berdasarkan perbandingan $W\sin\theta$ vs $\mu N$, serta tombol menuju `Analisis & Rumus →`).

### 3.2 Halaman Analisis (`AnalysisCopilotPage.tsx` + `InclinedAnalysisView.tsx`)
Ketika `activeModuleId === 'physics-inclined'`:
- **Header Navigasi (`Header.tsx` & `AnalysisCopilotPage.tsx`)**: Label tahap `"Analisis & AI"` tampil kontekstual sebagai **`"Analisis & Rumus"`** khusus ketika `activeModuleId === 'physics-inclined'` (modul lain tetap `"Analisis & AI"`).
- **Kolom Kiri (`Analisis Persamaan, Data & Grafik Animasi`)**:
  - Menampilkan **Penjabaran Langkah-demi-Langkah Perhitungan** menggunakan font matematika **KaTeX (`FormulaText`)** dengan penjelasan sederhana di setiap langkah.
  - Menampilkan **Grafik Analisis Beranimasi Bergerak** (`AnimatedPhysicsChartSvg.tsx`) — lihat Bagian 4.
- **Kolom Kanan (Menggantikan Chat AI Co-Pilot)**:
  - **Hapus** seluruh panel chat `AI Co-Pilot Laboratorium`, input prompt, dan tombol quick-action AI.
  - **Ganti** dengan **Panel Referensi Rumus Lengkap, Penjelasan Detail Simulasi, & Hukum II Newton**:
    1. **Daftar Lengkap Rumus Simulasi Bidang Miring** (6 kartu rumus KaTeX + keterangan arti tiap simbol $\theta, h, W, m, \mu, N, f, a$ dengan nilai aktif saat ini).
    2. **Penjelasan Detail Hukum II Newton ($\Sigma F = m \cdot a$)**:
       - Bagaimana massa ($m$), berat ($W$), sudut/tinggi bukit ($\theta, h$), dan gesekan ($\mu$) memengaruhi percepatan ($a$) secara langsung.
    3. **Panduan Membaca Apa yang Terlihat di Simulasi & Grafik**:
       - Penjelasan sederhana untuk dua skenario utama (*Benda Diam Setimbang* saat $\tan\theta \le \mu$ vs *Benda Meluncur Dipercepat* saat $\tan\theta > \mu$), dikaitkan langsung dengan objek aktif (`Peti Barang` vs `Mobil di Lereng Bukit`).

---

## 4. Grafik Beranimasi Bergerak & Variasi Kurva Analisis (`AnimatedPhysicsChartSvg.tsx`)

Memperluas komponen grafik khusus modul Fisika Vektor agar siswa benar-benar paham apa yang mereka lihat:
1. **3 Variasi Grafik yang Bisa Dipilih Siswa (Segmented Pill)**:
   - **Variasi 1 — `a vs θ` (Pengaruh Kemiringan terhadap Percepatan)**:
     - Menampilkan kurva $a(\theta)$ dan menandai **Sudut Kritis** ($\theta_{\text{kritis}} = \arctan\mu$) tempat benda tepat mulai meluncur ($a > 0$).
   - **Variasi 2 — `Gaya vs θ` (Pertarungan $W\sin\theta$ vs $f_{\text{maks}}$)**:
     - Menampilkan **2 kurva sekaligus**: kurva Deep Teal $W\sin\theta$ (gaya penarik ke bawah) dan kurva Charcoal putus-putus $\mu W\cos\theta$ (daya tahan gesek). Titik perpotongan kedua kurva secara visual menjelaskan *mengapa* benda baru bergerak setelah melewati sudut tertentu!
   - **Variasi 3 — `a vs μ` (Pengaruh Kekasaran Gesekan terhadap Percepatan)**:
     - Menampilkan kurva penurunan linear $a(\mu)$ pada sudut $\theta$ saat ini hingga mencapai $a = 0$ (benda berhenti tertahan gesekan).
2. **Animasi Bergerak pada Grafik**:
   - Dilengkapi tombol **`Putar / Jeda Animasi Grafik`** (dan animasi halus otomatis):
     - Sebuah titik *scanner* bergerak menyusuri kurva dari kiri ke kanan (menggunakan `requestAnimationFrame`) sambil memperbarui nilai bacaan interaktif (*live animated readout*) pada sudut/gesekan yang dilewati, ditambah animasi *pulse ring* pada posisi slider aktif siswa serta ikon simulasi mini (indikator diam vs meluncur sebanding kecepatan).
3. **Penjelasan Sederhana di Bawah Grafik**:
   - Setiap variasi grafik menampilkan **kotak interpretasi sederhana** (contoh untuk `Gaya vs θ`: *"Selama garis hijau ($W\sin\theta$) berada di bawah garis abu-abu ($f_{\text{maks}}$), benda tetap diam. Begitu garis hijau naik melampaui garis abu-abu pada $\theta > 11{,}3^\circ$, benda mulai meluncur!"*).

---

## 5. Daftar File yang Akan Diubah & Ditambahkan

| Status | Path File | Ringkasan Perubahan |
| :--- | :--- | :--- |
| **Baru** | `src/components/three/scenes/inclined/InclinedWorldEnvironment.tsx` | Geometri prosedural area perbukitan berundak, pohon pinus, batu, rambu $\theta$, pagar pembatas jalan, dan marka jalan. |
| **Baru** | `src/components/three/scenes/inclined/InclinedVehiclesAndCargo.tsx` | Model 3D prosedural `Peti Barang` dan `Mobil Off-road` (dengan roda berputar dinamis) + sistem animasi partikel debu/gesekan $\mu$. |
| **Baru** | `src/components/layout/InclinedBottomPanel.tsx` | Panel bar bawah Tahap 3 khusus `physics-inclined`: menggantikan AI Co-Pilot dengan daftar lengkap rumus KaTeX + penjelasan Hukum II Newton & kondisi simulasi aktif. |
| **Baru** | `src/components/analysis/AnimatedPhysicsChartSvg.tsx` | Komponen grafik SVG beranimasi bergerak dengan 3 variasi kurva (`a(θ)`, `F(θ)`, `a(μ)`), titik kritis, dan penjelasan sederhana. |
| **Baru** | `src/components/analysis/InclinedAnalysisView.tsx` | Tampilan halaman Analisis khusus `physics-inclined`: penjabaran langkah-demi-langkah KaTeX + grafik animasi (kiri) dan panel rumus lengkap + penjelasan detail simulasi & Hukum II Newton tanpa AI Co-Pilot (kanan). |
| **Ubah** | `src/types/lab.ts` | Tambah `InclinedObjectType = 'barang' | 'mobil'`, tambah `objectType` & `rampLengthMeters` pada `InclinedParams`. |
| **Ubah** | `src/engines/physicsInclined.ts` & `src/engines/index.ts` | Tambah kalkulasi $h$, $L$, $\theta_{\text{kritis}}$, penjabaran 4 langkah KaTeX + teks sederhana, serta generator data 3 variasi grafik. |
| **Ubah** | `src/components/three/CalloutPin.tsx` & `DimensionLine3D.tsx` | Tambah dukungan arah panah penunjuk pada ujung garis (*pointer arrow*) dan `labelOffset` agar label tidak menempel pada bidang. |
| **Ubah** | `src/components/three/scenes/InclinedPlaneScene.tsx` | Integrasikan `InclinedWorldEnvironment`, `InclinedVehiclesAndCargo`, permukaan $\mu$ adaptif, partikel gesek, serta posisi `CalloutPin` & `DimensionLine3D` yang jauh dari bidang. |
| **Ubah** | `src/pages/LabWorkspacePage.tsx` | Tambah kontrol `Objek Simulasi (Peti / Mobil)`, slider `Ketinggian (h)`, dan slider `Gaya Berat (W)` yang tersinkronisasi dua arah dengan $\theta$ dan $m$; perbarui readout & `LandingPage.tsx` agar kompatibel dengan `InclinedParams` baru. |
| **Ubah** | `src/pages/LandingPage.tsx` | Sesuaikan props default `InclinedPlaneScene` (`objectType: 'barang'`, `rampLengthMeters: 6`). |
| **Ubah** | `src/components/layout/PersistentBottomBar.tsx`, `Header.tsx`, & `AnalysisCopilotPage.tsx` | Ganti bar bawah `physics-inclined` dengan `InclinedBottomPanel`, tampilkan `"Analisis & Rumus"` di header untuk `physics-inclined`, dan render `InclinedAnalysisView` di halaman Analisis (tanpa AI Co-Pilot). |
| **Ubah** | `src/data/modules.ts`, `src/data/worksheetTemplates.ts`, `src/engines/engines.test.ts` | Perbarui deskripsi & langkah panduan `physics-inclined` (mengacu ke `Analisis & Rumus`, $h$, $W$, Peti/Mobil), serta tambah unit test untuk sinkronisasi $h$, $W$, $\theta_{\text{kritis}}$, dan 3 variasi grafik. |

---

## 6. Langkah Eksekusi (Menunggu Persetujuan)

1. **Langkah 1**: Perbarui tipe `InclinedParams` (`types/lab.ts`, `engines/index.ts`, `LandingPage.tsx`, `modules.ts`) dan perluas `physicsInclined.ts` (kalkulasi $h, W, \theta_{\text{kritis}}$, penjabaran 4 langkah KaTeX, serta 3 variasi kurva).
2. **Langkah 2**: Tingkatkan `CalloutPin.tsx` & `DimensionLine3D.tsx` dengan garis penunjuk berarah + offset bebas bidang, lalu bangun `InclinedWorldEnvironment.tsx`, `InclinedVehiclesAndCargo.tsx`, dan perbarui `InclinedPlaneScene.tsx` (2 simulasi, bukit, animasi gesekan $\mu$, roda mobil berputar).
3. **Langkah 3**: Perbarui Sidebar Kiri di `LabWorkspacePage.tsx` (Objek Simulasi, $\theta$, $h$, $m$, $W$, $\mu$) dan buat `InclinedBottomPanel.tsx` untuk menggantikan AI Co-Pilot di bar bawah.
4. **Langkah 4**: Bangun `AnimatedPhysicsChartSvg.tsx` dan `InclinedAnalysisView.tsx`, lalu hubungkan ke `AnalysisCopilotPage.tsx` dan `Header.tsx` (tanpa AI Co-Pilot khusus untuk `physics-inclined`).
5. **Langkah 5**: Perbarui `worksheetTemplates.ts` dan `engines.test.ts`, lalu jalankan `npm test`, `npm run lint`, `npm run build`, serta uji visual & interaktif di browser.
