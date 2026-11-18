import { ANATOMY_LICENSE_ATTRIBUTION } from '../data/anatomyData';
import { PLANT_CELL_LICENSE_ATTRIBUTION } from '../data/plantCellData';
import {
  WORKSHEET_CONFIG_BY_MODULE,
  buildRecordNarrativeSentence,
} from '../data/worksheetTemplates';
import type { ExperimentRecord, ModuleId } from '../types/lab';

export function formatWorksheetText(
  records: ExperimentRecord[],
  manualNote: string,
  moduleTitle?: string,
  moduleId?: ModuleId,
): string {
  const dateStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const cfg = moduleId ? WORKSHEET_CONFIG_BY_MODULE[moduleId] : undefined;

  const lines: string[] = [
    'RINGKASAN LAPORAN PRAKTIKUM VIRTUAL — EDUSPACE',
    'Jenjang        : Kurikulum Merdeka / Sekolah Menengah Atas',
    ...(moduleTitle ? [`Modul          : ${moduleTitle}`] : []),
    `Tanggal Ekspor : ${dateStr}`,
    `Total Aktivitas: ${records.length} hasil praktikum`,
    '============================================================',
    '',
  ];

  let hasAnatomy = false;
  if (records.length === 0) {
    lines.push(
      'RINGKASAN PRAKTIKUM:',
      'Belum ada aktivitas praktikum yang tercatat pada sesi ini. Lakukan simulasi atau eksplorasi model 3D agar hasil praktikum langsung dirangkum di sini.',
    );
  } else {
    lines.push(
      cfg?.summaryHeaderPrefix
        ? `${cfg.summaryHeaderPrefix}:`
        : 'RINGKASAN HASIL PRAKTIKUM:',
      '',
    );
    records.forEach((rec, idx) => {
      const isAnatomy =
        rec.recordKind === 'anatomy' || rec.moduleId === 'biology-anatomy';
      if (isAnatomy) hasAnatomy = true;
      const narrative = buildRecordNarrativeSentence(rec);
      lines.push(`${idx + 1}. (Pukul ${rec.timestamp}) ${narrative}`);
    });
  }

  if (manualNote.trim()) {
    lines.push(
      '',
      '============================================================',
      'KESIMPULAN & CATATAN PENGAMATAN SISWA:',
      '',
      manualNote.trim(),
    );
  }

  if (hasAnatomy || moduleId === 'biology-anatomy') {
    lines.push('', '------------------------------------------------------------', ANATOMY_LICENSE_ATTRIBUTION);
  }
  if (moduleId === 'biology-cell') {
    lines.push('', '------------------------------------------------------------', PLANT_CELL_LICENSE_ATTRIBUTION);
  }

  return lines.join('\n');
}

function legacyCopy(text: string): boolean {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}

export async function copyWorksheetText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
}

export function downloadWorksheetTxt(text: string, filename = 'lembar-kerja-eduspace.txt'): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportWorksheetPdf(): void {
  window.print();
}
