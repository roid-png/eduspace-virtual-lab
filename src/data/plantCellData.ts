import type {
  PlantCellLightCondition,
  PlantCellOrganelleId,
} from '../types/lab';

export const PLANT_CELL_MODEL_URL =
  '/models/plant_cell_-_cell_structure/scene.gltf';

export const PLANT_CELL_LICENSE_ATTRIBUTION =
  'Model 3D: "Plant Cell - Cell Structure" oleh Vida Systems (CC BY-NC-ND 4.0)';

export type PlantCellCategory =
  | 'Seluruh Sel'
  | 'Pelindung & Sitosol'
  | 'Kontrol Genetik'
  | 'Energi & Metabolisme'
  | 'Sistem Endomembran & Transport';

export interface PlantCellOrganelleInfo {
  id: PlantCellOrganelleId;
  name: string;
  shortLabel: string;
  latinName: string;
  category: PlantCellCategory;
  gltfNodes: string[];
  zoomMultiplier: number;
  location: string;
  summary: string;
  structureDetail: string;
  mainFunction: string;
  lightResponse: string;
  darkResponse: string;
  isInnerStructure: boolean;
}

export const PLANT_CELL_ORGANELLES: Record<
  PlantCellOrganelleId,
  PlantCellOrganelleInfo
> = {
  semua: {
    id: 'semua',
    name: 'Sel Tumbuhan Utuh (Sel Eukariotik Tumbuhan)',
    shortLabel: 'Semua Bagian',
    latinName: 'Cellula vegetabilis',
    category: 'Seluruh Sel',
    gltfNodes: [],
    zoomMultiplier: 1.0,
    location: 'Keseluruhan struktur sel tumbuhan poligonal',
    summary:
      'Sel eukariotik autotrof berciri khas dinding sel selulosa, kloroplas untuk fotosintesis, vakuola sentral besar, dan plasmodesmata.',
    structureDetail:
      'Tersusun atas dinding sel kaku di luar membran plasma, sitoplasma berisi 13 jenis organel bermembran maupun non-membran, serta saluran plasmodesmata antarsel.',
    mainFunction:
      'Menjalankan fotosintesis (autotrof), menjaga tekanan turgor jaringan tumbuhan, menyintesis protein/lipid, dan melakukan respirasi seluler penghasil ATP.',
    lightResponse:
      'Saat terkena cahaya, kloroplas aktif melakukan reaksi terang dan fiksasi karbon (Siklus Calvin), menghasilkan glukosa & O₂ sementara vakuola menjaga turgor sel optimal.',
    darkResponse:
      'Saat tidak terkena cahaya, fotosintesis berhenti sehingga sel mempertahankan suplai energi ATP melalui respirasi seluler oleh mitokondria menggunakan cadangan pati/glukosa.',
    isInnerStructure: false,
  },
  nucleus: {
    id: 'nucleus',
    name: 'Nukleus (Inti Sel)',
    shortLabel: 'Nukleus',
    latinName: 'Nucleus · Karyon',
    category: 'Kontrol Genetik',
    gltfNodes: ['nucleus'],
    zoomMultiplier: 2.2,
    location: 'Bagian tengah-tepi sitoplasma (terdesak oleh vakuola sentral)',
    summary:
      'Pusat kendali seluruh aktivitas sel tumbuhan yang menyimpan DNA kromosom dan mengatur ekspresi gen.',
    structureDetail:
      'Dikelilingi membran ganda (selubung nukleus) berpori-pori untuk lalu lintas RNA/protein, berisi nukleoplasma, kromatin (DNA), dan nukleolus sebagai tempat perakitan ribosom.',
    mainFunction:
      'Menyimpan materi genetik (DNA), mengoordinasikan pembelahan sel (mitosis), serta mengarahkan transkripsi mRNA untuk sintesis enzim fotosintesis maupun protein struktural.',
    lightResponse:
      'Sinyal fotoreseptor saat terkena cahaya memicu nukleus mengaktifkan transkripsi gen penyandi protein kloroplas (seperti enzim RuBisCO dan protein klorofil).',
    darkResponse:
      'Pada kondisi gelap, ekspresi gen terkait jalur fotosintesis diturunkan, sementara gen enzim respirasi dan metabolisme cadangan pati tetap aktif.',
    isInnerStructure: true,
  },
  chloroplast: {
    id: 'chloroplast',
    name: 'Kloroplas',
    shortLabel: 'Kloroplas',
    latinName: 'Chloroplastus',
    category: 'Energi & Metabolisme',
    gltfNodes: ['chloroplast.in', 'chloroplast.out'],
    zoomMultiplier: 2.45,
    location: 'Tersebar di dalam sitoplasma dekat tepi dinding sel',
    summary:
      'Organel khusus sel tumbuhan dan alga berklorofil yang berfungsi menjalankan proses fotosintesis.',
    structureDetail:
      'Memiliki membran ganda luar dan dalam, cairan stroma yang mengandung enzim Siklus Calvin serta DNA sirkuler, dan tumpukan cakram membran tilakoid (grana) tempat pigmen klorofil.',
    mainFunction:
      'Menangkap energi foton cahaya untuk memecah molekul air (fotolisis), membentuk ATP/NADPH pada reaksi terang, lalu mengubah CO₂ menjadi glukosa pada Siklus Calvin.',
    lightResponse:
      'Aktif maksimal: pigmen klorofil di tilakoid menyerap energi foton cahaya, memicu transpor elektron fotosintetik, melepaskan O₂, dan menyintesis ATP, NADPH, serta glukosa.',
    darkResponse:
      'Reaksi terang berhenti total karena tidak ada foton cahaya; Siklus Calvin segera terhenti setelah cadangan ATP dan NADPH habis dan kloroplas masuk ke fase istirahat gelap.',
    isInnerStructure: true,
  },
  vacuole: {
    id: 'vacuole',
    name: 'Vakuola Sentral',
    shortLabel: 'Vakuola',
    latinName: 'Vacuola centralis · Tonoplast',
    category: 'Pelindung & Sitosol',
    gltfNodes: ['vacuole'],
    zoomMultiplier: 1.85,
    location: 'Mendominasi bagian tengah ruang sel tumbuhan',
    summary:
      'Kantung cairan besar bermembran tonoplas yang menyimpan air, ion mineral, pigmen, serta menjaga tekanan turgor sel.',
    structureDetail:
      'Dibungkus membran tunggal selektif permeabel bernama tonoplas, berisi getah sel (air, garam mineral, gula terlarut, asam organik, dan senyawa pertahanan tumbuhan).',
    mainFunction:
      'Memelihara tekanan turgor terhadap dinding sel agar batang dan daun tumbuhan tetap tegak, menyimpan cadangan zat terlarut, dan menjaga keseimbangan pH sitoplasma.',
    lightResponse:
      'Akumulasi gula hasil fotosintesis dan transpor ion saat terang meningkatkan tekanan osmotik vakuola sehingga sel menjadi turgid dan mendukung pembukaan stomata.',
    darkResponse:
      'Menjadi penyangga cadangan ion dan senyawa organik serta membantu mengatur penyesuaian turgor sel penjaga saat laju fotosintesis terhenti.',
    isInnerStructure: true,
  },
  mitochondria: {
    id: 'mitochondria',
    name: 'Mitokondria',
    shortLabel: 'Mitokondria',
    latinName: 'Mitochondrion',
    category: 'Energi & Metabolisme',
    gltfNodes: ['mitochondria'],
    zoomMultiplier: 2.35,
    location: 'Tersebar di dalam sitoplasma sel tumbuhan',
    summary:
      'Organel pembangkit energi (powerhouse) yang menghasilkan ATP melalui proses respirasi seluler aerobik.',
    structureDetail:
      'Memiliki membran luar licin dan membran dalam yang berlekuk-lekuk tajam membentuk krista guna memperluas area rantai transpor elektron, serta matriks tempat Siklus Krebs berlangsung.',
    mainFunction:
      'Mengoksidasi piruvat dan molekul organik melalui Siklus Krebs serta fosforilasi oksidatif untuk memproduksi energi kimia ATP bagi seluruh kerja seluler.',
    lightResponse:
      'Bekerja bersinergi dengan kloroplas: menyuplai ATP bagi sintesis sukrosa dan proses transpor aktif di sitoplasma sekaligus mengolah sebagian produk fotorespirasi.',
    darkResponse:
      'Menjadi sumber energi ATP UTAMA bagi kelangsungan hidup sel saat kloroplas tidak dapat berfotosintesis, dengan memecah cadangan glukosa dan pati secara aerobik.',
    isInnerStructure: true,
  },
  'rough-er': {
    id: 'rough-er',
    name: 'Retikulum Endoplasma Kasar (RE Kasar)',
    shortLabel: 'RE Kasar',
    latinName: 'Reticulum endoplasmicum granulosum',
    category: 'Sistem Endomembran & Transport',
    gltfNodes: ['rough.ER'],
    zoomMultiplier: 2.25,
    location: 'Terhubung langsung dengan selubung luar nukleus',
    summary:
      'Jaringan kantung membran pipih (sisterna) yang ditempeli ribosom untuk sintesis dan pelipatan protein membran/sekretori.',
    structureDetail:
      'Berbentuk lembaran sisterna berlapis yang bersambungan dengan membran luar inti sel, permukaannya dipenuhi butiran ribosom aktif translasi.',
    mainFunction:
      'Menyintesis protein membran, enzim vakuola/lisosom, dan protein pembentuk dinding sel, lalu melipat serta mengemasnya ke vesikel menuju Badan Golgi.',
    lightResponse:
      'Meningkatkan laju sintesis enzim-enzim metabolik dan protein pembawa membran guna mendukung aktivitas sel yang tinggi saat memperoleh cahaya.',
    darkResponse:
      'Tetap menjalankan sintesis protein pemeliharaan seluler dan enzim respirasi secara teratur menggunakan ATP dari mitokondria.',
    isInnerStructure: true,
  },
  'smooth-er': {
    id: 'smooth-er',
    name: 'Retikulum Endoplasma Halus (RE Halus)',
    shortLabel: 'RE Halus',
    latinName: 'Reticulum endoplasmicum agranulosum',
    category: 'Sistem Endomembran & Transport',
    gltfNodes: ['smooth.ER'],
    zoomMultiplier: 2.3,
    location: 'Bercabang di lanjutan RE Kasar dalam sitoplasma',
    summary:
      'Jaringan tubulus membran tanpa ribosom yang berperan menyintesis lipid, fosfolipid membran, dan menyimpan ion Ca²⁺.',
    structureDetail:
      'Tersusun atas pipa-pipa halus (tubulus) bermembran tunggal tanpa tempelan ribosom, memiliki enzim khusus metabolisme lemak dan detoksifikasi.',
    mainFunction:
      'Menyintesis fosfolipid penyusun membran sel dan organel, memproduksi hormon/senyawa metabolit sekunder tumbuhan, serta mengatur sinyal ion kalsium (Ca²⁺).',
    lightResponse:
      'Menyuplai komponen lipid baru untuk pemeliharaan dan perbaikan membran tilakoid maupun membran plasma selama aktivitas fotosintesis tinggi.',
    darkResponse:
      'Menjaga homeostasis ion kalsium (Ca²⁺) intraseluler dan memetabolisme cadangan lipid sebagai penopang kebutuhan sel pada fase gelap.',
    isInnerStructure: true,
  },
  golgi: {
    id: 'golgi',
    name: 'Badan Golgi (Aparatus Golgi / Diktiosom)',
    shortLabel: 'Badan Golgi',
    latinName: 'Apparatus Golgianus · Dictyosoma',
    category: 'Sistem Endomembran & Transport',
    gltfNodes: ['golgi.appratus'],
    zoomMultiplier: 2.35,
    location: 'Di dalam sitoplasma dekat jalur vesikel antara RE dan membran sel',
    summary:
      'Pusat pemrosesan, penyortiran, dan pengemasan polisakarida dinding sel serta protein dari RE menuju tujuan akhirnya.',
    structureDetail:
      'Terdiri atas tumpukan kantung pipih (sisterna) berkutub cis (penerima) dan trans (pengirim) yang melepaskan vesikel-vesikel sekresi.',
    mainFunction:
      'Memodifikasi glikoprotein dari RE dan pada sel tumbuhan secara khusus menyintesis polisakarida matriks dinding sel (pektin dan hemiselulosa) untuk dikirim ke tepi sel.',
    lightResponse:
      'Laju pengemasan vesikel meningkat seiring tersedianya gula prekursor dinding sel dari hasil fotosintesis kloroplas.',
    darkResponse:
      'Melambat ke laju pemeliharaan dasar untuk menyortir enzim-enzim pemeliharaan tonoplas vakuola dan membran plasma.',
    isInnerStructure: true,
  },
  ribosomes: {
    id: 'ribosomes',
    name: 'Ribosom',
    shortLabel: 'Ribosom',
    latinName: 'Ribosoma',
    category: 'Kontrol Genetik',
    gltfNodes: ['ribosomes'],
    zoomMultiplier: 2.6,
    location: 'Bebas di sitoplasma dan menempel pada permukaan RE Kasar',
    summary:
      'Kompleks rRNA dan protein non-membran yang menerjemahkan kode mRNA menjadi rantai polipeptida (sintesis protein).',
    structureDetail:
      'Tersusun atas dua subunit (subunit besar dan subunit kecil) yang dirakit di nukleolus; tidak dibungkus membran fosfolipid.',
    mainFunction:
      'Menjalankan proses translasi genetik untuk menghasilkan seluruh protein enzim maupun protein struktural yang dibutuhkan sel tumbuhan.',
    lightResponse:
      'Aktif menyintesis protein penunjang fotosintesis dan enzim pertumbuhan karena suplai energi ATP dan asam amino melimpah.',
    darkResponse:
      'Aktivitas translasi protein tetap berjalan pada tingkat basal untuk mengganti protein seluler yang rusak dan memproduksi enzim respirasi.',
    isInnerStructure: true,
  },
  lysosome: {
    id: 'lysosome',
    name: 'Lisosom / Vakuola Litik',
    shortLabel: 'Lisosom',
    latinName: 'Lysosoma',
    category: 'Sistem Endomembran & Transport',
    gltfNodes: ['lysosome'],
    zoomMultiplier: 2.5,
    location: 'Tersebar sebagai vesikel pencerna di dalam sitoplasma',
    summary:
      'Vesikel bermembran tunggal berisi enzim hidrolitik asam untuk daur ulang organel tua dan pencernaan makromolekul.',
    structureDetail:
      'Kantung bulat bermembran tunggal dengan lingkungan lumen bersifat asam yang menjaga aktivitas enzim hidrolase (protease, nuklease, lipase).',
    mainFunction:
      'Melakukan autofagi untuk mendaur ulang komponen organel usang atau rusak menjadi monomer yang dapat dipakai kembali oleh sel.',
    lightResponse:
      'Membantu membersihkan protein maupun komponen tilakoid yang mengalami kerusakan oksidatif akibat paparan intensitas cahaya tinggi.',
    darkResponse:
      'Berperan dalam daur ulang komponen seluler guna menyediakan bahan baku energi cadangan saat pasokan gula baru dari fotosintesis berhenti.',
    isInnerStructure: true,
  },
  peroxisome: {
    id: 'peroxisome',
    name: 'Peroksisom',
    shortLabel: 'Peroksisom',
    latinName: 'Peroxisoma',
    category: 'Energi & Metabolisme',
    gltfNodes: ['peroxisome'],
    zoomMultiplier: 2.55,
    location: 'Dekat kloroplas dan mitokondria di dalam sitoplasma',
    summary:
      'Organel oksidatif penghasil dan penetral hidrogen peroksida (H₂O₂) menggunakan enzim katalase serta berperan dalam fotorespirasi.',
    structureDetail:
      'Vesikel kecil bermembran tunggal dengan inti kristal enzim oksidase dan katalase yang padat.',
    mainFunction:
      'Menetralkan racun H₂O₂ menjadi air dan oksigen (2H₂O₂ → 2H₂O + O₂), memecah asam lemak rantai panjang, serta bekerja sama dengan kloroplas dalam jalur fotorespirasi.',
    lightResponse:
      'Sangat aktif mendampingi kloroplas dan mitokondria mengolah hasil samping fotorespirasi serta menetralkan radikal oksigen berlebih saat cahaya kuat.',
    darkResponse:
      'Berfokus pada detoksifikasi H₂O₂ hasil metabolisme lipid dan reaksi oksidatif di dalam sel saat fotorespirasi terhenti.',
    isInnerStructure: true,
  },
  plasmodesma: {
    id: 'plasmodesma',
    name: 'Plasmodesmata',
    shortLabel: 'Plasmodesmata',
    latinName: 'Plasmodesmata',
    category: 'Sistem Endomembran & Transport',
    gltfNodes: ['plasmodesma'],
    zoomMultiplier: 1.75,
    location: 'Menembus dinding sel di sekeliling batas sel tumbuhan',
    summary:
      'Saluran mikroskopis menembus dinding sel yang menghubungkan sitoplasma dua sel tumbuhan bertetangga.',
    structureDetail:
      'Berupa pori berlapiskan membran plasma dengan untai desmotubul dari retikulum endoplasma di tengahnya sebagai jembatan jalur simplas.',
    mainFunction:
      'Memfasilitasi pertukaran cepat air, ion, molekul gula hasil fotosintesis, hormon tumbuhan, dan sinyal RNA antar-sel dalam satu jaringan.',
    lightResponse:
      'Menyalurkan molekul gula sukrosa yang disintesis dari hasil fotosintesis menuju sel jaringan pembuluh dan sel tetangga.',
    darkResponse:
      'Tetap menjadi jalur transportasi air, hormon, dan molekul sinyal metabolik antar-sel agar jaringan tumbuhan tetap terkoordinasi di malam hari.',
    isInnerStructure: false,
  },
  'cell-wall': {
    id: 'cell-wall',
    name: 'Dinding Sel & Membran Sel',
    shortLabel: 'Dinding & Membran Sel',
    latinName: 'Paries cellularis & Membrana plasmatica',
    category: 'Pelindung & Sitosol',
    gltfNodes: ['cell'],
    zoomMultiplier: 1.2,
    location: 'Lapisan terluar yang membungkus seluruh sel tumbuhan',
    summary:
      'Struktur penyokong kaku berbahan serat selulosa yang melindungi sel serta membran plasma selektif di sisi dalamnya.',
    structureDetail:
      'Dinding sel tersusun atas mikrofibril selulosa dalam matriks pektin dan hemiselulosa; di bawahnya terdapat lapisan ganda fosfolipid membran plasma.',
    mainFunction:
      'Memberikan bentuk poligonal tetap pada sel tumbuhan, mencegah sel pecah (lisis) akibat tekanan turgor vakuola tinggi, dan menyaring transpor zat keluar-masuk sel.',
    lightResponse:
      'Menahan tekanan turgor tinggi dari vakuola saat sel aktif menyerap air dan gula pada siang hari, sekaligus meneruskan gelombang cahaya masuk ke kloroplas.',
    darkResponse:
      'Tetap mempertahankan kekokohan bentuk sel dan mengatur keluar-masuknya gas respirasi serta ion melalui membran plasma.',
    isInnerStructure: false,
  },
  cytoplasm: {
    id: 'cytoplasm',
    name: 'Sitoplasma (Sitosol)',
    shortLabel: 'Sitoplasma',
    latinName: 'Cytoplasma',
    category: 'Pelindung & Sitosol',
    gltfNodes: ['cytoplasm'],
    zoomMultiplier: 1.35,
    location: 'Mengisi ruang dalam antara membran sel dan nukleus',
    summary:
      'Medium cairan koloid (sitosol) beserta kerangka sitoskeleton yang menjadi wadah suspensi organel dan tempat reaksi metabolisme seperti glikolisis.',
    structureDetail:
      'Terdiri atas air, enzim terlarut, ion, senyawa organik, dan jaringan filamen aktin/mikrotubulus yang menggerakkan aliran sitoplasma (siklosis).',
    mainFunction:
      'Menyediakan medium reaksi biokimia (termasuk glikolisis) dan mendistribusikan nutrisi, enzim, serta organel seperti kloroplas agar mendapat cahaya merata.',
    lightResponse:
      'Aliran sitoplasma (siklosis) aktif memposisikan kloroplas agar menangkap cahaya secara optimal sekaligus mempercepat distribusi hasil fotosintesis.',
    darkResponse:
      'Menjalankan jalur glikolisis untuk memecah glukosa menjadi piruvat yang kemudian dikirim ke mitokondria sebagai bahan bakar respirasi malam.',
    isInnerStructure: false,
  },
};

export const PLANT_CELL_ORGANELLE_LIST: PlantCellOrganelleInfo[] = Object.values(
  PLANT_CELL_ORGANELLES,
);

const GLTF_NAME_TO_ORGANELLE: Record<string, PlantCellOrganelleId> = {};
for (const item of PLANT_CELL_ORGANELLE_LIST) {
  for (const gltfName of item.gltfNodes) {
    GLTF_NAME_TO_ORGANELLE[gltfName] = item.id;
  }
}

export function resolveOrganelleFromGltfName(
  rawName: string,
): PlantCellOrganelleId | null {
  if (!rawName) return null;
  if (GLTF_NAME_TO_ORGANELLE[rawName]) {
    return GLTF_NAME_TO_ORGANELLE[rawName];
  }
  const matchedKey = Object.keys(GLTF_NAME_TO_ORGANELLE).find((prefix) =>
    rawName.startsWith(prefix),
  );
  return matchedKey ? GLTF_NAME_TO_ORGANELLE[matchedKey] : null;
}

export interface PlantCellLightEffectSummary {
  condition: PlantCellLightCondition;
  title: string;
  badge: string;
  headline: string;
  overallEffect: string;
  keyProcesses: string[];
  activeOrganelles: string;
}

export const PLANT_CELL_LIGHT_EFFECTS: Record<
  PlantCellLightCondition,
  PlantCellLightEffectSummary
> = {
  terang: {
    condition: 'terang',
    title: 'Kondisi Terkena Cahaya (Fase Terang)',
    badge: 'Fotosintesis Aktif',
    headline:
      'Foton cahaya mengaktifkan pigmen klorofil di Kloroplas untuk memproduksi glukosa & O₂.',
    overallEffect:
      'Energi cahaya memicu reaksi terang di membran tilakoid kloroplas (menghasilkan ATP, NADPH, dan melepaskan oksigen) diikuti Siklus Calvin di stroma untuk membentuk karbohidrat. Sel mengalami aliran sitoplasma aktif dan tekanan turgor vakuola meningkat.',
    keyProcesses: [
      'Kloroplas menangkap foton cahaya → fotolisis H₂O dan sintesis glukosa',
      'Nukleus menggiatkan ekspresi gen protein penyusun klorofil & enzim fotosintesis',
      'Peroksisom menetralkan produk samping fotorespirasi saat intensitas cahaya tinggi',
      'Vakuola Sentral menjaga tekanan turgor sel tetap kuat dengan akumulasi zat terlarut',
    ],
    activeOrganelles: 'Kloroplas, Vakuola Sentral, Nukleus, Peroksisom, Plasmodesmata',
  },
  gelap: {
    condition: 'gelap',
    title: 'Kondisi Tidak Terkena Cahaya (Fase Gelap / Malam)',
    badge: 'Dominan Respirasi Sel',
    headline:
      'Fotosintesis berhenti sementara Mitokondria menjadi pusat pembangkit ATP dari cadangan makanan.',
    overallEffect:
      'Tanpa energi foton, reaksi terang pada membran tilakoid Kloroplas langsung berhenti sehingga Siklus Calvin terhenti setelah ATP/NADPH habis. Untuk mempertahankan kehidupan sel, Mitokondria mengambil alih penyediaan energi ATP melalui respirasi aerobik menggunakan glukosa dan pati cadangan.',
    keyProcesses: [
      'Kloroplas masuk fase istirahat (tidak terjadi fotolisis air maupun pelepasan O₂)',
      'Sitoplasma menjalankan glikolisis memecah cadangan glukosa menjadi piruvat',
      'Mitokondria aktif memproduksi ATP penuh melalui Siklus Krebs & rantai transpor elektron',
      'Lisosom, RE, dan Badan Golgi tetap memelihara komponen sel memakai energi ATP',
    ],
    activeOrganelles: 'Mitokondria, Sitoplasma (Glikolisis), RE & Badan Golgi, Vakuola',
  },
};
