# Planning Revisi Modul Fisika: Rangkaian Listrik Dinamis (`physics-circuit`)

> **Status Dokumen:** Rancangan lengkap untuk disetujui pengguna sebelum implementasi kode dimulai.

---

## 1. Ringkasan Tujuan Revisi

1. **Tab Simulasi 3D (`physics-circuit`)**:
   - Menambahkan konfigurasi **Rangkaian Campuran** (kombinasi Seri–Paralel: $R_1$ seri dengan cabang paralel $R_2 \parallel R_3$) di samping **Seri** dan **Paralel**.
   - Menambahkan **Saklar (Switch)** yang dapat dipilih **Ada / Tidak Ada** (`hasSwitch`), dapat dibuka/tutup (**ON / OFF**) dari panel kontrol maupun diklik langsung pada objek 3D di kanvas.
   - Menambahkan **Lampu Indikator/Beban** yang dapat dipilih **Ada / Tidak Ada** (`hasLamp`) serta **dapat divariasikan** jenis/hambatan lampu (**LED $5\,\Omega$**, **Pijar $10\,\Omega$**, **Filamen $20\,\Omega$**) dan posisi pemasangannya (**Jalur Utama** vs **Cabang Paralel**), dengan kecerahan pijar 3D mengikuti daya listrik nyata ($P = I^2 R$).
   - Meningkatkan visual **3D Isometrik** agar lebih menarik dan interaktif (papan praktikum berkisi terminal, baterai DC berlabel kutub `+`/`−`, resistor dengan pita kode warna, saklar pisau tembaga beranimasi, bola lampu kaca bercahaya + `pointLight` dinamis, kabel 3 topologi yang rapi, aliran elektron proporsional arus per cabang yang berhenti saat saklar terbuka, serta label pin berarah).
   - **Menghapus AI Co-Pilot pada tampilan Simulasi 3D** (dock bawah `PersistentBottomBar.tsx`) dan menggantinya dengan **Panel Penjelasan Rumus & Hukum Fisika Rangkaian Aktif** (Hukum Ohm, Hukum I Kirchhoff, Hukum II Kirchhoff, aturan Seri/Paralel/Campuran, serta efek saklar & lampu).

2. **Tab Analisis & AI (`physics-circuit`)**:
   - Menyajikan **Grafik Beranimasi Bergerak** (*moving scanner* Play/Pause) disertai **3+ variasi grafik hubungan** (tidak hanya $I$ vs $V$, tetapi juga $I$ vs $R$ dan perbandingan Arus/Daya per komponen) lengkap dengan **panduan "Cara Membaca Grafik"** yang mudah dipahami siswa.
   - Menyajikan **Penjelasan Rumus & Keterangan Lengkap per Rangkaian** (Seri, Paralel, Campuran) beserta penjabaran perhitungan langkah demi langkah menggunakan font matematika KaTeX lokal dan penjelasan arti setiap besaran ($V, I, R, P, \varepsilon$).
   - Menjaga **AI Co-Pilot Laboratorium** tetap hadir di tab **Analisis & AI** dan **terhubung penuh dengan konteks modul Rangkaian Listrik** (memahami mode Seri/Paralel/Campuran, $V, R_1, R_2, R_3$, status saklar ON/OFF, kondisi lampu & variasinya, serta mampu menjawab pertanyaan tentang Hukum Ohm dan Hukum I & II Kirchhoff secara akurat baik lewat Gemini Flash maupun mode lokal).

---

## 2. Rancangan Teknis & Perubahan per Modul

### A. Tipe Data & Engine Fisika (`src/types/lab.ts`, `src/engines/index.ts`, `src/engines/physicsCircuit.ts`)
1. Perbarui `CircuitParams` di `src/types/lab.ts`:
   ```ts
   export type CircuitMode = 'seri' | 'paralel' | 'campuran';
   export type CircuitLampType = 'led-5' | 'pijar-10' | 'halogen-20';
   export type CircuitLampPlacement = 'utama' | 'cabang';

   export interface CircuitParams {
     mode: CircuitMode;
     voltage: number;
     r1: number;
     r2: number;
     r3: number;
     hasSwitch: boolean;
     switchClosed: boolean;
     hasLamp: boolean;
     lampType: CircuitLampType;
     lampPlacement: CircuitLampPlacement;
   }
   ```
2. Perbarui `DEFAULT_MODULE_PARAMS['physics-circuit']` di `src/engines/index.ts`:
   - `mode: 'seri'`, `voltage: 12.0`, `r1: 10`, `r2: 20`, `r3: 20`, `hasSwitch: true`, `switchClosed: true`, `hasLamp: true`, `lampType: 'pijar-10'`, `lampPlacement: 'utama'`.
3. Perluas `src/engines/physicsCircuit.ts`:
   - **Perhitungan Fisika Akurat 3 Topologi + Saklar + Beban Lampu**:
     - Nilai hambatan lampu $R_L$: `led-5` = $5\,\Omega$, `pijar-10` = $10\,\Omega$, `halogen-20` = $20\,\Omega$ (jika `hasLamp === false`, $R_L = 0$).
     - Jika `hasSwitch && !switchClosed`: seluruh arus $I_{\text{tot}} = I_1 = I_2 = I_3 = I_L = 0\text{ A}$, $P_{\text{tot}} = P_L = 0\text{ W}$, status `'Rangkaian Terbuka (Padam)'`.
     - Jika rangkaian tertutup:
       - **Seri**: $R_{\text{tot}} = R_1 + R_2 + R_L$, $I_{\text{tot}} = I_1 = I_2 = V / R_{\text{tot}}$, tegangan terbagi $V_1 = I R_1$, $V_2 = I R_2$, $V_L = I R_L$ (memenuhi $V - V_1 - V_2 - V_L = 0$).
       - **Paralel**: cabang 1 ($R_1$), cabang 2 ($R_2$, atau $R_2 + R_L$ jika `lampPlacement === 'cabang'`), plus $R_L$ seri di jalur utama jika `lampPlacement === 'utama'`. Menghitung $R_{\text{par}}$, $R_{\text{tot}}$, $I_{\text{tot}}$, arus cabang $I_1, I_2$ ($I_{\text{tot}} = I_1 + I_2$), tegangan cabang $V_{\text{par}}$, dan daya lampu $P_L$.
       - **Campuran ($R_1$ seri dengan $(R_2 \parallel R_3)$)**:
         - Jika lampu dipasang di jalur utama: $R_{\text{utama}} = R_1 + R_L$.
         - Jika lampu dipasang di cabang paralel (cabang $R_2$): $R_{\text{cabang2}} = R_2 + R_L$.
         - $R_{\text{par}} = \frac{R_{\text{cabang2}} \cdot R_3}{R_{\text{cabang2}} + R_3}$, $R_{\text{tot}} = R_{\text{utama}} + R_{\text{par}}$.
         - Menghitung $I_{\text{tot}} = I_1 = V / R_{\text{tot}}$, $V_1 = I_1 R_1$, $V_{\text{par}} = V - I_1 R_{\text{utama}}$, arus cabang $I_2 = V_{\text{par}} / R_{\text{cabang2}}$, $I_3 = V_{\text{par}} / R_3$ (terverifikasi Hukum I Kirchhoff $I_1 = I_2 + I_3$), serta $P_L$ dan indeks kecerahan lampu `lampBrightness` (`0` s.d. `1.5`).
   - Tambahkan `buildCircuitAnalysisDetails(params)` yang menghasilkan:
     - `breakdownSteps`: 4 langkah penjabaran KaTeX + penjelasan bahasa sederhana.
     - `circuitLaws`: Ringkasan hukum aktif (Hukum Ohm, Hukum I Kirchhoff, Hukum II Kirchhoff) lengkap dengan formula KaTeX dan keterangan simbol.
     - `topologyGuides`: Keterangan rumus lengkap khusus **Seri**, **Paralel**, dan **Campuran** beserta penjelasan kapan digunakan & karakteristiknya.
     - `chartVariants` (3 grafik beranimasi):
       1. `i-v`: **Kurva Hukum Ohm ($I$ vs $V$)** untuk $R_{\text{tot}}$ aktif (menunjukkan gradien $1/R_{\text{tot}}$ dan titik kerja saat ini).
       2. `i-r`: **Kurva Hubungan Hiperbolik ($I$ vs $R_{\text{ekiv}}$)** pada tegangan $V$ aktif (membuktikan arus berbanding terbalik dengan hambatan total).
       3. `branch-compare`: **Kurva Perbandingan Cabang/Komponen ($I_1$ vs $I_2$ atau $V_1$ vs $V_2$ terhadap $V$)** sesuai topologi aktif + nilai daya lampu $P_L$.
       - Setiap variasi grafik dilengkapi `readingGuide` ("Cara Membaca Grafik").

### B. Peningkatan Visual & Interaktivitas 3D Isometrik (`src/components/three/scenes/`)
1. Modularisasi komponen listrik 3D ke `src/components/three/scenes/circuit/CircuitComponents3D.tsx`:
   - **Papan Rangkaian & Rel Terminal**: Alas matte 3 warna Soft Tactile dengan jalur tembaga/karbon yang tertata, terminal binding-post di titik simpul cabang.
   - **Sumber Tegangan DC (Baterai Lab)**: Desain casing dua-tone teal/krem dengan kutub `+` (aksen tembaga) dan `−` (aksen arang) yang jelas.
   - **Resistor 3D dengan Pita Kode Warna**: Ukuran silinder dan pita warna realistis untuk $R_1, R_2, R_3$ (dengan $R_3$ muncul saat mode `'campuran'`).
   - **Saklar Pisau Interaktif (`KnifeSwitch3D`)**: Ditampilkan jika `hasSwitch === true`; tuas logam berengsel animasi miring `38°` saat terbuka (`OFF`) dan rata tertutup saat `ON`, dilengkapi *hover cursor* & **klik langsung pada objek 3D** untuk membalik status saklar.
   - **Lampu Pijar / Indikator 3D (`LabLamp3D`)**: Ditampilkan jika `hasLamp === true`; dudukan soket porselen, kubah kaca transparan (`meshPhysicalMaterial` / transparan matte), kumparan filamen yang berpijar kuning-emas sesuai `lampBrightness`, halo lembut + `pointLight` dinamis yang menyala redup/terang atau padam total saat saklar OFF!
2. Perbarui `src/components/three/scenes/ElectricCircuitScene.tsx`:
   - Mendukung 3 topologi kabel: **Seri**, **Paralel**, dan **Campuran** ($R_1$ seri sebelum node percabangan $R_2 \parallel R_3$).
   - Posisi dinamis untuk Saklar (di jalur utama dekat kutub sumber) dan Lampu (`utama` di jalur seri utama, atau `cabang` pada cabang $R_2$ saat Paralel/Campuran).
   - Partikel arus listrik bergerak di jalur utama dan setiap cabang paralel sesuai proporsi arus masing-masing ($I_1, I_2, I_3$), dan berhenti diam dengan cahaya pudar saat saklar terbuka (`!switchClosed`).
   - Seluruh `CalloutPin` memakai `labelOffset` terkalibrasi + `DimensionLine3D` sehingga label `V`, `R₁`, `R₂`, `R₃`, `Saklar`, `Lampu`, `I_tot` bersih dan tidak saling bertumpuk.

### C. UI Simulasi 3D & Penghapusan AI Co-Pilot di Dock Bawah
1. Perbarui `src/pages/LabWorkspacePage.tsx` (`case 'physics-circuit'`):
   - `TactileSegmented` 3 pilihan: **Seri | Paralel | Campuran**.
   - Slider $V$ ($1.5\text{–}24\text{ V}$), $R_1$ ($2\text{–}50\,\Omega$), $R_2$ ($2\text{–}50\,\Omega$), dan **Slider $R_3$ ($2\text{–}50\,\Omega$)** (ditampilkan saat `mode === 'campuran'`).
   - Kontrol **Saklar (`hasSwitch`)**: Toggle Ada / Tidak Ada + tombol/switch **Status Saklar (`ON Tertutup` / `OFF Terbuka`)** ketika saklar ada.
   - Kontrol **Lampu (`hasLamp`)**: Toggle Ada / Tidak Ada + **Variasi Jenis Lampu (`LED 5 Ω` | `Pijar 10 Ω` | `Halogen 20 Ω`)** + **Posisi Lampu (`Jalur Utama` | `Cabang R₂`)** (posisi cabang aktif saat mode Paralel/Campuran).
   - Hubungkan callback klik saklar langsung di `ElectricCircuitScene` lewat `Module3DCanvas.tsx` → `LabWorkspacePage.tsx`.
2. Buat `src/components/layout/CircuitBottomPanel.tsx` & hubungkan ke `src/components/layout/PersistentBottomBar.tsx`:
   - Khusus saat `view === 'workspace' && activeModuleId === 'physics-circuit'`, **AI Co-Pilot dihapus dari dock bawah** dan diganti dengan dock 2 kolom:
     - **Kiri**: Rumus utama & sub-rumus komponen rangkaian aktif dengan font KaTeX (`FormulaText`) — $R_{\text{tot}}, I_{\text{tot}}, V_1/V_2/V_3, I_1/I_2/I_3, P_L$ dan status Saklar/Lampu.
     - **Kanan**: Penjelasan hukum fisika yang bekerja pada rangkaian tersebut (**Hukum Ohm**, **Hukum I Kirchhoff** bila bercabang, **Hukum II Kirchhoff** pada lup tertutup) + tombol `"Buka Analisis & AI →"`.

### D. Tab Analisis & AI: Grafik Animasi + Rumus Detail + AI Co-Pilot Kontekstual
1. Buat `src/components/analysis/AnimatedCircuitChartSvg.tsx`:
   - Grafik SVG interaktif dengan animasi *scanner* bergerak halus (`Play / Pause`), 3 tab variasi hubungan (`I vs V`, `I vs R`, `Perbandingan Cabang/Tegangan vs V`), pin posisi aktif slider siswa, serta kotak **"Cara Membaca Grafik"** yang menjelaskan makna kurva secara sederhana.
2. Buat `src/components/analysis/CircuitAnalysisView.tsx` & hubungkan ke `src/pages/AnalysisCopilotPage.tsx`:
   - **Kolom Kiri**:
     - Guided step tracker 4 langkah.
     - Ringkasan persamaan utama KaTeX + metrik cabang lengkap + status saklar & kecerahan lampu.
     - **Penjabaran Langkah demi Langkah** (KaTeX + penjelasan sederhana untuk Seri / Paralel / Campuran).
     - `<AnimatedCircuitChartSvg />` (grafik beranimasi + cara membaca).
   - **Kolom Kanan**:
     - **Penjelasan Hukum Dasar di Rangkaian** (Hukum Ohm, Hukum I Kirchhoff, Hukum II Kirchhoff dengan `FormulaText` dan konteks kondisi rangkaian saat ini).
     - **Keterangan Rumus Lengkap per Rangkaian** (tab atau kartu terstruktur untuk **Rangkaian Seri**, **Rangkaian Paralel**, dan **Rangkaian Campuran** berisi rumus $R_{\text{tot}}, I, V, P$ dan keterangan arti tiap simbol, dengan penandaan otomatis pada mode yang sedang disimulasikan).
   - **Bagian Bawah (Full-Width)**:
     - `<CopilotChatPanel />` dengan badge `Gemini Flash` / `Mode Lokal` yang terhubung langsung ke konteks modul Rangkaian Listrik saat ini (`Seri`/`Paralel`/`Campuran`, nilai $V, R_1, R_2, R_3$, saklar, dan variasi lampu).
3. Perbarui `src/data/modules.ts` & `src/services/geminiCopilot.ts`:
   - Tambahkan *quick actions* kontekstual untuk `physics-circuit` (Seri vs Paralel vs Campuran, Hukum I & II Kirchhoff, Efek Saklar & Kecerahan Lampu, Latihan Hitung Cabang).
   - Perkaya `systemInstruction` Gemini API dan `buildDeterministicFallback` di `geminiCopilot.ts` dengan payload `circuitParams` agar AI Co-Pilot benar-benar memahami kondisi saklar (`ON`/`OFF`), lampu (`Ada`/`Tidak`, jenis & penempatan lampu, daya nyala lampu), dan Rangkaian Campuran $R_1 + (R_2 \parallel R_3)$.
4. Perbarui `src/context/LabContext.tsx`, `src/data/worksheetTemplates.ts`, & `src/engines/engines.test.ts`:
   - Masukkan `hasSwitch`, `switchClosed`, `hasLamp`, `lampType`, `lampPlacement` ke `isDiscretePatch` di `LabContext.tsx`.
   - Perbarui `createExploredItemFromModuleState` di `worksheetTemplates.ts` untuk `physics-circuit` agar mencatat mode Campuran, status Saklar, dan variasi Lampu di Lembar Kerja.
   - Tambah unit test di `engines.test.ts` untuk Rangkaian Campuran, kondisi Saklar Terbuka ($I = 0$), beban Lampu, dan `buildCircuitAnalysisDetails`.

---

## 3. Rencana Langkah Implementasi (Fase 15)

- **15.1** Perbarui `CircuitParams` (`src/types/lab.ts`), `DEFAULT_MODULE_PARAMS` (`src/engines/index.ts`), dan bangun engine 3 topologi + saklar + lampu + analisis kurva di `src/engines/physicsCircuit.ts`.
- **15.2** Buat komponen 3D interaktif (`CircuitComponents3D.tsx`) dan perbarui `ElectricCircuitScene.tsx` + `Module3DCanvas.tsx` (Seri, Paralel, Campuran, saklar klik-langsung 3D, lampu berpijar dinamis, elektron proporsional arus, label tidak bertumpuk).
- **15.3** Perbarui kontrol workspace `physics-circuit` di `LabWorkspacePage.tsx` & `LabContext.tsx`, lalu buat `CircuitBottomPanel.tsx` dan pasang di `PersistentBottomBar.tsx` (hapus AI Co-Pilot dari Simulasi 3D).
- **15.4** Buat `AnimatedCircuitChartSvg.tsx` (3 grafik beranimasi + cara membaca) dan `CircuitAnalysisView.tsx` (penjabaran langkah KaTeX, penjelasan Hukum Ohm & Kirchhoff I/II, keterangan rumus Seri/Paralel/Campuran, dan `<CopilotChatPanel />`), lalu hubungkan di `AnalysisCopilotPage.tsx`.
- **15.5** Perbarui `modules.ts`, `geminiCopilot.ts` (konteks penuh listrik dinamis), `worksheetTemplates.ts`, dan `engines.test.ts`; jalankan `npm test`, `npm run lint`, `npm run build`, serta verifikasi visual browser end-to-end.
