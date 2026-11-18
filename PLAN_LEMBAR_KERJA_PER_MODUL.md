# PLAN_LEMBAR_KERJA_PER_MODUL.md — Rencana Pemisahan Total Aspek Lembar Kerja & Pemilih Rangkuman 3D per Modul

Dokumen ini merancang pembaruan halaman **Lembar Kerja** agar seluruh aspeknya—mulai dari riwayat eksplorasi 3D, panel **"Pilih Hasil Klik/Eksplorasi Simulasi 3D untuk Rangkuman Siswa"**, kolom tabel observasi, hingga generator rangkuman otomatis—**sepenuhnya terpisah dan spesifik untuk masing-masing dari 5 modul** (tidak ada data Anatomi yang bocor ke modul Fisika/Biologi Sel/Matematika, dan setiap modul memiliki pemilih rangkuman 3D-nya sendiri).

> **Prinsip Desain & Aturan Eksekusi:**
> - Tetap mempertahankan **Soft Tactile Neumorphism 3 Warna** (`#EFECE4`/`#F6F3EC`/`#E3DED2`, `#23272A`/`#5C6064`, `#0E5A63`).
> - Tetap menggunakan font lokal ter-bundle (`Plus Jakarta Sans`, `JetBrains Mono`, dan `KaTeX`).
> - Dokumen perencanaan ini disusun terlebih dahulu untuk ditinjau dan disetujui sebelum perubahan kode dilakukan.

---

## 1. Akar Masalah Saat Ini
1. Di [WorksheetPage.tsx](file:///d:/3D_LAB_SAINS_MATEMATIKA/src/pages/WorksheetPage.tsx), kondisi `{activeModuleId === 'biology-anatomy' || exploredAnatomyItems.length > 0 ? ...}` menyebabkan kartu **"Pilih Hasil Klik Simulasi 3D untuk Rangkuman Siswa"** berisi organ Anatomi ikut tampil pada modul lain (mis. *Dimensi Tiga*, *Bidang Miring*, *Rangkaian Listrik*, *Sel*) selama `exploredAnatomyItems` tidak kosong.
2. Selain modul `biology-anatomy`, ke-4 modul lainnya belum memiliki pelacakan hasil eksplorasi 3D tersendiri untuk dicentang menjadi rangkuman siswa, dan header kolom tabelnya masih memakai label generik yang sama (`Variabel Input` & `Hasil Perhitungan`).

---

## 2. Arsitektur Data Terisolasi per `ModuleId`

### 2.1 Tipe Umum Eksplorasi per Modul (`src/types/lab.ts`)
Menggantikan `AnatomyExploredItem` yang hanya khusus anatomi menjadi tipe terstruktur yang terikat kuat ke `moduleId`:

```ts
export interface ModuleExploredItem {
  id: string;                 // unik per modul + kombinasi kondisi/objek
  moduleId: ModuleId;
  title: string;              // judul utama kartu (mis. "Katup Mitral", "Seri · V=12V", "θ=30°, μ=0.20 (Meluncur)")
  subtitle: string;           // sub-label konteks (mis. "Jantung · Model Jantung Berdenyut" atau "I_tot = 0.40 A · R_tot = 30 Ω")
  summaryLine: string;        // kalimat ringkas fakta/fungsi/hasil untuk disusun menjadi rangkuman siswa
  inputSummary: string;       // nilai input untuk dimasukkan ke tabel observasi resmi
  outputSummary: string;      // hasil terhitung/fungsi untuk tabel observasi resmi
  formulaText: string;        // teks rumus/struktur
  formulaLatex?: string;      // opsional ekspresi LaTeX KaTeX untuk modul perhitungan
  primaryNumericValue: number;
  primaryUnit: string;
  recordKind: 'numeric' | 'anatomy';
  anatomyRecord?: AnatomyRecordPayload;
  selectedForSummary: boolean;
  clickedAt: string;
}
```

### 2.2 Penyimpanan Terpisah di `src/services/storage.ts`
- Menambahkan kunci `KEYS.exploredByModule = 'eduspace_v1_explored_by_module'` bertipe `Partial<Record<ModuleId, ModuleExploredItem[]>>`.
- Menyertakan migrasi satu kali dari `eduspace_v1_explored_anatomy` lama ke `exploredByModule['biology-anatomy']` agar tidak ada data yang hilang ataupun bocor ke modul lain.

### 2.3 Pelacakan Cerdas di `src/context/LabContext.tsx`
- Mengganti state tunggal `exploredAnatomyItems` dengan:
  - `exploredByModule: Partial<Record<ModuleId, ModuleExploredItem[]>>`
  - Turunan `activeExploredItems = exploredByModule[activeModuleId] ?? []` (hanya mengembalikan item milik `activeModuleId`!).
- **Cara Pencatatan agar Bersih & Tidak Bising:**
  - **Aksi Klik Diskret** (mengklik organ/bagian di 3D Anatomi, mengganti mode Seri/Paralel, mengganti spesimen Sel/Organel target, mengganti kasus Geometri `P→BD`/`P→BDG`/`Sudut`, atau menekan tombol `Jalankan Simulasi`): langsung mencatat kondisi tersebut ke `exploredByModule[activeModuleId]` (tanpa duplikasi `id` yang sama).
  - **Perubahan Slider Kontinu** ($\theta, m, \mu, V, R_1, R_2, M, s, t$): menggunakan *debounce* (~700 ms setelah pengguna berhenti menggeser slider saat berada di `view === 'workspace'`) agar riwayat eksplorasi 3D hanya menyimpan titik pengamatan yang benar-benar diamati siswa, bukan puluhan nilai transisi di tengah geseran!
- Seluruh aksi (`toggleExploredItemForSummary`, `setAllExploredForSummary`, `clearExploredItems`, `addExploredItemsToWorksheet`) hanya memodifikasi `exploredByModule[activeModuleId]`.

---

## 3. Spesifikasi Aspek Lembar Kerja Berbeda untuk Setiap 5 Modul (`src/data/worksheetTemplates.ts`)

Membuat konfigurasi terpusat `WORKSHEET_CONFIG_BY_MODULE: Record<ModuleId, WorksheetModuleConfig>` sehingga setiap modul memiliki identitas kartu rangkuman, kolom tabel, dan format rangkuman siswa yang unik:

| Modul (`ModuleId`) | Judul & Petunjuk Kartu Pemilih Rangkuman 3D | Kolom Tabel Observasi Spesifik | Format Rangkuman Siswa yang Dihasilkan |
| :--- | :--- | :--- | :--- |
| **`physics-inclined`**<br>*(Bidang Miring & Vektor Gaya)* | **Pilih Variasi Sudut & Gaya Simulasi 3D**<br>*Centang kondisi sudut ($\theta$), massa, atau koefisien gesek ($\mu$) yang sudah kamu uji di 3D untuk dirangkum.* | 1. **Uji**<br>2. **Sudut, Massa & Gesekan** ($\theta, m, \mu$)<br>3. **Gaya & Percepatan** ($W\sin\theta, f_k/f_s, F_{\text{net}}, a$)<br>4. **Persamaan Dinamis (KaTeX)** | Menyusun perbandingan gaya penggerak vs gesekan dan status gerak (*Diam Setimbang* vs *Meluncur*) dari variasi yang dicentang, plus kesimpulan hubungan $\theta$ dan $\mu$ terhadap percepatan $a$. |
| **`physics-circuit`**<br>*(Rangkaian Listrik Dinamis)* | **Pilih Konfigurasi Rangkaian Hasil Simulasi 3D**<br>*Centang variasi rangkaian Seri/Paralel dan nilai hambatan yang sudah diamati di 3D.* | 1. **Uji**<br>2. **Konfigurasi, Tegangan & Resistor** (`Seri`/`Paralel`, $V, R_1, R_2$)<br>3. **Hambatan, Arus & Daya** ($R_{\text{tot}}, I_{\text{tot}}, P$)<br>4. **Hukum Ohm (KaTeX)** | Merangkum perbandingan rangkaian Seri vs Paralel dari data yang dicentang (nilai $R_{\text{tot}}$, arus $I_{\text{tot}}$, pembagian tegangan/arus cabang). |
| **`biology-anatomy`**<br>*(Anatomi Organ Kardiorespirasi)* | **Pilih Struktur Organ Hasil Klik Simulasi 3D**<br>*Centang organ, katup jantung, atau bagian paru yang sudah kamu klik di 3D untuk rangkuman.* | 1. **Observasi**<br>2. **Organ & Mode**<br>3. **Struktur yang Diidentifikasi**<br>4. **Fungsi Fisiologis** | Menyusun daftar terstruktur nama organ/bagian dalam, letak anatomis, serta fungsi dan mekanisme fisiologisnya. |
| **`biology-cell`**<br>*(Sel Darah & Sel Tumbuhan)* | **Pilih Spesimen & Organel Hasil Mikroskopi 3D**<br>*Centang pengamatan spesimen, perbesaran ($M$), atau organel target yang sudah kamu eksplorasi di 3D.* | 1. **Pengamatan**<br>2. **Spesimen, Perbesaran & Exploded**<br>3. **Kalibrasi FOV & Target Organel** ($FOV, D_{\text{tampak}}, SA/V$)<br>4. **Persamaan FOV (KaTeX)** | Merangkum pengaruh kenaikan perbesaran ($M$) terhadap penyempitan bidang pandang ($FOV$) serta fungsi organel/spesimen yang diamati. |
| **`math-geometry3d`**<br>*(Geometri Ruang Dimensi Tiga)* | **Pilih Kasus & Posisi Titik Proyeksi 3D**<br>*Centang kasus proyeksi (`P→BD`, `P→BDG`, `Sudut`) dan posisi titik $t$ yang sudah diuji di 3D.* | 1. **Uji**<br>2. **Kasus, Rusuk & Rasio Posisi** ($s, t$)<br>3. **Proyeksi & Hasil Eksak** ($P', d/\alpha$)<br>4. **Rumus Proyeksi (KaTeX)** | Merangkum nilai jarak/sudut proyeksi ortogonal tiap kasus dan perbandingan jarak titik terhadap bidang `BDG` pada variasi rasio $t$. |

---

## 4. Pembaruan Halaman `Lembar Kerja` (`WorksheetPage.tsx`) & Ekspor (`exportReport.ts`)

1. **`WorksheetPage.tsx`**:
   - **Strict Per-Module Rendering**: Selalu membaca `activeExploredItems` dan `WORKSHEET_CONFIG_BY_MODULE[activeModuleId]` — **tidak pernah** mengecek atau menampilkan item dari modul lain (`exploredAnatomyItems` lama dihapus).
   - **Kartu Pemilih Rangkuman 3D Adaptif**:
     - Menampilkan judul, subjudul, dan kartu checklist sesuai modul aktif.
     - Untuk modul Fisika/Biologi Sel/Matematika, setiap kartu checklist juga menampilkan badge formula atau hasil eksak singkat yang bersih.
     - Tombol `+ Masukkan ke Tabel (N)` dan `Susun Rangkuman dari Pilihan (N)` berfungsi seragam di **semua 5 modul**!
   - **Kolom Tabel Adaptif per Modul**:
     - Header kolom `<thead>` dan tampilan kartu mobile mengambil label spesifik dari `WORKSHEET_CONFIG_BY_MODULE[activeModuleId]` (bukan hanya `if/else` Anatomi vs Generik).
   - **Atribusi Lisensi Model 3D**: Hanya ditampilkan ketika `activeModuleId === 'biology-anatomy'`.
2. **`exportReport.ts`**:
   - Menyesuaikan format teks laporan agar label input/hasil pada `.txt` dan clipboard juga memakai label aspek dari modul aktif (`WORKSHEET_CONFIG_BY_MODULE`).

---

## 5. Daftar File yang Akan Diubah & Ditambahkan

| Status | Path File | Ringkasan Perubahan |
| :--- | :--- | :--- |
| **Baru** | `src/data/worksheetTemplates.ts` | Konfigurasi aspek Lembar Kerja unik untuk 5 modul (kolom tabel, judul/petunjuk pemilih rangkuman 3D, builder `createExploredItemFromModuleState()`, dan generator `buildModuleSummaryFromExplored()`). |
| **Ubah** | `src/types/lab.ts` | Tambah `ModuleExploredItem` terpadu (menggantikan `AnatomyExploredItem`). |
| **Ubah** | `src/services/storage.ts` | Tambah `loadExploredByModule()` & `saveExploredByModule()` dengan migrasi aman dari `eduspace_v1_explored_anatomy` ke bucket `'biology-anatomy'`. |
| **Ubah** | `src/context/LabContext.tsx` | Ganti `exploredAnatomyItems` dengan `exploredByModule` per `ModuleId`, tambah debounced capture pada perubahan parameter workspace + immediate capture pada klik 3D/aksi diskret, serta pastikan seluruh fungsi mutasi hanya menyentuh `[activeModuleId]`. |
| **Ubah** | `src/pages/WorksheetPage.tsx` | Gunakan `activeExploredItems` & `WORKSHEET_CONFIG_BY_MODULE[activeModuleId]` sehingga pemilih rangkuman 3D, header kolom tabel, dan tombol rangkuman 100% terisolasi & spesifik per modul. |
| **Ubah** | `src/services/exportReport.ts` | Gunakan label aspek modul aktif pada ekspor `.txt` & clipboard. |
| **Ubah** | `src/engines/engines.test.ts` | Tambah unit test untuk `createExploredItemFromModuleState()` & `buildModuleSummaryFromExplored()` di seluruh 5 modul dan validasi isolasi per `ModuleId`. |

---

## 6. Langkah Eksekusi (Setelah Plan Disetujui)

1. **Langkah 1**: Tambah `ModuleExploredItem` di `src/types/lab.ts`, buat `src/data/worksheetTemplates.ts` dengan konfigurasi & generator rangkuman untuk kelima modul.
2. **Langkah 2**: Perbarui `src/services/storage.ts` (`exploredByModule` + migrasi aman) dan `src/context/LabContext.tsx` (pelacakan eksplorasi per modul dengan immediate click capture + debounced slider capture).
3. **Langkah 3**: Perbarui `src/pages/WorksheetPage.tsx` dan `src/services/exportReport.ts` agar seluruh aspek Lembar Kerja benar-benar spesifik per modul.
4. **Langkah 4**: Perbarui `src/engines/engines.test.ts`, jalankan `npm test`, `npm run lint`, `npm run build`, dan verifikasi visual di browser pada beberapa modul berbeda (`Bidang Miring`, `Rangkaian Listrik`, `Anatomi Organ`, `Dimensi Tiga`) untuk memastikan tidak ada data yang bocor antarmodul dan tiap modul punya pemilih rangkuman 3D-nya sendiri.
