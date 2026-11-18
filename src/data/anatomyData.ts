import type {
  AnatomyInspectionMode,
  AnatomyLungVariant,
  AnatomyOrganKey,
  AnatomySeparablePart,
} from '../types/lab';

export const ANATOMY_MODEL_URL = '/models/anatomi_kardiorespirasi.glb';

export const ANATOMY_DETAIL_MODEL_URLS = {
  heart: '/models/heart.glb',
  lungsNormal: '/models/lungs-normal.glb',
  lungsTransparent: '/models/lungs-transparent.glb',
  aorta: '/models/aorta.glb',
} as const;

export const ANATOMY_LICENSE_BY_FOCUS: Record<string, string> = {
  semua: 'Model 3D Toraks: "Healthy heart and lungs" oleh E-learning UMCG (CC BY-NC-SA 4.0)',
  jantung: 'Model 3D Jantung: "Beating-heart" oleh jalmer (CC BY 4.0)',
  'paru-normal': 'Model 3D Paru Normal: "Lungs - normal study" oleh valchanov (CC BY 4.0)',
  'paru-transparan': 'Model 3D Paru Transparan: "Lungs" oleh prasanth.k (CC BY 4.0)',
  aorta: 'Model 3D Aorta: "Coarctation of the aorta" oleh E-learning UMCG (CC BY-NC-SA 4.0)',
};

export const ANATOMY_LICENSE_ATTRIBUTION =
  'Atribusi Model 3D: "Healthy heart and lungs" & "Coarctation of the aorta" (E-learning UMCG, CC BY-NC-SA 4.0); "Beating-heart" (jalmer, CC BY 4.0); "Lungs - normal study" (valchanov, CC BY 4.0); "Lungs" (prasanth.k, CC BY 4.0).';

export const ANATOMY_GLB_NODES = {
  aorta: {
    utuh: 'Organ_Aorta_Pembuluh',
    depan: 'Organ_Aorta_Depan',
    dalam: 'Organ_Aorta_Dalam',
  },
  jantung: {
    utuh: 'Organ_Jantung_Utuh',
    depan: 'Organ_Jantung_Depan',
    dalam: 'Organ_Jantung_Dalam',
  },
  paruKanan: {
    utuh: 'Organ_Paru_Kanan',
    depan: 'Organ_Paru_Kanan_Depan',
    dalam: 'Organ_Paru_Kanan_Dalam',
  },
  paruKiri: {
    utuh: 'Organ_Paru_Kiri',
    depan: 'Organ_Paru_Kiri_Depan',
    dalam: 'Organ_Paru_Kiri_Dalam',
  },
} as const;

export const SEPARABLE_PARTS: AnatomySeparablePart[] = [
  'jantung',
  'paru-kanan',
  'paru-kiri',
  'aorta',
];

export const ORGAN_EXPLODE_OFFSETS: Record<AnatomySeparablePart, [number, number, number]> = {
  jantung: [0, -0.22, 0.78],
  'paru-kanan': [-0.82, 0.04, 0.06],
  'paru-kiri': [0.82, 0.04, 0.06],
  aorta: [0, 0.62, -0.32],
};

export interface AnatomyStructureDetail {
  id: string;
  organ: AnatomyOrganKey;
  partKey?: AnatomySeparablePart;
  name: string;
  shortLabel?: string;
  latinName?: string;
  location: string;
  functionSummary: string;
  physiologicalMechanism: string;
  isInternal: boolean;
  calloutPosition?: [number, number, number];
  calloutOffset?: [number, number, number];
  calloutAccent?: 'teal' | 'charcoal';
}

export const ANATOMY_STRUCTURES: Record<string, AnatomyStructureDetail> = {
  // === 1. RINGKASAN & TORAKS TERPADU (anatomi_kardiorespirasi.glb) ===
  'ringkasan-toraks': {
    id: 'ringkasan-toraks',
    organ: 'semua',
    name: 'Sistem Kardiorespirasi Toraks',
    latinName: 'Cor, Pulmones & Arcus Aortae',
    location: 'Rongga dada (mediastinum & pleura kanan–kiri)',
    functionSummary:
      'Mengintegrasikan pertukaran gas O₂/CO₂ di paru-paru dengan pemompaan darah oleh jantung menuju sirkulasi sistemik melalui aorta.',
    physiologicalMechanism:
      'Darah miskin O₂ dipompa dari jantung kanan ke paru-paru untuk oksigenasi di alveolus, lalu kembali ke jantung kiri untuk diedarkan ke seluruh tubuh melalui aorta.',
    isInternal: false,
  },
  'jantung-utuh': {
    id: 'jantung-utuh',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Jantung (Miokardium & Perikardium)',
    shortLabel: 'Jantung (Utuh)',
    latinName: 'Cor',
    location: 'Mediastinum tengah rongga toraks, sedikit condong ke kiri (apeks ke arah kiri bawah)',
    functionSummary:
      'Organ otot berongga empat ruang yang memompa darah secara berirama ke sirkulasi pulmonal (paru-paru) dan sistemik (seluruh tubuh).',
    physiologicalMechanism:
      'Dinding miokardium berkontraksi (sistolik) untuk mendorong darah keluar dan berelaksasi (diastolik) untuk mengisi ruang jantung; dibungkus kantung perikardium pelindung.',
    isInternal: false,
    calloutPosition: [0.05, -0.28, 0.52],
    calloutOffset: [1.55, -0.55, 1.05],
    calloutAccent: 'teal',
  },
  'serambi-kanan': {
    id: 'serambi-kanan',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Serambi Kanan (Atrium Dekster)',
    shortLabel: 'Serambi Kanan',
    latinName: 'Atrium Dextrum',
    location: 'Bagian kanan atas jantung, terhubung langsung dengan vena kava superior dan inferior',
    functionSummary:
      'Menerima darah miskin O₂ (kaya CO₂) dari seluruh jaringan tubuh sebelum dialirkan ke bilik kanan.',
    physiologicalMechanism:
      'Saat atrium berkontraksi, darah mengalir melewati katup trikuspidalis menuju bilik kanan pada fase pengisian ventrikel.',
    isInternal: true,
    calloutPosition: [-0.3, 0.04, 0.04],
    calloutOffset: [-1.35, 0.48, 0.95],
    calloutAccent: 'charcoal',
  },
  'bilik-kanan': {
    id: 'bilik-kanan',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Bilik Kanan (Ventrikel Dekster)',
    shortLabel: 'Bilik Kanan',
    latinName: 'Ventriculus Dexter',
    location: 'Bagian kanan bawah rongga jantung dengan dinding otot lebih tipis dibanding bilik kiri',
    functionSummary:
      'Memompa darah miskin O₂ menuju paru-paru melalui arteri pulmonalis (sirkulasi pulmonal).',
    physiologicalMechanism:
      'Tekanan sistolik bilik kanan lebih rendah daripada bilik kiri karena jarak tempuh darah ke kapiler paru relatif dekat dan bertekanan rendah.',
    isInternal: true,
    calloutPosition: [-0.2, -0.36, 0.04],
    calloutOffset: [-1.35, -0.75, 0.95],
    calloutAccent: 'charcoal',
  },
  'serambi-kiri': {
    id: 'serambi-kiri',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Serambi Kiri (Atrium Sinister)',
    shortLabel: 'Serambi Kiri',
    latinName: 'Atrium Sinistrum',
    location: 'Bagian kiri atas jantung, menerima muara 4 vena pulmonalis dari kedua paru-paru',
    functionSummary:
      'Menampung darah kaya oksigen (O₂) hasil pertukaran gas di paru-paru sebelum diteruskan ke bilik kiri.',
    physiologicalMechanism:
      'Darah teroksigenasi mengalir melalui katup bikuspidalis (mitral) menuju bilik kiri tanpa tercampur dengan darah di sisi kanan.',
    isInternal: true,
    calloutPosition: [0.28, 0.06, 0.02],
    calloutOffset: [1.45, 0.45, 0.85],
    calloutAccent: 'teal',
  },
  'bilik-kiri': {
    id: 'bilik-kiri',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Bilik Kiri (Ventrikel Sinister)',
    shortLabel: 'Bilik Kiri',
    latinName: 'Ventriculus Sinister',
    location: 'Bagian kiri bawah membentuk apeks jantung dengan lapisan miokardium paling tebal',
    functionSummary:
      'Memompa darah kaya O₂ bertekanan tinggi ke seluruh tubuh melalui lengkung aorta (sirkulasi sistemik).',
    physiologicalMechanism:
      'Ketebalan ototnya sekitar 2–3 kali lipat bilik kanan agar mampu menghasilkan tekanan tinggi guna mengatasi resistensi pembuluh sistemik.',
    isInternal: true,
    calloutPosition: [0.24, -0.36, 0.04],
    calloutOffset: [1.45, -0.72, 0.95],
    calloutAccent: 'teal',
  },
  'katup-sekat': {
    id: 'katup-sekat',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Katup & Sekat Jantung (Septum)',
    shortLabel: 'Katup & Sekat',
    latinName: 'Valvae Cordis & Septum Interventriculare',
    location: 'Di antara serambi–bilik (trikuspidalis & mitral), pangkal arteri (semilunaris), serta pemisah kanan–kiri',
    functionSummary:
      'Menjaga aliran darah tetap satu arah (mencegah regurgitasi) dan mencegah percampuran darah kaya O₂ dan kaya CO₂.',
    physiologicalMechanism:
      'Katup membuka dan menutup pasif mengikuti gradien tekanan ruang jantung; bunyi "lub-dub" timbul akibat penutupan katup atrioventrikular dan semilunaris.',
    isInternal: true,
    calloutPosition: [0.0, -0.18, 0.06],
    calloutOffset: [0.1, -1.05, 1.35],
    calloutAccent: 'teal',
  },

  // === 2. DETAIL JANTUNG BERDENYUT (heart.glb — 24 Bone Joints) ===
  'heart-muscle': {
    id: 'heart-muscle',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Miokardium & Bilik Jantung',
    shortLabel: 'Miokardium & Bilik',
    latinName: 'Myocardium & Ventriculi',
    location: 'Lapisan otot tengah dinding jantung yang membentuk bilik kanan dan bilik kiri',
    functionSummary:
      'Menghasilkan gaya kontraksi sistolik untuk memompa darah keluar ke sirkulasi pulmonal dan sistemik.',
    physiologicalMechanism:
      'Otot jantung bekerja secara involunter dan sinkron melalui sistem konduksi nodus SA → nodus AV → berkas His → serabut Purkinje.',
    isInternal: true,
  },
  'heart-right-atrium': {
    id: 'heart-right-atrium',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Serambi Kanan (Atrium Dekster)',
    shortLabel: 'Serambi Kanan',
    latinName: 'Atrium Dextrum',
    location: 'Sisi kanan atas jantung, tempat bermuaranya vena kava superior dan inferior',
    functionSummary:
      'Menerima darah miskin O₂ dari seluruh tubuh dan meneruskannya melewati katup trikuspidalis ke bilik kanan.',
    physiologicalMechanism:
      'Di dinding atas serambi kanan terdapat nodus sinoatrial (SA node) sebagai pacu jantung alami yang memicu irama detak.',
    isInternal: true,
  },
  'heart-left-atrium': {
    id: 'heart-left-atrium',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Serambi Kiri (Atrium Sinister)',
    shortLabel: 'Serambi Kiri',
    latinName: 'Atrium Sinistrum',
    location: 'Sisi kiri atas jantung, menerima 4 vena pulmonalis dari paru kanan dan kiri',
    functionSummary:
      'Menampung darah teroksigenasi dari paru-paru sebelum dialirkan ke bilik kiri melalui katup mitral.',
    physiologicalMechanism:
      'Kontraksi atrium kiri menyumbang pengisian akhir ventrikel kiri (atrial kick) sebelum sistol dimulai.',
    isInternal: true,
  },
  'heart-tricuspid-valve': {
    id: 'heart-tricuspid-valve',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Katup Trikuspidalis (3 Daun Katup)',
    shortLabel: 'Katup Trikuspidalis',
    latinName: 'Valva Tricuspidalis',
    location: 'Antara serambi kanan dan bilik kanan jantung',
    functionSummary:
      'Membuka saat diastol agar darah mengalir ke bilik kanan dan menutup rapat saat sistol mencegah aliran balik.',
    physiologicalMechanism:
      'Ditahan oleh korda tendinea dan otot papilaris agar daun katup tidak terdorong membalik ke serambi kanan.',
    isInternal: true,
  },
  'heart-mitral-valve': {
    id: 'heart-mitral-valve',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Katup Mitral / Bikuspidalis (2 Daun Katup)',
    shortLabel: 'Katup Mitral',
    latinName: 'Valva Mitralis (Bicuspidalis)',
    location: 'Antara serambi kiri dan bilik kiri jantung',
    functionSummary:
      'Mengatur aliran darah kaya O₂ satu arah dari serambi kiri masuk ke bilik kiri.',
    physiologicalMechanism:
      'Penutupan serempak katup mitral dan trikuspidalis di awal sistol menghasilkan bunyi jantung pertama ("lub").',
    isInternal: true,
  },
  'heart-pulmonary-valve': {
    id: 'heart-pulmonary-valve',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Katup Semilunaris Pulmonalis',
    shortLabel: 'Katup Pulmonalis',
    latinName: 'Valva Trunci Pulmonalis',
    location: 'Pangkal arteri pulmonalis yang keluar dari bilik kanan',
    functionSummary:
      'Membuka saat bilik kanan berkontraksi menuju paru-paru dan menutup untuk mencegah darah kembali ke bilik kanan.',
    physiologicalMechanism:
      'Memiliki 3 katup berbentuk bulan sabit (*semilunar cusps*) yang menutup otomatis saat tekanan arteri pulmonalis melebihi tekanan bilik kanan.',
    isInternal: true,
  },
  'heart-aortic-valve': {
    id: 'heart-aortic-valve',
    organ: 'jantung',
    partKey: 'jantung',
    name: 'Katup Semilunaris Aorta',
    shortLabel: 'Katup Aorta',
    latinName: 'Valva Aortae',
    location: 'Pangkal aorta yang keluar dari bilik kiri jantung',
    functionSummary:
      'Mengalirkan darah beroksigen bertekanan tinggi ke aorta saat sistol dan mencegah regurgitasi ke bilik kiri saat diastol.',
    physiologicalMechanism:
      'Penutupan katup aorta dan pulmonalis pada awal relaksasi ventrikel menghasilkan bunyi jantung kedua ("dub").',
    isInternal: true,
  },

  // === 3. PARU-PARU MODE NORMAL (lungs-normal.glb) & RINGKASAN TORAKS ===
  'paru-kanan-utuh': {
    id: 'paru-kanan-utuh',
    organ: 'paru',
    partKey: 'paru-kanan',
    name: 'Paru-paru Kanan (3 Lobus)',
    shortLabel: 'Paru Kanan (3 Lobus)',
    latinName: 'Pulmo Dexter',
    location: 'Rongga pleura sisi kanan toraks; sedikit lebih pendek dan lebih lebar dibanding paru kiri',
    functionSummary:
      'Melaksanakan ventilasi dan pertukaran gas O₂–CO₂ pada tiga lobus (superior, medius, dan inferior).',
    physiologicalMechanism:
      'Kontraksi diafragma dan otot antartulang rusuk memperbesar volume rongga dada sehingga tekanan intrapulmoner turun dan udara masuk (inspirasi).',
    isInternal: false,
    calloutPosition: [-0.72, 0.12, 0.35],
    calloutOffset: [-1.45, 0.85, 0.65],
    calloutAccent: 'charcoal',
  },
  'paru-kiri-utuh': {
    id: 'paru-kiri-utuh',
    organ: 'paru',
    partKey: 'paru-kiri',
    name: 'Paru-paru Kiri (2 Lobus & Takik Jantung)',
    shortLabel: 'Paru Kiri (2 Lobus)',
    latinName: 'Pulmo Sinister',
    location: 'Rongga pleura sisi kiri toraks; memiliki lekukan jantung (cardiac notch) pada bagian medial bawah',
    functionSummary:
      'Menyediakan permukaan difusi gas pada dua lobus (superior & inferior) sekaligus memberi ruang bagi apeks jantung.',
    physiologicalMechanism:
      'Bekerja serempak dengan paru kanan di dalam selaput pleura ganda yang mencegah gesekan dan menjaga tekanan negatif intrapleura.',
    isInternal: false,
    calloutPosition: [0.62, 0.12, 0.35],
    calloutOffset: [1.45, 0.85, 0.65],
    calloutAccent: 'charcoal',
  },
  'lung-normal-fissures': {
    id: 'lung-normal-fissures',
    organ: 'paru',
    name: 'Fisura Interlobaris & Permukaan Pleura',
    shortLabel: 'Fisura & Pleura',
    latinName: 'Fissura Obliqua, Horizontalis & Pleura Visceralis',
    location: 'Celah pemisah antar-lobus pada permukaan paru normal serta selaput pelapis luar',
    functionSummary:
      'Memungkinkan tiap lobus paru mengembang fleksibel selama inspirasi tanpa gesekan dengan dinding dada.',
    physiologicalMechanism:
      'Cairan serosa di dalam rongga pleura menciptakan tegangan permukaan yang menarik paru mengembang mengikuti gerakan sangkar rusuk.',
    isInternal: false,
  },
  'lung-normal-apex-base': {
    id: 'lung-normal-apex-base',
    organ: 'paru',
    name: 'Apeks, Basis Paru & Hilus Pulmonalis',
    shortLabel: 'Apeks, Basis & Hilus',
    latinName: 'Apex, Basis Pulmonis & Hilum',
    location: 'Ujung atas paru (apeks), dasar cekung di atas diafragma (basis), dan gerbang masuk bronkus/pembuluh (hilus)',
    functionSummary:
      'Basis paru menerima dorongan langsung diafragma saat bernapas; hilus menjadi jalur masuk bronkus utama dan pembuluh darah pulmonal.',
    physiologicalMechanism:
      'Saat diafragma mendatar ke bawah ketika inspirasi, kapasitas paru meningkat terutama pada bagian basis.',
    isInternal: false,
  },
  'bronkus-bronkiolus': {
    id: 'bronkus-bronkiolus',
    organ: 'paru',
    partKey: 'paru-kanan',
    name: 'Percabangan Bronkus & Bronkiolus',
    shortLabel: 'Bronkus & Bronkiolus',
    latinName: 'Bronchus Principalis & Bronchioli',
    location: 'Masuk melalui hilus di bagian tengah dalam paru kanan dan kiri lalu bercabang membentuk pohon bronkial',
    functionSummary:
      'Menyalurkan, menghangatkan, melembapkan, dan menyaring udara pernapasan dari trakea menuju alveolus.',
    physiologicalMechanism:
      'Dinding bronkus diperkuat cincin tulang rawan hialin dan dilapisi epitel bersilia bersel goblet untuk menjebak partikel asing, sedangkan bronkiolus bermuskulatur polos mengatur diameter saluran napas.',
    isInternal: true,
    calloutPosition: [-0.54, 0.15, -0.18],
    calloutOffset: [-1.55, 0.95, 0.55],
    calloutAccent: 'teal',
  },
  'parenkim-alveolus': {
    id: 'parenkim-alveolus',
    organ: 'paru',
    partKey: 'paru-kiri',
    name: 'Parenkim Paru & Alveolus',
    shortLabel: 'Parenkim & Alveolus',
    latinName: 'Alveoli Pulmonis',
    location: 'Jaringan spons di seluruh bagian dalam lobus paru yang dikelilingi anyaman kapiler pulmonal',
    functionSummary:
      'Lokasi utama pertukaran gas eksternal: O₂ berdifusi masuk ke hemoglobin eritrosit dan CO₂ berdifusi keluar ke rongga udara.',
    physiologicalMechanism:
      'Dinding epitel skuamosa selapis yang sangat tipis (~0,5 µm) serta luas permukaan total ~70 m² memaksimalkan laju difusi pasif berdasarkan perbedaan tekanan parsial gas.',
    isInternal: true,
    calloutPosition: [0.66, -0.22, -0.2],
    calloutOffset: [1.55, 0.72, 0.55],
    calloutAccent: 'teal',
  },

  // === 4. PARU-PARU MODE TRANSPARAN (lungs-transparent.glb — 12 Named Nodes) ===
  'lung-t-trachea': {
    id: 'lung-t-trachea',
    organ: 'paru',
    name: 'Trakea (Batang Tenggorok)',
    shortLabel: 'Trakea',
    latinName: 'Trachea',
    location: 'Saluran utama vertikal di bagian tengah leher hingga mediastinum atas sebelum bercabang di karina',
    functionSummary:
      'Menyalurkan udara antara laring dan bronkus utama serta menyaring debu menggunakan silia dan mukus.',
    physiologicalMechanism:
      'Diperkuat 16–20 cincin tulang rawan hialin berbentuk huruf C agar saluran napas tetap terbuka meski tekanan intratoraks berubah.',
    isInternal: true,
  },
  'lung-t-bronchi-right': {
    id: 'lung-t-bronchi-right',
    organ: 'paru',
    name: 'Bronkus & Pohon Bronkial Kanan',
    shortLabel: 'Bronkus Kanan',
    latinName: 'Bronchus Principalis Dexter',
    location: 'Cabang kanan dari trakea yang lebih lebar, lebih pendek, dan lebih vertikal masuk ke paru kanan',
    functionSummary:
      'Mengalirkan udara ke tiga lobus paru kanan (superior, medius, inferior) melalui bronkus lobaris dan segmentalis.',
    physiologicalMechanism:
      'Karena posisinya lebih lurus dan lebar dibanding kiri, benda asing yang terhirup lebih sering masuk ke bronkus kanan.',
    isInternal: true,
  },
  'lung-t-bronchi-left': {
    id: 'lung-t-bronchi-left',
    organ: 'paru',
    name: 'Bronkus & Pohon Bronkial Kiri',
    shortLabel: 'Bronkus Kiri',
    latinName: 'Bronchus Principalis Sinister',
    location: 'Cabang kiri dari trakea yang lebih sempit dan lebih landai melewati bawah lengkung aorta menuju paru kiri',
    functionSummary:
      'Menyalurkan udara ke dua lobus paru kiri (superior dan inferior) hingga ke bronkiolus terminalis.',
    physiologicalMechanism:
      'Otot polos dinding saluran napas dapat berkonstriksi atau berdilatasi untuk mengatur resistensi aliran udara.',
    isInternal: true,
  },
  'lung-t-right': {
    id: 'lung-t-right',
    organ: 'paru',
    name: 'Paru-paru Kanan (Parenkim Transparan)',
    shortLabel: 'Paru Kanan',
    latinName: 'Pulmo Dexter',
    location: 'Selubung parenkim sisi kanan yang menyelubungi percabangan bronkus kanan dan jutaan alveolus',
    functionSummary:
      'Menampung udara inspirasi dan menjadi area difusi O₂–CO₂ pada tiga lobus paru kanan.',
    physiologicalMechanism:
      'Tampilan transparan memudahkan pengamatan langsung bagaimana cabang bronkus menyebar ke seluruh volume lobus paru.',
    isInternal: true,
  },
  'lung-t-left': {
    id: 'lung-t-left',
    organ: 'paru',
    name: 'Paru-paru Kiri (Parenkim Transparan)',
    shortLabel: 'Paru Kiri',
    latinName: 'Pulmo Sinister',
    location: 'Selubung parenkim sisi kiri dengan takik jantung yang menyelubungi bronkus kiri',
    functionSummary:
      'Menampung udara dan melaksanakan pertukaran gas pada dua lobus paru kiri.',
    physiologicalMechanism:
      'Volumenya sedikit lebih kecil dibanding paru kanan karena berbagi ruang rongga dada dengan jantung.',
    isInternal: true,
  },
  'lung-t-thyroid-cartilage': {
    id: 'lung-t-thyroid-cartilage',
    organ: 'paru',
    name: 'Tulang Rawan Tiroid (Laring)',
    shortLabel: 'Tulang Rawan Tiroid',
    latinName: 'Cartilago Thyroidea',
    location: 'Struktur perisai terbesar di bagian depan laring (jakun) tepat di atas trakea',
    functionSummary:
      'Melindungi pita suara dan pintu masuk saluran napas bagian atas dari benturan mekanis.',
    physiologicalMechanism:
      'Menjadi rangka penahan otot laring yang mengatur tegangan pita suara saat berbicara.',
    isInternal: true,
  },
  'lung-t-epiglotis': {
    id: 'lung-t-epiglotis',
    organ: 'paru',
    name: 'Epiglotis',
    shortLabel: 'Epiglotis',
    latinName: 'Epiglottis',
    location: 'Katup tulang rawan elastis berbentuk daun di bagian atas laring, di belakang pangkal lidah',
    functionSummary:
      'Menutup pintu laring (glotis) saat menelan agar makanan/minuman masuk ke esofagus, bukan ke trakea.',
    physiologicalMechanism:
      'Refleks menelan mengangkat laring ke atas dan melipat epiglotis ke belakang sehingga saluran napas tertutup rapat.',
    isInternal: true,
  },
  'lung-t-vocal-folds': {
    id: 'lung-t-vocal-folds',
    organ: 'paru',
    name: 'Pita Suara (Kiri & Kanan)',
    shortLabel: 'Pita Suara',
    latinName: 'Plica Vocalis (Sinistra & Dextra)',
    location: 'Sepasang lipatan mukosa elastis di dalam rongga laring bagian tengah',
    functionSummary:
      'Bergetar saat udara ekspirasi melewatinya untuk menghasilkan suara (fonasi) dan menutup glotis saat batuk.',
    physiologicalMechanism:
      'Perubahan ketegangan dan jarak antar-pita suara menghasilkan variasi tinggi-rendah nada suara.',
    isInternal: true,
  },
  'lung-t-thyroid-membrane': {
    id: 'lung-t-thyroid-membrane',
    organ: 'paru',
    name: 'Membran Tirohioid',
    shortLabel: 'Membran Tirohioid',
    latinName: 'Membrana Thyrohyoidea',
    location: 'Selaput fibrosa yang menghubungkan tepi atas tulang rawan tiroid dengan tulang hioid',
    functionSummary:
      'Menjaga posisi laring tetap terikat fleksibel di leher saat bernapas maupun menelan.',
    physiologicalMechanism:
      'Memungkinkan laring bergerak naik-turun secara vertikal tanpa menyumbat jalur udara trakea.',
    isInternal: true,
  },
  'lung-t-cricothyroid': {
    id: 'lung-t-cricothyroid',
    organ: 'paru',
    name: 'Ligamen Krikotiroid',
    shortLabel: 'Ligamen Krikotiroid',
    latinName: 'Ligamentum Cricothyroideum',
    location: 'Jaringan ikat elastis di antara bagian bawah tulang rawan tiroid dan cincin krikoid',
    functionSummary:
      'Menstabilkan sambungan antar-tulang rawan laring serta menjaga celah fleksibel saat pita suara meregang.',
    physiologicalMechanism:
      'Memungkinkan kemiringan ringan tulang rawan tiroid ke depan guna menegangkan pita suara.',
    isInternal: true,
  },

  // === 5. AORTA & KOARKTASIO (aorta.glb & anatomi_kardiorespirasi.glb) ===
  'aorta-utuh': {
    id: 'aorta-utuh',
    organ: 'aorta',
    partKey: 'aorta',
    name: 'Aorta & Pembuluh Besar Toraks',
    shortLabel: 'Lengkung Aorta',
    latinName: 'Arcus Aortae & Vena Cava',
    location: 'Melengkung di atas pangkal jantung menuju belakang rongga dada beserta percabangan utama',
    functionSummary:
      'Mendistribusikan darah beroksigen bertekanan tinggi ke kepala, lengan, dan seluruh tubuh bagian bawah.',
    physiologicalMechanism:
      'Dinding aorta kaya serabut elastis sehingga meregang saat sistol ventrikel kiri dan memantul kembali (efek Windkessel) untuk menjaga aliran darah tetap kontinu saat diastol.',
    isInternal: false,
    calloutPosition: [-0.06, 0.62, 0.15],
    calloutOffset: [0.25, 1.48, -0.85],
    calloutAccent: 'teal',
  },
  'lumen-aorta': {
    id: 'lumen-aorta',
    organ: 'aorta',
    partKey: 'aorta',
    name: 'Lumen Dalam Aorta & Tunika Media',
    shortLabel: 'Lumen Aorta',
    latinName: 'Lumen Aortae',
    location: 'Saluran rongga dalam lengkung aorta dan cabang arteri utama di bagian atas jantung',
    functionSummary:
      'Menyalurkan volume darah bertekanan tinggi dari bilik kiri menuju arteri karotis, subklavia, dan aorta desendens.',
    physiologicalMechanism:
      'Lumen lebar dengan endotelium halus mengurangi turbulensi aliran; lapisan tunika media elastis menahan puncak tekanan sistolik sekitar 120 mmHg.',
    isInternal: true,
    calloutPosition: [-0.05, 0.45, -0.05],
    calloutOffset: [0.35, 1.45, -0.75],
    calloutAccent: 'teal',
  },
  'aorta-branches': {
    id: 'aorta-branches',
    organ: 'aorta',
    partKey: 'aorta',
    name: 'Percabangan Lengkung Aorta (Kepala & Lengan)',
    shortLabel: 'Cabang Lengkung Aorta',
    latinName: 'Truncus Brachiocephalicus, A. Carotis & A. Subclavia',
    location: 'Tiga cabang besar pada bagian atas lengkung aorta menuju otak, kepala, dan ekstremitas atas',
    functionSummary:
      'Memastikan suplai darah kaya O₂ yang stabil ke otak dan anggota gerak atas langsung setelah keluar dari jantung.',
    physiologicalMechanism:
      'Karena bercabang sebelum aorta turun ke rongga dada/abdomen, tekanan perfusi menuju otak tetap tinggi dan teratur.',
    isInternal: false,
  },
  'aorta-coarctation': {
    id: 'aorta-coarctation',
    organ: 'aorta',
    partKey: 'aorta',
    name: 'Zona Penyempitan Lumen (Studi Kasus Koarktasio Aorta)',
    shortLabel: 'Koarktasio Aorta',
    latinName: 'Coarctatio Aortae',
    location: 'Segmen aorta torakalis setelah percabangan arteri subklavia kiri (terlihat menyempit pada model)',
    functionSummary:
      'Contoh kelainan struktural berupa penyempitan lumen aorta yang menghambat aliran darah ke tubuh bagian bawah.',
    physiologicalMechanism:
      'Penyempitan meningkatkan resistensi vaskular sehingga tekanan darah di lengan/kepala menjadi tinggi, bilik kiri bekerja lebih keras (hipertrofi), sedangkan perfusi tubuh bagian bawah menurun.',
    isInternal: false,
  },
};

export interface TransparentLungNodeMeta {
  nodeName: string;
  structureId: string;
  label: string;
  isOuterParenchyma?: boolean;
}

export const TRANSPARENT_LUNG_NODE_MAP: Record<string, TransparentLungNodeMeta> = {
  Respiratoy_Lung_Geo_Right: {
    nodeName: 'Respiratoy_Lung_Geo_Right',
    structureId: 'lung-t-right',
    label: 'Paru Kanan',
    isOuterParenchyma: true,
  },
  Respiratoy_Lung_Geo_Left: {
    nodeName: 'Respiratoy_Lung_Geo_Left',
    structureId: 'lung-t-left',
    label: 'Paru Kiri',
    isOuterParenchyma: true,
  },
  Respiratoy_Bronchi_Geo_Right: {
    nodeName: 'Respiratoy_Bronchi_Geo_Right',
    structureId: 'lung-t-bronchi-right',
    label: 'Bronkus Kanan',
  },
  Respiratoy_Bronchi_Geo_Left: {
    nodeName: 'Respiratoy_Bronchi_Geo_Left',
    structureId: 'lung-t-bronchi-left',
    label: 'Bronkus Kiri',
  },
  Respiratoy_Trachea_Geo: {
    nodeName: 'Respiratoy_Trachea_Geo',
    structureId: 'lung-t-trachea',
    label: 'Trakea',
  },
  Respiratoy_Thyroid_Cartliage_Geo: {
    nodeName: 'Respiratoy_Thyroid_Cartliage_Geo',
    structureId: 'lung-t-thyroid-cartilage',
    label: 'Tulang Rawan Tiroid',
  },
  Respiratoy_Thyroid_Membrane_Geo: {
    nodeName: 'Respiratoy_Thyroid_Membrane_Geo',
    structureId: 'lung-t-thyroid-membrane',
    label: 'Membran Tirohioid',
  },
  Respiratory_Cricothyroid_Ligament_Geo: {
    nodeName: 'Respiratory_Cricothyroid_Ligament_Geo',
    structureId: 'lung-t-cricothyroid',
    label: 'Ligamen Krikotiroid',
  },
  Respiratoy_Epiglotis_Geo: {
    nodeName: 'Respiratoy_Epiglotis_Geo',
    structureId: 'lung-t-epiglotis',
    label: 'Epiglotis',
  },
  Respiratoy_Epiglotis_Inner_Geo: {
    nodeName: 'Respiratoy_Epiglotis_Inner_Geo',
    structureId: 'lung-t-epiglotis',
    label: 'Epiglotis',
  },
  Respiratoy_True_Vocal_Fold_Geo_Left: {
    nodeName: 'Respiratoy_True_Vocal_Fold_Geo_Left',
    structureId: 'lung-t-vocal-folds',
    label: 'Pita Suara Kiri',
  },
  Respiratoy_True_Vocal_Fold_Geo_Right: {
    nodeName: 'Respiratoy_True_Vocal_Fold_Geo_Right',
    structureId: 'lung-t-vocal-folds',
    label: 'Pita Suara Kanan',
  },
};

export interface HeartJointPinMeta {
  jointName: string;
  structureId: string;
  label: string;
  labelOffset: [number, number, number];
  accent: 'teal' | 'charcoal';
}

export const HEART_JOINT_PINS: HeartJointPinMeta[] = [
  {
    jointName: 'right_atrium_jnt.6_6',
    structureId: 'heart-right-atrium',
    label: 'Serambi Kanan',
    labelOffset: [-1.15, 0.32, 0.25],
    accent: 'charcoal',
  },
  {
    jointName: 'left_atrium_jnt.13_13',
    structureId: 'heart-left-atrium',
    label: 'Serambi Kiri',
    labelOffset: [1.15, 0.35, 0.25],
    accent: 'teal',
  },
  {
    jointName: 'cardiac_muscle_jnt.7_7',
    structureId: 'heart-muscle',
    label: 'Miokardium & Bilik',
    labelOffset: [1.05, -0.58, 0.45],
    accent: 'teal',
  },
  {
    jointName: 'right_tricuspid_valve_jnt.24_24',
    structureId: 'heart-tricuspid-valve',
    label: 'Katup Trikuspidalis',
    labelOffset: [-1.18, -0.25, 0.45],
    accent: 'charcoal',
  },
  {
    jointName: 'left_mitral_valve_jnt.15_15',
    structureId: 'heart-mitral-valve',
    label: 'Katup Mitral',
    labelOffset: [1.22, -0.05, 0.45],
    accent: 'teal',
  },
  {
    jointName: 'aortic_valve_01_jnt.21_21',
    structureId: 'heart-aortic-valve',
    label: 'Katup Aorta',
    labelOffset: [0.18, 1.15, 0.42],
    accent: 'teal',
  },
  {
    jointName: 'right_pulmonary_valve_jnt.9_9',
    structureId: 'heart-pulmonary-valve',
    label: 'Katup Pulmonalis',
    labelOffset: [-1.22, 0.78, 0.35],
    accent: 'charcoal',
  },
];

export interface OrganTabStructures {
  organ: AnatomyOrganKey;
  label: string;
  defaultStructureId: string;
  cutawayDefaultId: string;
  structureIds: string[];
}

export const ORGAN_STRUCTURE_GROUPS: Record<AnatomyOrganKey, OrganTabStructures> = {
  semua: {
    organ: 'semua',
    label: 'Semua Organ Toraks',
    defaultStructureId: 'ringkasan-toraks',
    cutawayDefaultId: 'serambi-kanan',
    structureIds: [
      'ringkasan-toraks',
      'jantung-utuh',
      'paru-kanan-utuh',
      'paru-kiri-utuh',
      'aorta-utuh',
    ],
  },
  jantung: {
    organ: 'jantung',
    label: 'Jantung (Beating Heart)',
    defaultStructureId: 'heart-muscle',
    cutawayDefaultId: 'heart-mitral-valve',
    structureIds: [
      'heart-muscle',
      'heart-right-atrium',
      'heart-left-atrium',
      'heart-tricuspid-valve',
      'heart-mitral-valve',
      'heart-pulmonary-valve',
      'heart-aortic-valve',
    ],
  },
  paru: {
    organ: 'paru',
    label: 'Paru-paru & Saluran Napas',
    defaultStructureId: 'paru-kanan-utuh',
    cutawayDefaultId: 'lung-t-trachea',
    structureIds: [
      'paru-kanan-utuh',
      'paru-kiri-utuh',
      'lung-normal-fissures',
      'lung-normal-apex-base',
    ],
  },
  aorta: {
    organ: 'aorta',
    label: 'Aorta & Koarktasio',
    defaultStructureId: 'aorta-utuh',
    cutawayDefaultId: 'aorta-coarctation',
    structureIds: ['aorta-utuh', 'aorta-branches', 'aorta-coarctation', 'lumen-aorta'],
  },
};

export interface CirculationFlowStep {
  step: number;
  title: string;
  organKey: AnatomyOrganKey;
  badgeText: string;
  badgeTone: 'muted' | 'teal';
  description: string;
}

export interface AdaptiveFlowDefinition {
  title: string;
  badge: string;
  subtitle: string;
  steps: CirculationFlowStep[];
}

export const CARDIORESPIRATORY_FLOW: CirculationFlowStep[] = [
  {
    step: 1,
    title: 'Vena Kava',
    organKey: 'aorta',
    badgeText: 'Miskin O₂ / Kaya CO₂',
    badgeTone: 'muted',
    description: 'Mengembalikan darah miskin O₂ (kaya CO₂) dari jaringan tubuh menuju atrium kanan.',
  },
  {
    step: 2,
    title: 'Jantung Kanan',
    organKey: 'jantung',
    badgeText: 'Miskin O₂ / Kaya CO₂',
    badgeTone: 'muted',
    description: 'Serambi Kanan → Katup Trikuspidalis → Bilik Kanan memompa darah ke arteri pulmonalis.',
  },
  {
    step: 3,
    title: 'Paru-paru (Alveolus)',
    organKey: 'paru',
    badgeText: 'Pertukaran Gas O₂ ↔ CO₂',
    badgeTone: 'teal',
    description: 'Udara masuk lewat trakea & bronkus ke alveolus; CO₂ dilepas dan O₂ berdifusi mengikat hemoglobin.',
  },
  {
    step: 4,
    title: 'Jantung Kiri',
    organKey: 'jantung',
    badgeText: 'Kaya O₂',
    badgeTone: 'teal',
    description: 'Vena Pulmonalis → Serambi Kiri → Katup Mitral → Bilik Kiri berdinding tebal.',
  },
  {
    step: 5,
    title: 'Aorta',
    organKey: 'aorta',
    badgeText: 'Kaya O₂',
    badgeTone: 'teal',
    description: 'Katup Aorta membuka; darah kaya O₂ dipompa lewat lengkung aorta ke seluruh tubuh.',
  },
];

export function getAdaptiveFlowForOrgan(
  focusOrgan: AnatomyOrganKey,
  lungVariant: AnatomyLungVariant = 'normal',
): AdaptiveFlowDefinition {
  if (focusOrgan === 'paru') {
    return {
      title: 'Alur Mekanisme Pernapasan & Pertukaran Gas',
      badge: lungVariant === 'transparan' ? 'Fokus Paru Transparan' : 'Fokus Paru Normal',
      subtitle:
        'Jalur udara pernapasan dari laring menuju alveolus hingga difusi oksigen ke kapiler darah paru.',
      steps: [
        {
          step: 1,
          title: 'Laring, Epiglotis & Pita Suara',
          organKey: 'paru',
          badgeText: 'Saluran Atas',
          badgeTone: 'muted',
          description:
            'Epiglotis menjaga saluran napas terbuka saat bernapas (menutup saat menelan), sementara pita suara dan tulang rawan tiroid mengatur fonasi.',
        },
        {
          step: 2,
          title: 'Trakea (Batang Tenggorok)',
          organKey: 'paru',
          badgeText: 'Konduksi & Filtrasi',
          badgeTone: 'muted',
          description:
            'Cincin tulang rawan berbentuk C menjaga lumen tetap terbuka; silia dan mukus menyaring debu sebelum udara masuk ke cabang bronkus.',
        },
        {
          step: 3,
          title: 'Bronkus & Bronkiolus (Kanan 3 Lobus · Kiri 2 Lobus)',
          organKey: 'paru',
          badgeText: 'Distribusi Udara',
          badgeTone: 'teal',
          description:
            'Bronkus utama kanan dan kiri bercabang menjadi pohon bronkial menuju lobus-lobus paru yang dibungkus selaput pleura.',
        },
        {
          step: 4,
          title: 'Alveolus & Kapiler Pulmonal',
          organKey: 'paru',
          badgeText: 'Difusi O₂ ↔ CO₂',
          badgeTone: 'teal',
          description:
            'O₂ berdifusi menembus epitel alveolus untuk berikatan dengan hemoglobin eritrosit, sedangkan CO₂ berdifusi keluar untuk diekshalasi.',
        },
      ],
    };
  }

  if (focusOrgan === 'jantung') {
    return {
      title: 'Alur Sirkulasi & Mekanisme Katup Jantung',
      badge: 'Fokus Jantung (4 Ruang)',
      subtitle:
        'Urutan pemompaan darah satu arah melewati empat ruang jantung dan empat katup utama.',
      steps: [
        {
          step: 1,
          title: 'Serambi Kanan (Atrium Dekster)',
          organKey: 'jantung',
          badgeText: 'Miskin O₂',
          badgeTone: 'muted',
          description:
            'Menampung darah kaya CO₂ dari vena kava superior dan inferior; nodus SA memicu impuls detak jantung.',
        },
        {
          step: 2,
          title: 'Katup Trikuspidalis → Bilik Kanan → Katup Pulmonalis',
          organKey: 'jantung',
          badgeText: 'Sirkulasi Pulmonal',
          badgeTone: 'muted',
          description:
            'Katup trikuspidalis mencegah aliran balik ke serambi saat bilik kanan memompa darah melewati katup pulmonalis menuju paru-paru.',
        },
        {
          step: 3,
          title: 'Serambi Kiri (Atrium Sinister)',
          organKey: 'jantung',
          badgeText: 'Kaya O₂',
          badgeTone: 'teal',
          description:
            'Menerima darah kaya O₂ dari paru-paru melalui empat vena pulmonalis sebelum diteruskan ke bilik kiri.',
        },
        {
          step: 4,
          title: 'Katup Mitral → Bilik Kiri → Katup Aorta',
          organKey: 'jantung',
          badgeText: 'Sirkulasi Sistemik',
          badgeTone: 'teal',
          description:
            'Miokardium bilik kiri yang paling tebal memompa darah bertekanan tinggi melewati katup aorta menuju seluruh tubuh.',
        },
      ],
    };
  }

  if (focusOrgan === 'aorta') {
    return {
      title: 'Alur Distribusi Sistemik & Koarktasio Aorta',
      badge: 'Fokus Aorta',
      subtitle:
        'Perjalanan darah bertekanan tinggi keluar dari jantung menuju sirkulasi sistemik serta dampak penyempitan lumen.',
      steps: [
        {
          step: 1,
          title: 'Pangkal & Katup Semilunaris Aorta',
          organKey: 'aorta',
          badgeText: 'Tekanan Sistolik Tinggi',
          badgeTone: 'teal',
          description:
            'Menerima semburan darah kaya O₂ langsung dari bilik kiri pada fase sistol ventrikel.',
        },
        {
          step: 2,
          title: 'Lengkung Aorta & Efek Windkessel',
          organKey: 'aorta',
          badgeText: 'Arteri Elastis',
          badgeTone: 'teal',
          description:
            'Dinding tunika media kaya serabut elastis meregang saat sistol dan memantul saat diastol untuk menjaga aliran darah kontinu.',
        },
        {
          step: 3,
          title: 'Percabangan Arteri Kepala & Lengan',
          organKey: 'aorta',
          badgeText: 'Perfusi Otak & Atas',
          badgeTone: 'teal',
          description:
            'Truncus brachiocephalicus, arteri karotis komunis kiri, dan subklavia kiri memasok darah beroksigen ke otak dan ekstremitas atas.',
        },
        {
          step: 4,
          title: 'Aorta Desendens & Zona Koarktasio',
          organKey: 'aorta',
          badgeText: 'Studi Kasus Klinis',
          badgeTone: 'muted',
          description:
            'Penyempitan lumen (koarktasio) meningkatkan tekanan darah di lengan/kepala, membebani kerja bilik kiri, dan menurunkan aliran ke tubuh bawah.',
        },
      ],
    };
  }

  return {
    title: 'Alur Sistematis Peredaran Darah & Respirasi',
    badge: 'Keseluruhan Toraks (Sirkulasi Ganda)',
    subtitle:
      'Integrasi lengkap aliran darah miskin O₂ ke paru-paru dan distribusi darah kaya O₂ dari jantung ke seluruh tubuh.',
    steps: CARDIORESPIRATORY_FLOW,
  };
}

export const NORMAL_PHYSIOLOGY_REFERENCE = {
  heartRate: '60–100 bpm (istirahat ~72 bpm)',
  strokeVolume: '±70 mL/denyut',
  cardiacOutput: '±5,04 L/menit',
  respiratoryRate: '12–16 napas/menit',
} as const;

export const INSPECTION_MODE_LABELS: Record<AnatomyInspectionMode, string> = {
  utuh: 'Utuh',
  pisahkan: 'Pisahkan Organ',
  belah: 'Belah Penampang',
};

export const LUNG_VARIANT_LABELS: Record<AnatomyLungVariant, string> = {
  normal: 'Paru Normal',
  transparan: 'Paru Transparan',
};

export function getOrganDisplayLabel(organ: AnatomyOrganKey): string {
  return ORGAN_STRUCTURE_GROUPS[organ].label;
}

export function getStructureDetail(structureId: string): AnatomyStructureDetail {
  return ANATOMY_STRUCTURES[structureId] ?? ANATOMY_STRUCTURES['ringkasan-toraks'];
}

export function getActiveLicenseAttribution(
  focusOrgan: AnatomyOrganKey,
  lungVariant: AnatomyLungVariant,
): string {
  if (focusOrgan === 'paru') {
    return lungVariant === 'transparan'
      ? ANATOMY_LICENSE_BY_FOCUS['paru-transparan']
      : ANATOMY_LICENSE_BY_FOCUS['paru-normal'];
  }
  return ANATOMY_LICENSE_BY_FOCUS[focusOrgan] ?? ANATOMY_LICENSE_BY_FOCUS.semua;
}

export function getAvailableStructureIdsForState(
  focusOrgan: AnatomyOrganKey,
  inspectionMode: AnatomyInspectionMode,
  lungVariant: AnatomyLungVariant = 'normal',
): string[] {
  if (focusOrgan === 'jantung') {
    return ORGAN_STRUCTURE_GROUPS.jantung.structureIds;
  }

  if (focusOrgan === 'paru') {
    if (lungVariant === 'transparan') {
      return [
        'lung-t-trachea',
        'lung-t-bronchi-right',
        'lung-t-bronchi-left',
        'lung-t-right',
        'lung-t-left',
        'lung-t-thyroid-cartilage',
        'lung-t-epiglotis',
        'lung-t-vocal-folds',
        'lung-t-thyroid-membrane',
        'lung-t-cricothyroid',
      ];
    }
    return [
      'paru-kanan-utuh',
      'paru-kiri-utuh',
      'lung-normal-fissures',
      'lung-normal-apex-base',
    ];
  }

  if (focusOrgan === 'aorta') {
    return ORGAN_STRUCTURE_GROUPS.aorta.structureIds;
  }

  // focusOrgan === 'semua'
  if (inspectionMode === 'belah') {
    return [
      'serambi-kanan',
      'bilik-kanan',
      'serambi-kiri',
      'bilik-kiri',
      'katup-sekat',
      'bronkus-bronkiolus',
      'parenkim-alveolus',
      'lumen-aorta',
    ];
  }

  return ORGAN_STRUCTURE_GROUPS.semua.structureIds;
}
