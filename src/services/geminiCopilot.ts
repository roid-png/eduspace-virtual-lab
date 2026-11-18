import { GoogleGenAI } from '@google/genai';
import { CARDIORESPIRATORY_FLOW } from '../data/anatomyData';
import { MODULE_MAP } from '../data/modules';
import { resolveAnatomyExploration } from '../engines/biologyAnatomy';
import { resolvePlantCellObservation } from '../engines/biologyCell';
import {
  PLANT_CELL_LIGHT_EFFECTS,
  PLANT_CELL_ORGANELLE_LIST,
} from '../data/plantCellData';
import {
  LAMP_SPECS,
  calculateCircuitPhysics,
  getModeLabel,
} from '../engines/physicsCircuit';
import {
  calculateCircleGeometry,
  calculateTransformationGeometry,
} from '../engines/mathGeometry3d';
import type {
  AnatomyParams,
  CellParams,
  ChatMessage,
  CircuitParams,
  ComputedModuleResult,
  Geometry3DParams,
  ModuleId,
} from '../types/lab';
import { loadSessionApiKey } from './storage';

export interface CopilotContextPayload {
  moduleId: ModuleId;
  guidedStep: 1 | 2 | 3 | 4;
  recordedCount: number;
  computed: ComputedModuleResult;
  anatomyParams?: AnatomyParams;
  circuitParams?: CircuitParams;
  cellParams?: CellParams;
  geometryParams?: Geometry3DParams;
  history?: ChatMessage[];
}

export interface CopilotReply {
  text: string;
  formulaChip?: string;
  mode: 'gemini' | 'offline-fallback';
  modelUsed?: string;
  errorDetail?: string;
}

export function sanitizeApiKey(raw: string): string {
  return raw.trim().replace(/^["']+|["']+$/g, '').trim();
}

export function getActiveGeminiApiKey(): string {
  const envKey = sanitizeApiKey(
    (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? '',
  );
  return envKey || sanitizeApiKey(loadSessionApiKey());
}

export function getGeminiModelName(): string {
  const envModel = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? '';
  return envModel.trim() || 'gemini-2.5-flash-lite';
}

function getCandidateModels(): string[] {
  const ordered = [
    getGeminiModelName(),
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
  ];
  return Array.from(new Set(ordered.filter(Boolean)));
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1beta' },
  });
}

function extractReadableError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
      return 'API key tidak valid';
    }
    if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('unavailable')) {
      return 'Server Gemini sedang padat (503) — coba kirim ulang sebentar';
    }
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      return 'Kuota API habis (429)';
    }
    if (msg.includes('403')) {
      return 'Akses ditolak / referrer diblokir (403)';
    }
    if (msg.includes('404')) {
      return 'Model tidak ditemukan (404)';
    }
    if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
      return 'Gagal terhubung ke jaringan';
    }
    return msg.slice(0, 90);
  }
  return 'Gagal menghubungi Gemini API';
}

function isModelRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted')
  );
}

function buildDeterministicFallback(
  question: string,
  ctx: CopilotContextPayload,
  errorDetail?: string,
): CopilotReply {
  const mod = MODULE_MAP[ctx.moduleId];
  const stepInfo = mod.guidedSteps.find((s) => s.step === ctx.guidedStep);
  const qLower = question.toLowerCase();

  if (ctx.moduleId === 'biology-anatomy' && ctx.anatomyParams) {
    const exp = resolveAnatomyExploration(ctx.anatomyParams);
    let topicAnswer = `${exp.activeStructure.name} terletak di ${exp.activeStructure.location}. ${exp.activeStructure.physiologicalMechanism}`;

    if (qLower.includes('katup') || qLower.includes('ruang') || qLower.includes('jantung')) {
      topicAnswer =
        'Jantung memiliki 4 ruang: Serambi Kanan menerima darah kaya CO₂ dari vena kava, Bilik Kanan memompa ke paru-paru, Serambi Kiri menerima darah kaya O₂ dari vena pulmonalis, dan Bilik Kiri berdinding paling tebal memompa darah ke aorta. Katup trikuspidalis, bikuspidalis (mitral), dan semilunaris mencegah aliran balik darah agar sirkulasi tetap satu arah.';
    } else if (qLower.includes('alveolus') || qLower.includes('paru') || qLower.includes('gas') || qLower.includes('bronkus')) {
      topicAnswer =
        'Udara masuk melalui trakea ke percabangan bronkus dan bronkiolus hingga mencapai kantung alveolus. Dinding epitel selapis alveolus yang sangat tipis dan dikelilingi kapiler memungkinkan difusi pasif O₂ masuk ke hemoglobin serta pelepasan CO₂ untuk diekshalasi.';
    } else if (qLower.includes('gangguan') || qLower.includes('kasus') || qLower.includes('penyakit')) {
      topicAnswer =
        'Contoh studi kasus SMA Kelas XI: (1) Regurgitasi/stenosis katup jantung mengganggu aliran satu arah antar-ruang; (2) Aterosklerosis menyempitkan lumen aorta sehingga beban bilik kiri meningkat; (3) Asma menyempitkan bronkiolus sedangkan emfisema merusak dinding alveolus sehingga luas area difusi O₂ menurun.';
    }

    return {
      text: `${topicAnswer} (Aktif: ${exp.organLabel} · ${exp.activeSubModeLabel}; Langkah ${ctx.guidedStep}/4: ${stepInfo?.shortLabel ?? ''}).`,
      formulaChip: exp.activeStructure.name,
      mode: 'offline-fallback',
      errorDetail,
    };
  }

  if (ctx.moduleId === 'biology-cell' && ctx.cellParams) {
    const obs = resolvePlantCellObservation(ctx.cellParams);
    const matchedOrg = PLANT_CELL_ORGANELLE_LIST.find(
      (org) =>
        org.id !== 'semua' &&
        (qLower.includes(org.shortLabel.toLowerCase()) ||
          qLower.includes(org.id.replace('-', ' '))),
    );
    const target = matchedOrg ?? obs.organelle;
    const isLight = ctx.cellParams.lightCondition === 'terang';

    let answer = `${target.name} (${target.latinName}) terletak di ${target.location}. ${target.structureDetail} ${target.mainFunction}`;
    if (
      qLower.includes('cahaya') ||
      qLower.includes('terang') ||
      qLower.includes('gelap') ||
      qLower.includes('fotosintesis')
    ) {
      answer = `${obs.lightSummary.title}: ${obs.lightSummary.overallEffect} Khusus pada ${target.shortLabel}: saat terkena cahaya (${target.lightResponse}), sedangkan saat gelap (${target.darkResponse}).`;
    } else if (
      qLower.includes('kuis') ||
      qLower.includes('uji') ||
      qLower.includes('soal')
    ) {
      answer = `Pertanyaan Latihan Sel Tumbuhan: Mengapa pada kondisi gelap aktivitas Kloroplas terhenti namun sel tumbuhan tetap hidup menghasilkan energi ATP melalui ${isLight ? 'kerja sama dengan organel lain' : 'Mitokondria'}? Petunjuk: bandingkan fungsi ${target.shortLabel} saat terang vs gelap!`;
    } else if (qLower.includes('hubungan') || qLower.includes('antar')) {
      answer =
        'Organel sel tumbuhan bekerja terintegrasi: Nukleus memerintahkan sintesis enzim di Ribosom & RE Kasar, dikemas oleh Badan Golgi menjadi komponen dinding sel/membran, Kloroplas menyintesis glukosa saat terkena cahaya, Mitokondria mengubah glukosa menjadi ATP, Vakuola menjaga turgor, dan Plasmodesmata menghubungkan antarsel.';
    } else if (qLower.includes('ciri') || qLower.includes('khas')) {
      answer =
        'Ciri khas sel tumbuhan dibandingkan sel hewan: memiliki Dinding Sel selulosa yang kaku, Kloroplas berklorofil untuk fotosintesis, Vakuola Sentral besar pengatur tekanan turgor, serta saluran Plasmodesmata penghubung antarsel.';
    }

    return {
      text: `${answer} (Fokus 3D aktif: ${obs.organelle.shortLabel} · ${obs.conditionLabel}).`,
      formulaChip: `${obs.organelle.shortLabel} · ${isLight ? 'Terkena Cahaya' : 'Gelap'}`,
      mode: 'offline-fallback',
      errorDetail,
    };
  }

  if (ctx.moduleId === 'math-geometry3d' && ctx.geometryParams) {
    const gp = ctx.geometryParams;
    const tVal = calculateTransformationGeometry(gp);
    const cVal = calculateCircleGeometry(gp);
    let answer = ctx.computed.copilotInsight;

    if (gp.subMode === 'transformasi') {
      if (qLower.includes('det') || qLower.includes('luas') || qLower.includes('kongruen')) {
        answer = `Nilai mutlak determinan matriks |det(M)| menyatakan faktor perubahan luas bangun hasil transformasi: L' = |det(M)| × L_awal = ${tVal.absDeterminant.toFixed(2)} × ${tVal.initialArea.toFixed(1)} = ${tVal.imageArea.toFixed(2)} satuan². Karena |det| = ${tVal.absDeterminant.toFixed(2)}, bangun bersifat ${tVal.natureLabel.toLowerCase()}.`;
      } else if (qLower.includes('matriks') || qLower.includes('translasi') || qLower.includes('refleksi') || qLower.includes('rotasi') || qLower.includes('dilatasi')) {
        answer = `Pada ${tVal.transformTitle}, titik awal A(${tVal.points[0].x}, ${tVal.points[0].y}) dipetakan secara konsisten menjadi bayangan A'(${tVal.transformedPoints[0].x}, ${tVal.transformedPoints[0].y}) beserta seluruh titik sudut segitiga B' dan C'.`;
      } else {
        answer = `Sub-mode aktif adalah ${tVal.transformTitle} dengan pemetaan ${tVal.primaryEquation} dan sifat ${tVal.natureLabel}.`;
      }
    } else {
      if (qLower.includes('keliling') || qLower.includes('pusat') || qLower.includes('sudut')) {
        answer = `Sudut keliling (θ/2) yang menghadap busur AB yang sama selalu bernilai setengah dari sudut pusatnya: dengan θ = ${cVal.centralAngleDeg}°, maka sudut keliling = ${cVal.inscribedAngleDeg.toFixed(1)}°.`;
      } else if (qLower.includes('singgung') || qLower.includes('pythagoras') || qLower.includes('90')) {
        answer = `Garis singgung lingkaran PT selalu tegak lurus (90°) terhadap jari-jari OT di titik singgung T, membentuk segitiga siku-siku ΔOTP sehingga PT = √(OP² − r²) = √(${cVal.externalDistance.toFixed(1)}² − ${cVal.radius.toFixed(1)}²) = ${cVal.tangentLength.toFixed(2)} cm.`;
      } else if (qLower.includes('busur') || qLower.includes('juring') || qLower.includes('tali')) {
        answer = `Pada r = ${cVal.radius.toFixed(1)} cm dan θ = ${cVal.centralAngleDeg}°, panjang busur s = ${cVal.arcLength.toFixed(2)} cm, luas juring = ${cVal.sectorArea.toFixed(2)} cm², dan panjang tali busur AB = ${cVal.chordLength.toFixed(2)} cm.`;
      }
    }

    return {
      text: answer,
      formulaChip: ctx.computed.primaryEquation,
      mode: 'offline-fallback',
      errorDetail,
    };
  }

  let extra = '';
  if (ctx.moduleId === 'physics-inclined') {
    if (qLower.includes('peti') || qLower.includes('mobil') || qLower.includes('bukit')) {
      extra =
        'Pada simulasi Peti Barang maupun Mobil & Bukit, percepatan pusat massa tetap mengikuti Hukum II Newton a = g(sin θ − μ·cos θ), sementara mode Mobil memvisualisasikan putaran roda dan interaksi ban terhadap kekasaran lereng bukit.';
    } else if (
      qLower.includes('gesek') ||
      qLower.includes('μ') ||
      /\bmu\b/.test(qLower) ||
      qLower.includes('kritis')
    ) {
      extra =
        'Koefisien gesek (μ) memperbesar gaya normal penahan f_s,maks = μ·W·cos θ. Jika gaya penggerak W·sin θ belum melampaui f_s,maks (atau θ ≤ θ_kritis = arctan μ), benda tetap diam dengan ΣF = 0.';
    } else if (qLower.includes('newton') || qLower.includes('hukum')) {
      extra =
        'Sesuai Hukum II Newton (ΣF = m·a), hanya resultan gaya sejajar lereng F_net = W·sin θ − f_gesek yang menghasilkan percepatan menuruni bidang.';
    } else if (qLower.includes('latihan') || qLower.includes('soal')) {
      extra = `Uji pemahamanmu dari kondisi aktif (${ctx.computed.summaryInputText}): naikkan atau turunkan θ (atau tinggi h) lalu prediksi kapan nilai W·sin θ mulai mengalahkan gaya gesek statis!`;
    } else if (qLower.includes('analogi')) {
      extra =
        'Bayangkan jalan menurun di pegunungan atau papan luncur gudang: semakin terjal tanjakan (θ dan h makin besar) atau semakin licin aspal/papan (μ mengecil), tarikan komponen gravitasi makin dominan sehingga benda meluncur lebih cepat.';
    } else {
      extra = `Saat ini kamu berada di Langkah ${ctx.guidedStep} (${stepInfo?.shortLabel ?? ''}): ${stepInfo?.instruction ?? ''} (${ctx.recordedCount} data sudah tercatat di Lembar Kerja).`;
    }
  } else if (ctx.moduleId === 'physics-circuit' && ctx.circuitParams) {
    const cp = ctx.circuitParams;
    const cv = calculateCircuitPhysics(cp);
    const modeLabel = getModeLabel(cp.mode);
    if (qLower.includes('saklar') || qLower.includes('lampu') || qLower.includes('terang') || qLower.includes('redup') || qLower.includes('padam')) {
      extra = !cv.isCircuitClosed
        ? `Saklar saat ini TERBUKA (OFF), memutus jalur konduktor sehingga arus I_tot = 0.00 A dan lampu padam. Klik saklar 3D atau ubah ke Tertutup (ON) untuk melihat arus mengalir kembali.`
        : cp.hasLamp
          ? `Lampu ${LAMP_SPECS[cp.lampType].label} terpasang di ${cp.lampPlacement === 'utama' || cp.mode === 'seri' ? 'jalur utama' : 'cabang R₂'} dan menyerap daya P_L = ${cv.powerLamp.toFixed(2)} W. Semakin besar tegangan V atau semakin kecil hambatan penghalang di jalurnya, daya lampu dan pijarnya makin terang.`
          : `Saat ini lampu sedang dilepas (hasLamp = false). Aktifkan opsi Pasang Lampu Indikator di panel kiri untuk menguji perubahan kecerahan lampu antar rangkaian.`;
    } else if (qLower.includes('kirchhoff') || qLower.includes('cabang') || qLower.includes('lup') || qLower.includes('ohm')) {
      extra =
        cp.mode === 'seri'
          ? `Hukum II Kirchhoff menyatakan ΣV_beban = V_sumber: V₁ (${cv.v1.toFixed(1)} V) + V₂ (${cv.v2.toFixed(1)} V)${cp.hasLamp ? ` + V_L (${cv.vLamp.toFixed(1)} V)` : ''} = ${cp.voltage.toFixed(1)} V dengan arus sama I = ${cv.iTotal.toFixed(2)} A.`
          : cp.mode === 'paralel'
            ? `Hukum I Kirchhoff berlaku di simpul cabang: I_tot (${cv.iTotal.toFixed(2)} A) = I₁ (${cv.i1.toFixed(2)} A) + I₂ (${cv.i2.toFixed(2)} A).`
            : `Pada rangkaian campuran, I₁ (${cv.iTotal.toFixed(2)} A) masuk ke simpul lalu terbagi sesuai Hukum I Kirchhoff menjadi I₂ (${cv.i2.toFixed(2)} A) + I₃ (${cv.i3.toFixed(2)} A), sedangkan lup memenuhi Hukum II Kirchhoff.`;
    } else if (qLower.includes('campuran') || qLower.includes('seri') || qLower.includes('paralel')) {
      extra = `Ringkasan (${modeLabel}): Seri menjumlahkan R dan membagi tegangan; Paralel memperkecil R_tot dan membagi arus ke tiap cabang; Campuran menyatukan keduanya (R₁ seri dengan cabang paralel R₂ ∥ R₃, R_tot = ${cv.rTotal.toFixed(2)} Ω).`;
    } else if (qLower.includes('latihan') || qLower.includes('soal')) {
      extra = `Tantangan Rangkaian ${modeLabel}: dari kondisi aktif (${ctx.computed.summaryInputText}), coba ubah R₂ menjadi dua kali lipat lalu prediksi apakah I_tot membesar atau mengecil sebelum melihat hasilnya!`;
    } else {
      extra = `Saat ini rangkaian dalam mode ${modeLabel} (${cv.isCircuitClosed ? 'Tertutup/ON' : 'Terbuka/OFF'}) dengan I_tot = ${cv.iTotal.toFixed(2)} A dan R_tot = ${cv.rTotal.toFixed(2)} Ω.`;
    }
  } else if (qLower.includes('latihan') || qLower.includes('soal')) {
    extra = `Coba tantang dirimu dengan mengubah salah satu parameter utama dari kondisi saat ini (${ctx.computed.summaryInputText}) lalu prediksi apakah nilainya naik atau turun sebelum menggeser slider!`;
  } else if (qLower.includes('analogi')) {
    extra = `Bayangkan sistem ini seperti alat ukur mekanis di laboratorium nyata: setiap kali variabel input diubah (${ctx.computed.summaryInputText}), respons fisika/matematisnya langsung tercermin pada hasil (${ctx.computed.summaryOutputText}).`;
  } else {
    extra = `Saat ini kamu berada di Langkah ${ctx.guidedStep} (${stepInfo?.shortLabel ?? ''}): ${stepInfo?.instruction ?? ''} (${ctx.recordedCount} data sudah tercatat di Lembar Kerja).`;
  }

  return {
    text: `${ctx.computed.copilotInsight} ${extra}`,
    formulaChip: ctx.computed.primaryEquation,
    mode: 'offline-fallback',
    errorDetail,
  };
}

export async function testGeminiConnection(
  overrideKey?: string,
): Promise<{ ok: boolean; message: string; model?: string }> {
  const apiKey = sanitizeApiKey(overrideKey ?? getActiveGeminiApiKey());
  if (!apiKey) {
    return { ok: false, message: 'API key masih kosong.' };
  }

  const ai = createGeminiClient(apiKey);
  const models = getCandidateModels();
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Jawab singkat dengan satu kata: Siap.',
        config: { temperature: 0 },
      });
      if (response.text?.trim()) {
        return {
          ok: true,
          model,
          message: `Terhubung ke ${model}.`,
        };
      }
    } catch (err) {
      lastError = err;
      if (!isModelRetryableError(err)) {
        break;
      }
    }
  }

  return {
    ok: false,
    message: extractReadableError(lastError),
  };
}

export async function askCopilot(
  question: string,
  ctx: CopilotContextPayload,
  onStreamText?: (partialText: string) => void,
): Promise<CopilotReply> {
  const apiKey = getActiveGeminiApiKey();
  if (!apiKey) {
    return buildDeterministicFallback(question, ctx);
  }

  const mod = MODULE_MAP[ctx.moduleId];
  const stepInfo = mod.guidedSteps.find((s) => s.step === ctx.guidedStep);

  const isAnatomy = ctx.moduleId === 'biology-anatomy' && ctx.anatomyParams;
  const anatomyExp = isAnatomy
    ? resolveAnatomyExploration(ctx.anatomyParams!)
    : null;
  const flowSummary = CARDIORESPIRATORY_FLOW.map((f) => f.title).join(' → ');

  const isPlantCell = ctx.moduleId === 'biology-cell' && ctx.cellParams;
  const cellObs = isPlantCell
    ? resolvePlantCellObservation(ctx.cellParams!)
    : null;
  const lightCompare = PLANT_CELL_LIGHT_EFFECTS[ctx.cellParams?.lightCondition ?? 'terang'];

  const systemInstruction = isAnatomy && anatomyExp
    ? `Kamu adalah AI Co-Pilot Laboratorium Virtual EDUSPACE untuk siswa SMA Kelas XI (Kurikulum Merdeka) dalam bahasa Indonesia.
Fokus utama modul Biologi Anatomi Organ adalah EKSPLORASI STRUKTUR ANATOMI DALAM, PEMISAHAN ORGAN, PEMBELAHAN PENAMPANG, DAN FUNGSI FISIOLOGIS (bukan sekadar hitungan rumus curah jantung).
Aturan jawaban:
1. Jawab PERTANYAAN SISWA secara akurat dan spesifik mengenai struktur internal organ (4 ruang & katup jantung, septum, percabangan bronkus & alveolus paru, lumen aorta & vena kava), mekanisme kerjanya, alur sirkulasi (${flowSummary}), atau studi kasus gangguan kardiorespirasi SMA Kelas XI.
2. Jelaskan secara ringkas, ilmiah, dan terstruktur (3–5 kalimat) dengan mengaitkan organ/struktur yang sedang diamati siswa saat ini bila relevan.
3. Jangan gunakan materi SD/SMP atau mengulang hitungan CO = HR × SV kecuali siswa menanyakannya secara khusus sebagai data pelengkap.

KONTEKS EKSPLORASI ANATOMI SAAT INI:
- Modul Aktif: ${mod.title}
- Tampilan / Mode 3D: ${anatomyExp.activeSubModeLabel}
- Organ Fokus: ${anatomyExp.organLabel}
- Komponen Terpilih: ${anatomyExp.activeStructure.name} (${anatomyExp.activeStructure.latinName ?? '-'})
- Letak & Fungsi: ${anatomyExp.activeStructure.location} — ${anatomyExp.activeStructure.functionSummary}
- Langkah Guided Task Aktif: Langkah ${ctx.guidedStep}/4 (${stepInfo?.shortLabel ?? ''}) — ${stepInfo?.instruction ?? ''}
- Jumlah Observasi Tercatat di Lembar Kerja: ${ctx.recordedCount}`
    : isPlantCell && cellObs
      ? `Kamu adalah AI Co-Pilot Laboratorium Virtual EDUSPACE khusus modul Biologi Sel Tumbuhan untuk siswa SMA Kelas XI (Kurikulum Merdeka) dalam bahasa Indonesia.
ATURAN PENTING:
1. Modul ini HANYA membahas SEL TUMBUHAN (TIDAK ADA sel darah/eritrosit/leukosit) dan TIDAK memakai perhitungan mikroskop (JANGAN membahas FOV, SA/V, perbesaran lensa, atau rumus matematika).
2. Jawab PERTANYAAN SISWA secara langsung, akurat, dan spesifik mengenai bagian sel tumbuhan mana pun (Nukleus, Kloroplas, Vakuola Sentral, Mitokondria, RE Kasar/Halus, Badan Golgi, Ribosom, Lisosom, Peroksisom, Plasmodesmata, Dinding & Membran Sel, Sitoplasma) serta efek terkena cahaya vs gelap.
3. Hubungkan jawaban secara real-time dengan organel dan kondisi cahaya yang sedang diamati siswa pada model 3D di bawah ini.

KONTEKS PENGAMATAN SEL TUMBUHAN SAAT INI:
- Organel Fokus 3D: ${cellObs.organelle.name} (${cellObs.organelle.latinName})
- Letak & Struktur: ${cellObs.organelle.location}. ${cellObs.organelle.structureDetail}
- Fungsi Utama: ${cellObs.organelle.mainFunction}
- Kondisi Pencahayaan Aktif: ${cellObs.conditionLabel} — ${lightCompare.overallEffect}
- Respon Organel Fokus pada Kondisi Aktif: ${cellObs.activeOrganelleResponse}
- Langkah Guided Task Aktif: Langkah ${ctx.guidedStep}/4 (${stepInfo?.shortLabel ?? ''}) — ${stepInfo?.instruction ?? ''}
- Jumlah Observasi Tercatat: ${ctx.recordedCount}`
    : ctx.moduleId === 'math-geometry3d' && ctx.geometryParams
      ? `Kamu adalah AI Co-Pilot Laboratorium Virtual EDUSPACE untuk Matematika SMA Kelas XI Kurikulum Merdeka (Transformasi Geometri & Lingkaran).
ATURAN PENTING:
1. Fokus modul ini adalah TRANSFORMASI GEOMETRI (Translasi, Refleksi, Rotasi, Dilatasi dengan matriks 2×2 dan luas bayangan |det(M)|×L) serta LINGKARAN (Panjang Busur, Luas Juring, Sudut Pusat vs Sudut Keliling θ/2, Tali Busur, dan Garis Singgung tegak lurus jari-jari 90°). JANGAN membahas kubus dimensi tiga BDG/ABCD.EFGH.
2. Jawab pertanyaan siswa secara ringkas, jelas, dan ilmiah merujuk pada parameter aktif di bawah ini.

KONTEKS GEOMETRI AKTIF SAAT INI:
- Sub-Mode Aktif: ${ctx.geometryParams.subMode === 'transformasi' ? 'Transformasi Geometri' : 'Lingkaran'}
- Variabel Input Aktif: ${ctx.computed.summaryInputText}
- Hasil & Rumus Utama: ${ctx.computed.primaryEquation}
- Ringkasan Output: ${ctx.computed.summaryOutputText}
- Langkah Guided Task Aktif: Langkah ${ctx.guidedStep}/4 (${stepInfo?.shortLabel ?? ''})
- Jumlah Data Tercatat: ${ctx.recordedCount}`
      : `Kamu adalah AI Co-Pilot Laboratorium Virtual EDUSPACE untuk siswa SMA Kelas XI (Kurikulum Merdeka) dalam bahasa Indonesia.
Aturan jawaban:
1. Jawab PERTANYAAN SISWA secara langsung, akurat, dan spesifik sesuai topik yang ditanyakan (jangan hanya mengulang angka slider bila siswa menanyakan konsep atau kasus uji).
2. Kaitkan penjelasan sebab-akibat (kausalitas) secara ringkas dan ilmiah (3–4 kalimat) dengan merujuk pada angka parameter aktif siswa di bawah ini bila relevan.
3. Jangan beri fitur atau materi SD/SMP. Gunakan istilah SMA Kelas XI yang tepat.
4. Jika siswa meminta latihan soal atau panduan eksperimen, bimbing sesuai langkah aktif tanpa langsung membocorkan semua jawaban jika mereka diminta bereksperimen.

KONTEKS SIMULASI SAAT INI:
- Mata Pelajaran: ${mod.subject.toUpperCase()} (${mod.categoryLabel})
- Modul Aktif: ${mod.title}
- Variabel Input Aktif: ${ctx.computed.summaryInputText}
- Rumus & Hasil Eksak: ${ctx.computed.primaryEquation}
- Output Ringkas: ${ctx.computed.summaryOutputText}${
      ctx.moduleId === 'physics-circuit' && ctx.circuitParams
        ? `\n- Detail Rangkaian Listrik: Mode = ${getModeLabel(ctx.circuitParams.mode)}, Saklar = ${ctx.circuitParams.hasSwitch ? (ctx.circuitParams.switchClosed ? 'Terpasang & ON (Tertutup)' : 'Terpasang & OFF (Terbuka)') : 'Tidak Dipasang'}, Lampu = ${ctx.circuitParams.hasLamp ? `${LAMP_SPECS[ctx.circuitParams.lampType].label} di ${ctx.circuitParams.lampPlacement}` : 'Tidak Dipasang'}, I1/I2/I3 = ${calculateCircuitPhysics(ctx.circuitParams).i1.toFixed(2)}/${calculateCircuitPhysics(ctx.circuitParams).i2.toFixed(2)}/${calculateCircuitPhysics(ctx.circuitParams).i3.toFixed(2)} A.`
        : ''
    }
- Langkah Guided Task Aktif: Langkah ${ctx.guidedStep}/4 (${stepInfo?.shortLabel ?? ''}) — ${stepInfo?.instruction ?? ''}
- Jumlah Data Tercatat di Lembar Kerja: ${ctx.recordedCount}`;

  // Susun riwayat percakapan terakhir (maks 6 pesan) agar tanya-jawab berlanjut kontekstual
  const recentHistory = (ctx.history ?? [])
    .filter((m) => !m.id.startsWith('welcome-') && !m.id.startsWith('ai-stream-'))
    .slice(-6)
    .map((m) => ({
      role: m.role === 'student' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.text }],
    }));

  const contents = [
    ...recentHistory,
    { role: 'user' as const, parts: [{ text: question }] },
  ];

  const ai = createGeminiClient(apiKey);
  const models = getCandidateModels();
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const supportsThinking = model.includes('2.5');
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.45,
          maxOutputTokens: 650,
          abortSignal: AbortSignal.timeout(10000),
          ...(supportsThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      });

      let fullText = '';
      for await (const chunk of stream) {
        const piece = chunk.text ?? '';
        if (piece) {
          fullText += piece;
          onStreamText?.(fullText);
        }
      }

      const finalText = fullText.trim();
      if (finalText) {
        return {
          text: finalText,
          formulaChip: ctx.computed.primaryEquation,
          mode: 'gemini',
          modelUsed: model,
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[EDUSPACE AI Co-Pilot] Model ${model} gagal:`, err);
      if (!isModelRetryableError(err) && !(err instanceof DOMException && err.name === 'TimeoutError')) {
        break;
      }
    }
  }

  const errorDetail = extractReadableError(lastError);
  return buildDeterministicFallback(question, ctx, errorDetail);
}
