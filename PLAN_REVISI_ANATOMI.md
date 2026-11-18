# PLAN_REVISI_ANATOMI.md — Rencana Revisi Lanjutan Modul Biologi: Anatomi Organ (EDUSPACE)

Dokumen ini menyusun perencanaan revisi berdasarkan hasil evaluasi penggunaan langsung pada 4 bagian:
1. **Perbaikan Garis & Posisi Penamaan (`CalloutPin`) pada Model Jantung (`heart.glb`)**.
2. **Analisis Struktur & Alur Fisiologis di Halaman `Analisis & AI` yang Adaptif terhadap Pilihan di Simulasi 3D**.
3. **Pemilihan Objek Hasil Klik 3D untuk Menyusun Rangkuman Siswa di Halaman `Lembar Kerja`**.
4. **Penghapusan Fitur AI Co-Pilot pada Halaman `Lembar Kerja`**.

> **Prinsip Desain & Aturan Eksekusi:**
> - Tetap mempertahankan **Soft Tactile Neumorphism 3 Warna** (`#EFECE4`/`#F6F3EC`/`#E3DED2`, `#23272A`/`#5C6064`, `#0E5A63`).
> - Dokumen ini disusun terlebih dahulu untuk ditinjau dan disetujui sebelum perubahan kode dilakukan.

---

## 1. Perbaikan Penamaan & Garis `CalloutPin` pada Model Jantung (`HeartDetailModel.tsx`)

### Akar Masalah yang Ditemukan
Dari inspeksi `heart.glb` dan hasil tampilan kanvas 3D:
- Di dalam file glTF, nama bone joint mengandung titik (`.`), misalnya `right_atrium_jnt.6_6`, `left_atrium_jnt.13_13`, `left_mitral_valve_jnt.15_15`, `aortic_valve_01_jnt.21_21`, dll.
- `GLTFLoader` pada Three.js secara otomatis membuang karakter titik (`.`) melalui `PropertyBinding.sanitizeNodeName()`, sehingga di scene Three.js namanya berubah menjadi `right_atrium_jnt6_6`, `left_atrium_jnt13_13`, dst.
- Akibatnya `clonedScene.getObjectByName(pin.jointName)` mengembalikan `undefined`, sehingga seluruh grup pin tetap diam di titik origin `[0, 0, 0]` (di dasar alas/pedestal) dan garis penunjuk mengarah ke dasar pedestal, bukan ke bagian anatomi jantung.

### Rancangan Perbaikan
1. **Resolusi Nama Joint yang Tahan Sanitasi Three.js**:
   - Membuat helper `findNodeBySanitizedName(root, targetName)` di `normalizeModel.ts` yang menormalisasi perbandingan nama (menghapus `.` atau mencocokkan nama asli & hasil sanitasi Three.js), sehingga seluruh bone joint jantung ditemukan dengan akurat.
2. **Penyelarasan Koordinat & Offset `CalloutPin` Jantung**:
   - Memastikan `stageGroupRef.current.updateMatrixWorld(true)` dipanggil sebelum membaca `joint.getWorldPosition(_worldPos)` dan mengonversinya ke ruang lokal stage (`worldToLocal`), agar posisi awal pin langsung menempel di ruang/katup sejak frame pertama (bukan hanya setelah animasi berjalan).
   - Menyesuaikan `labelOffset` masing-masing dari 7 pin jantung (`Serambi Kanan`, `Serambi Kiri`, `Miokardium & Bilik`, `Katup Trikuspidalis`, `Katup Mitral`, `Katup Aorta`, `Katup Pulmonalis`) berdasarkan koordinat aktual tiap joint setelah normalisasi `Box3` sehingga seluruh garis penunjuk mengarah tepat ke objek anatomi masing-masing di dalam model jantung dan kartu label tidak bertumpuk atau jatuh ke bawah alas.
3. **Sinkronisasi Interaksi Klik di Jantung**:
   - Memperbesar *hit-sphere* transparan pada posisi joint aktual serta mengizinkan klik pada area objek jantung agar pin & panel bawah merespons akurat.

---

## 2. Analisis Struktur & Alur Fisiologis Adaptif di `Analisis & AI` (`AnalysisCopilotPage.tsx` & `AnatomyAnalysisPanel.tsx`)

### Masalah Saat Ini
Saat ini sisi kiri halaman `Analisis & AI` selalu menampilkan 5 langkah *Alur Sistematis Peredaran Darah & Respirasi* secara penuh meskipun siswa di Simulasi 3D memilih fokus organ spesifik (misalnya `Paru-paru` atau `Jantung`).

### Rancangan Perbaikan
Menjadikan **Kartu Alur Fisiologis** dan **Rincian Struktur** di `AnatomyAnalysisPanel.tsx` sepenuhnya adaptif mengikuti pilihan `focusOrgan` (+ `lungVariant` & `inspectionMode`) dari Simulasi 3D:

| Pilihan di Simulasi 3D | Judul & Isi Alur Fisiologis Adaptif (Sisi Kiri Atas) | Rincian Struktur yang Ditampilkan (Sisi Kiri Bawah) |
| :--- | :--- | :--- |
| **`Semua`** *(Keseluruhan)* | **Alur Sistematis Peredaran Darah & Respirasi Lengkap (5 Tahap):**<br>1. Vena Kava → 2. Jantung Kanan → 3. Paru-paru (Alveolus) → 4. Jantung Kiri → 5. Aorta | Ringkasan keseluruhan sistem toraks atau rincian organ sesuai `inspectionMode` aktif (`Utuh`, `Pisahkan`, atau `Belah Organ`: 4 ruang & katup jantung, bronkus/alveolus, lumen aorta). |
| **`Paru-paru`** *(Normal / Transparan)* | **Alur Mekanisme Pernapasan & Pertukaran Gas (4 Tahap):**<br>1. Laring, Epiglotis & Pita Suara (gerbang saluran napas) → 2. Trakea (penghangatan, penyaringan silia) → 3. Bronkus & Bronkiolus (distribusi ke 3 lobus kanan & 2 lobus kiri) → 4. Alveolus & Kapiler Pulmonal (difusi $O_2$ ke Hb dan pelepasan $CO_2$) | • Jika **Normal**: Lobus Paru Kanan (3 lobus), Paru Kiri (2 lobus), Fisura & Pleura, Apeks & Basis Paru.<br>• Jika **Transparan**: 10 objek bernamakan di dalamnya (`Trakea`, `Bronkus Kanan`, `Bronkus Kiri`, `Paru Kanan`, `Paru Kiri`, `Tulang Rawan Tiroid`, `Epiglotis`, `Pita Suara`, `Membran Tirohioid`, `Ligamen Krikotiroid`) dengan highlight pada objek yang diklik di 3D. |
| **`Jantung`** | **Alur Sirkulasi & Mekanisme Katup Jantung (4 Tahap):**<br>1. Serambi Kanan (terima darah miskin $O_2$ dari vena kava) → 2. Katup Trikuspidalis & Bilik Kanan (pompa via Katup Pulmonalis ke paru) → 3. Serambi Kiri (terima darah kaya $O_2$ dari vena pulmonalis) → 4. Katup Mitral, Bilik Kiri & Katup Aorta (pompa ke seluruh tubuh) | 7 struktur & katup jantung (`Miokardium & Bilik`, `Serambi Kanan`, `Serambi Kiri`, `Katup Trikuspidalis`, `Katup Mitral`, `Katup Pulmonalis`, `Katup Aorta`). |
| **`Aorta`** | **Alur Distribusi Sistemik & Dampak Koarktasio Aorta (4 Tahap):**<br>1. Pangkal & Katup Aorta → 2. Lengkung Aorta (elastisitas Windkessel) → 3. Percabangan Arteri Kepala & Lengan → 4. Aorta Desendens & Analisis Koarktasio (penyempitan lumen meningkatkan tekanan hulu & beban bilik kiri) | 4 segmen aorta (`Lengkung Aorta`, `Cabang Lengkung Aorta`, `Koarktasio Aorta`, `Lumen Aorta`). |

- Menambahkan indikator badge konteks di atas panel (mis. `Menampilkan Analisis: Paru-paru · Paru Transparan` atau `Menampilkan Analisis: Semua Organ Toraks`) serta tombol cepat untuk berpindah melihat **Keseluruhan Sistem** jika siswa ingin membandingkan konteks penuh tanpa harus kembali ke 3D.

---

## 3. Pemilihan Hasil Klik Simulasi 3D untuk Rangkuman Siswa di `Lembar Kerja` (`LabContext.tsx` & `WorksheetPage.tsx`)

### Tujuan
Siswa dapat memilih item mana saja yang telah diklik/diamati selama eksplorasi 3D untuk disusun menjadi **Rangkuman Siswa** di halaman **Lembar Kerja**.

### Rancangan Data & State
1. **Pelacakan Riwayat Klik Eksplorasi (`clickedAnatomyHistory`) di `LabContext.tsx`**:
   - Menambahkan tipe `AnatomyExploredItem` di `src/types/lab.ts`:
     ```ts
     export interface AnatomyExploredItem {
       id: string; // unik per kombinasi organ + mode/varian + structureId
       organKey: AnatomyOrganKey;
       organAndMode: string;
       structureId: string;
       structureName: string;
       location: string;
       physiologicalFunction: string;
       selectedForSummary: boolean; // default true saat baru diklik
       clickedAt: string;
     }
     ```
   - Setiap kali siswa mengklik objek 3D, memilih sub-komponen di panel bawah, atau mengganti `Fokus Organ` / `Mode` / `Varian Paru` di Simulasi 3D, item tersebut otomatis ditambahkan (tanpa duplikasi `structureId + organAndMode`) ke `exploredAnatomyItems` (dan dipersistensikan di `localStorage` melalui `storage.ts`).
   - Siswa tetap bisa mengeklik `Catat Data` untuk memasukkan ke tabel observasi resmi, **dan** seluruh jejak objek yang diklik di 3D juga langsung tersedia di halaman `Lembar Kerja`.

2. **UI Pemilih Rangkuman di `WorksheetPage.tsx`**:
   - Menambahkan kartu takti **"Pilih Objek Hasil Eksplorasi 3D untuk Rangkuman"** (muncul pada modul `biology-anatomy` di atas kotak catatan/rangkuman siswa):
     - Menampilkan daftar *selectable tactile chips / cards* dari seluruh struktur yang diklik di Simulasi 3D (plus opsi **Pilih Semua** / **Hapus Pilihan**).
     - Setiap kartu menampilkan nama struktur (mis. `Katup Mitral`, `Bronkus Kanan`, `Epiglotis`, `Koarktasio Aorta`), badge `Organ & Mode`, serta toggle centang untuk ikut/tidak ikut dalam rangkuman.
     - Tombol **"Susun Rangkuman dari Pilihan"** (`tactile-pill-cta`) yang menghasilkan rangkuman terstruktur rapi berdasarkan item yang dipilih siswa dan menuliskannya ke kotak **"Rangkuman & Kesimpulan Siswa"** (dapat diedit manual oleh siswa, ikut tersalin lewat `Salin Teks`, ikut terunduh di `.txt`, dan ikut tercetak rapi di `Unduh PDF`).
     - Tersedia juga tombol opsional **"+ Simpan Pilihan ke Tabel Observasi"** jika siswa ingin menyalin item yang dipilih ke baris tabel observasi resmi.

---

## 4. Penghapusan Fitur AI Co-Pilot di Halaman `Lembar Kerja` (`PersistentBottomBar.tsx`)

### Masalah Saat Ini
Pada `src/components/layout/PersistentBottomBar.tsx` saat `view === 'worksheet'`, masih terdapat kotak **AI Co-Pilot** (`Tanya AI Co-Pilot untuk ringkasan laporan...`).

### Rancangan Perbaikan
- **Menghapus seluruh elemen UI AI Co-Pilot** (ikon sparkles, teks ajakan `AI Co-Pilot:`, dan form input `Tanya AI Co-Pilot untuk ringkasan laporan...`) pada `view === 'worksheet'` di `PersistentBottomBar.tsx`.
- Menggantinya dengan bar ringkasan status Lembar Kerja yang bersih (tanpa fitur AI Co-Pilot):
  - Untuk Biologi Anatomi: menampilkan jumlah observasi tercatat + jumlah struktur terpilih untuk rangkuman siswa.
  - Untuk modul Fisika/Matematika: menampilkan rata-rata nilai utama (bila satu modul) atau jumlah data percobaan tersimpan.
- *(Panel penuh AI Co-Pilot tetap tersedia secara fokus pada halaman `Analisis & AI`.)*

---

## 5. Daftar File yang Akan Diubah

| Path File | Ringkasan Perubahan |
| :--- | :--- |
| `src/components/three/scenes/anatomy/normalizeModel.ts` | Tambah helper `findNodeBySanitizedName()` untuk menangani penghapusan titik (`.`) oleh `GLTFLoader` pada nama bone joint. |
| `src/components/three/scenes/anatomy/HeartDetailModel.tsx` | Gunakan `findNodeBySanitizedName()`, sinkronkan matriks dunia awal sebelum frame pertama, dan kalibrasi ulang `labelOffset` 7 pin jantung agar setiap garis menunjuk akurat ke objek di dalam jantung. |
| `src/data/anatomyData.ts` | Tambah definisi alur fisiologis adaptif per organ (`FLOW_BY_ORGAN`: `semua`, `paru`, `jantung`, `aorta`) beserta koordinat/offset pin jantung yang sudah dikalibrasi. |
| `src/components/analysis/AnatomyAnalysisPanel.tsx` | Tampilkan alur fisiologis dan rincian struktur secara adaptif sesuai `focusOrgan` & `lungVariant` yang dipilih di Simulasi 3D, plus tombol opsional lihat alur keseluruhan. |
| `src/types/lab.ts` & `src/services/storage.ts` | Tambah `AnatomyExploredItem` dan fungsi simpan/muat `eduspace_v1_explored_anatomy` di `localStorage`. |
| `src/context/LabContext.tsx` | Catat otomatis struktur yang diklik/dipilih di Simulasi 3D ke `exploredAnatomyItems`, tambah aksi `toggleExploredItemForSummary`, `setAllExploredForSummary`, dan `addExploredItemsToWorksheet`. |
| `src/pages/WorksheetPage.tsx` | Tambah UI pemilih checklist objek hasil klik 3D untuk menyusun **Rangkuman Siswa** otomatis + dapat diedit sebelum ekspor `.txt`/PDF. |
| `src/components/layout/PersistentBottomBar.tsx` | Hapus seluruh fitur/input AI Co-Pilot pada `view === 'worksheet'`, sisakan ringkasan status Lembar Kerja yang bersih. |
| `src/engines/engines.test.ts` | Tambah unit test untuk `FLOW_BY_ORGAN` adaptif dan utilitas penyusunan rangkuman dari item eksplorasi terpilih. |

---

## 6. Langkah Eksekusi (Setelah Plan Disetujui)

1. **Langkah 1**: Periksa koordinat dunia aktual bone joints pada `public/models/heart.glb` setelah normalisasi `Box3`, lalu perbarui `normalizeModel.ts`, `anatomyData.ts`, dan `HeartDetailModel.tsx` agar seluruh garis `CalloutPin` menunjuk tepat ke bagian jantung masing-masing.
2. **Langkah 2**: Perbarui `anatomyData.ts` dan `AnatomyAnalysisPanel.tsx` agar halaman `Analisis & AI` menampilkan alur fisiologis dan rincian struktur yang adaptif mengikuti `focusOrgan` (`Semua`, `Paru-paru`, `Jantung`, `Aorta`).
3. **Langkah 3**: Implementasikan pelacakan klik 3D (`AnatomyExploredItem`) di `types/lab.ts`, `storage.ts`, dan `LabContext.tsx`, serta UI pemilih rangkuman siswa di `WorksheetPage.tsx`.
4. **Langkah 4**: Hapus fitur AI Co-Pilot di halaman `Lembar Kerja` (`PersistentBottomBar.tsx`).
5. **Langkah 5**: Perbarui `engines.test.ts`, jalankan `npm test`, `npm run lint`, `npm run build`, dan verifikasi visual di browser pada `Jantung` (garis pin), `Analisis & AI` (adaptif `Paru-paru` vs `Semua`), dan `Lembar Kerja` (pemilih rangkuman + tanpa Co-Pilot).
