# Planning Penambahan AI Co-Pilot pada Halaman Analisis & Rumus (Fisika: Bidang Miring)

> **Prinsip Utama:** Tidak mengubah, menghapus, atau menggeser fitur yang sudah berjalan pada Simulasi 3D (`LabWorkspacePage`, `InclinedPlaneScene`), dock bawah (`InclinedBottomPanel`), grafik animasi (`AnimatedPhysicsChartSvg`), penjabaran 4 langkah KaTeX, penjelasan simulasi `Peti Barang` / `Mobil & Bukit`, Hukum II Newton, daftar rumus, maupun `Lembar Kerja`. Revisi ini **hanya menambahkan** fitur **AI Co-Pilot Laboratorium** ke halaman **Analisis & Rumus** (`physics-inclined`).

---

## 1. Masalah & Tujuan

- Pada revisi Fase 13, halaman **Analisis & Rumus** modul `physics-inclined` hanya menampilkan analisis persamaan, grafik animasi, penjelasan simulasi, Hukum II Newton, dan daftar rumus, sehingga panel interaktif **AI Co-Pilot Laboratorium** hilang dari modul Fisika Bidang Miring.
- **Tujuan Fase 14:** Memasukkan kembali panel **AI Co-Pilot Laboratorium** (mendukung **Gemini Flash** & **Fallback Deterministik Lokal**, rendering rumus matematika KaTeX via `RichMathMessage` & `FormulaText`, serta tombol pertanyaan cepat) langsung ke halaman **Analisis & Rumus** (`InclinedAnalysisView.tsx`), **tanpa mengubah tampilan/logika fitur yang sudah ada**.

---

## 2. Arsitektur & File yang Terlibat

### A. Ekstraksi Komponen Re-usable `CopilotChatPanel.tsx`
- **File baru:** `src/components/analysis/CopilotChatPanel.tsx`
- **Tujuan:** Menghindari duplikasi UI chat AI Co-Pilot antara `AnalysisCopilotPage.tsx` (modul selain Bidang Miring) dan `InclinedAnalysisView.tsx` (modul Bidang Miring).
- **Isi komponen (sama persis dengan panel AI Co-Pilot yang sudah ada di `AnalysisCopilotPage.tsx`):**
  - Header `AI Co-Pilot Laboratorium` dengan badge status `Gemini Flash` / `Mode Lokal` dan pill konteks real-time `Membaca: {computedResult.summaryInputText}` (memuat info objek `Peti Barang`/`Mobil`, $\theta$, $h$, $m$, $W$, dan $\mu$).
  - Daftar gelembung percakapan siswa & asisten dengan `RichMathMessage` dan `FormulaText` (font KaTeX lokal) + indikator loading & auto-scroll.
  - Deretan tombol *quick action* (`mod.quickActions`) dan form input tanya jawab.
  - Tetap tersambung ke `useLab()` (`chatMessages`, `sendCopilotMessage`, `isCopilotLoading`, `hasGeminiKey`, `computedResult`).

### B. Penambahan Panel Co-Pilot ke `InclinedAnalysisView.tsx` (Additive Only)
- **File:** `src/components/analysis/InclinedAnalysisView.tsx`
- **Perubahan:**
  - Tidak mengubah *guided tracker* 4 langkah, kolom kiri (persamaan utama, 4 langkah penjabaran KaTeX, `AnimatedPhysicsChartSvg`), maupun 3 kartu pada kolom kanan (`Penjelasan Simulasi 3D Saat Ini`, `Hukum II Newton pada Bidang Miring`, `Daftar Rumus yang Digunakan pada Simulasi`).
  - **Menambahkan** `<CopilotChatPanel ... />` sebagai seksi baru di bagian bawah grid 2 kolom di `InclinedAnalysisView.tsx` (full-width `rounded-3xl`, `min-h-[440px]`), sehingga seluruh layout analisis & rumus tetap proporsional dan fitur Co-Pilot tampil utuh untuk diskusi siswa.

### C. Pembaruan `AnalysisCopilotPage.tsx`
- **File:** `src/pages/AnalysisCopilotPage.tsx`
- **Perubahan:**
  - Mengoper props `chatMessages`, `sendCopilotMessage`, `isCopilotLoading`, `hasGeminiKey`, `computedResult` ke `InclinedAnalysisView` (atau membiarkan `CopilotChatPanel` membaca dari `useLab()`).
  - Mengganti blok JSX chat kolom kanan di `AnalysisCopilotPage.tsx` untuk memanggil `<CopilotChatPanel />` agar kode tetap modular dan identik secara visual/fungsional untuk modul lainnya.

### D. Tambah `quickActions` Khusus Fisika Bidang Miring di `modules.ts` & Fallback Lokal di `geminiCopilot.ts`
- **File:** `src/data/modules.ts`
  - Mengisi `quickActions` pada objek `physics-inclined` (yang sebelumnya kosong `[]`) dengan 4 prompt relevan untuk siswa SMA Kelas XI:
    1. `'💡 Analogi Bidang Miring'`
    2. `'⚙️ Pengaruh Gesekan (μ) & Sudut Kritis'`
    3. `'🚗 Beda Simulasi Peti vs Mobil'`
    4. `'📝 Latihan Soal Hukum II Newton'`
- **File:** `src/services/geminiCopilot.ts`
  - Menambahkan cabang fallback lokal khusus `physics-inclined` pada `buildDeterministicFallback` (jika API key Gemini belum diisi / offline) agar pertanyaan mengenai gesekan ($\mu$), tinggi/sudut ($h, \theta$), perbedaan objek peti vs mobil, maupun Hukum II Newton terjawab spesifik merujuk parameter aktif siswa.

---

## 3. Rencana Tahapan Implementasi (Fase 14)

1. **14.1** Buat `src/components/analysis/CopilotChatPanel.tsx` dan refaktor panel chat di `src/pages/AnalysisCopilotPage.tsx` agar memakainya tanpa mengubah perilaku 4 modul lainnya.
2. **14.2** Tambahkan `<CopilotChatPanel />` pada `src/components/analysis/InclinedAnalysisView.tsx` tepat di bawah grid 2 kolom yang ada (tanpa mengubah atau menghapus kartu analisis, grafik animasi, maupun rumus yang sudah ada).
3. **14.3** Isi `quickActions` untuk `physics-inclined` di `src/data/modules.ts` dan lengkapi respons fallback deterministik topik bidang miring (`μ`, `h`, `W`, `Peti vs Mobil`, Hukum II Newton) di `src/services/geminiCopilot.ts`.
4. **14.4** Perbarui unit test bila diperlukan di `src/engines/engines.test.ts`, lalu verifikasi dengan `npm test`, `npm run lint`, `npm run build`, serta uji browser langsung pada tab **Analisis & Rumus** modul Fisika: Bidang Miring (uji klik quick action, kirim pertanyaan custom, render KaTeX pada balasan Co-Pilot, dan pastikan seluruh kartu analisis, grafik animasi, dan 3D workspace tetap utuh).

---

## 4. Yang Tidak Diubah (Garansi Konsistensi)
- `Header.tsx`: Tab tetap bertuliskan **Analisis & Rumus** saat modul `physics-inclined` aktif.
- `LabWorkspacePage.tsx` & `InclinedBottomPanel.tsx`: Kontrol 3D (`Peti Barang | Mobil & Bukit`, $\theta, h, m, W, \mu$) dan bar rumus bawah pada Simulasi 3D tetap tidak diubah.
- `WorksheetPage.tsx`: Pemilih variasi sudut & gaya serta penyimpanan lokal per modul tetap tidak diubah.
