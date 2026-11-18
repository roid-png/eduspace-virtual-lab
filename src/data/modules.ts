import type { ModuleDefinition, ModuleId } from '../types/lab';

export const MODULES: ModuleDefinition[] = [
  {
    id: 'physics-inclined',
    subject: 'fisika',
    categoryLabel: 'Fisika Mekanika',
    title: 'Bidang Miring & Vektor Gaya',
    shortTitle: 'Fisika: Bidang Miring',
    description:
      'Simulasi peti barang dan mobil di lereng perbukitan. Atur θ, ketinggian h, berat W, massa m, dan koefisien gesek μ.',
    previewBadge: 'θ = 30° · μ = 0.20 · L = 6 m',
    stageTag: 'MODUL FISIKA • GERAK PADA BIDANG MIRING',
    constantBadge: 'g = 9.80 m/s² · L = 6.0 m',
    quickActions: [
      '💡 Analogi Bidang Miring',
      '⚙️ Pengaruh Gesekan (μ) & Sudut Kritis',
      '🚗 Beda Simulasi Peti vs Mobil',
      '📝 Latihan Soal Hukum II Newton',
    ],
    guidedSteps: [
      {
        step: 1,
        shortLabel: '1. Pilih Objek',
        instruction: 'Pilih simulasi Peti Barang atau Mobil & Bukit, lalu atur θ, h, m, W, dan μ.',
      },
      {
        step: 2,
        shortLabel: '2. Amati Vektor',
        instruction: 'Jalankan simulasi dan amati panah gaya W, N, W·sin θ, gesekan f, serta animasi gesek μ.',
      },
      {
        step: 3,
        shortLabel: '3. Cek Analisis',
        instruction: 'Buka tab Analisis & Rumus untuk melihat animasi grafik dan penjabaran Hukum II Newton.',
      },
      {
        step: 4,
        shortLabel: '4. Catat',
        instruction: 'Simpan hasil variasi ke Lembar Kerja untuk menyusun rangkuman praktikum.',
      },
    ],
  },
  {
    id: 'physics-circuit',
    subject: 'fisika',
    categoryLabel: 'Fisika Listrik Dinamis',
    title: 'Rangkaian Listrik Dinamis',
    shortTitle: 'Fisika: Rangkaian Listrik',
    description:
      'Simulasi 3D rangkaian Seri, Paralel, dan Campuran dengan saklar interaktif, variasi lampu, Hukum Ohm, serta Hukum I & II Kirchhoff.',
    previewBadge: 'Seri · Paralel · Campuran',
    stageTag: 'MODUL FISIKA • LISTRIK DINAMIS',
    constantBadge: 'Hukum Ohm & Kirchhoff I–II',
    quickActions: [
      '⚡ Beda Seri, Paralel & Campuran',
      '🔀 Cara Kerja Hukum I & II Kirchhoff',
      '💡 Pengaruh Saklar & Variasi Lampu',
      '📝 Latihan Hitung Rangkaian Campuran',
    ],
    guidedSteps: [
      {
        step: 1,
        shortLabel: '1. Susun Rangkaian',
        instruction: 'Pilih susunan Seri, Paralel, atau Campuran lalu atur V, R₁, R₂, R₃, Saklar, dan Lampu.',
      },
      {
        step: 2,
        shortLabel: '2. Uji Saklar & 3D',
        instruction: 'Klik saklar 3D (ON/OFF) dan jalankan simulasi untuk melihat aliran muatan & nyala lampu.',
      },
      {
        step: 3,
        shortLabel: '3. Analisis Grafik',
        instruction: 'Amati animasi kurva I–V, I–R, dan perbandingan cabang serta keterangan rumus di tab Analisis & AI.',
      },
      {
        step: 4,
        shortLabel: '4. Catat',
        instruction: 'Pilih hasil variasi rangkaian di Lembar Kerja untuk menyusun rangkuman praktikum.',
      },
    ],
  },
  {
    id: 'biology-anatomy',
    subject: 'biologi',
    categoryLabel: 'Anatomi & Fisiologi',
    title: 'Anatomi Organ Kardiorespirasi',
    shortTitle: 'Biologi: Anatomi Organ',
    description:
      'Eksplorasi struktur realistis jantung, paru-paru, dan aorta dengan pemisahan organ serta pembelahan penampang dalam.',
    previewBadge: '3 Mode · Penampang 3D',
    stageTag: 'MODUL BIOLOGI • ANATOMI KARDIORESPIRASI',
    constantBadge: 'Model 3D Toraks · CC BY-NC-SA 4.0',
    quickActions: [
      '🫀 Cara Kerja Katup & 4 Ruang Jantung',
      '🫁 Mekanisme Pertukaran Gas di Alveolus',
      '🩺 Studi Kasus Gangguan Kardiorespirasi',
    ],
    guidedSteps: [
      {
        step: 1,
        shortLabel: '1. Amati Utuh',
        instruction: 'Amati posisi anatomis jantung, paru kanan, paru kiri, dan aorta pada mode Utuh.',
      },
      {
        step: 2,
        shortLabel: '2. Pisahkan',
        instruction: 'Pilih mode Pisahkan lalu klik organ di kanvas 3D untuk mengamati batas tiap organ.',
      },
      {
        step: 3,
        shortLabel: '3. Belah Organ',
        instruction: 'Aktifkan mode Belah Organ dan Label Bagian Dalam untuk menginspeksi ruang jantung, bronkus, & lumen aorta.',
      },
      {
        step: 4,
        shortLabel: '4. Catat Fungsi',
        instruction: 'Simpan hasil identifikasi struktur dan fungsi fisiologis tiap organ ke Lembar Kerja.',
      },
    ],
  },
  {
    id: 'biology-cell',
    subject: 'biologi',
    categoryLabel: 'Sitologi Tumbuhan',
    title: 'Struktur & Organel Sel Tumbuhan',
    shortTitle: 'Biologi: Sel Tumbuhan',
    description:
      'Eksplorasi model 3D utuh sel tumbuhan dengan auto-zoom tiap organel serta simulasi respon sel saat terkena cahaya dan gelap.',
    previewBadge: 'Model 3D Organel · Terang/Gelap',
    stageTag: 'MODUL BIOLOGI • STRUKTUR SEL TUMBUHAN',
    constantBadge: '13 Organel Sel Tumbuhan',
    quickActions: [
      '🌿 Ciri khas utama Sel Tumbuhan',
      '☀️ Efek terkena cahaya vs gelap pada sel',
      '🔋 Peran Kloroplas & Mitokondria bersama',
      '📝 Uji pemahaman organel sel tumbuhan',
    ],
    guidedSteps: [
      {
        step: 1,
        shortLabel: '1. Pilih Cahaya',
        instruction: 'Uji kondisi Terkena Cahaya maupun Tanpa Cahaya (Gelap) pada sel tumbuhan 3D.',
      },
      {
        step: 2,
        shortLabel: '2. Auto-Zoom Organel',
        instruction: 'Pilih nama organel atau klik langsung bagian model 3D untuk auto-zoom ke struktur tersebut.',
      },
      {
        step: 3,
        shortLabel: '3. Pahami & Tanya AI',
        instruction: 'Pelajari rincian tiap organel dan berdiskusi real-time bersama AI Co-Pilot di tab Analisis & AI.',
      },
      {
        step: 4,
        shortLabel: '4. Catat',
        instruction: 'Simpan hasil pengamatan organel dan respon cahayanya ke Lembar Kerja siswa.',
      },
    ],
  },
  {
    id: 'math-geometry3d',
    subject: 'matematika',
    categoryLabel: 'Matematika Kelas XI',
    title: 'Transformasi Geometri & Lingkaran',
    shortTitle: 'Matematika: Transformasi & Lingkaran',
    description:
      'Visualisasi translasi, refleksi, rotasi, dilatasi dengan matriks 2×2 serta unsur lingkaran (busur, juring, sudut keliling, dan garis singgung).',
    previewBadge: 'Matriks 2×2 · Busur & Juring',
    stageTag: 'MODUL MATEMATIKA • TRANSFORMASI & LINGKARAN',
    constantBadge: 'Kurikulum Merdeka · R²',
    quickActions: [
      '🔢 Cara Baca Matriks Transformasi 2×2',
      '📐 Mengapa Luas = |det(M)| × Luas Awal?',
      '⭕ Hubungan Sudut Pusat vs Sudut Keliling',
      '📏 Pembuktian Garis Singgung 90° (Pythagoras)',
    ],
    guidedSteps: [
      {
        step: 1,
        shortLabel: '1. Pilih Sub-Mode',
        instruction: 'Pilih sub-mode Transformasi Geometri atau Lingkaran pada panel Variabel Simulasi.',
      },
      {
        step: 2,
        shortLabel: '2. Atur Parameter',
        instruction: 'Ubah translasi, refleksi, rotasi, dilatasi, atau jari-jari & sudut lingkaran di bidang 3D.',
      },
      {
        step: 3,
        shortLabel: '3. Detail Rumus',
        instruction: 'Buka tab Analisis & AI untuk melihat penjabaran matriks 2×2 atau unsur lingkaran dan berdiskusi.',
      },
      {
        step: 4,
        shortLabel: '4. Catat',
        instruction: 'Simpan variasi Transformasi & Lingkaran ke Lembar Kerja untuk menyusun laporan siswa.',
      },
    ],
  },
];

export const MODULE_MAP: Record<ModuleId, ModuleDefinition> = MODULES.reduce(
  (acc, mod) => {
    acc[mod.id] = mod;
    return acc;
  },
  {} as Record<ModuleId, ModuleDefinition>,
);
