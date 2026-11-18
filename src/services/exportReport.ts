import { ANATOMY_LICENSE_ATTRIBUTION } from '../data/anatomyData';
import { PLANT_CELL_LICENSE_ATTRIBUTION } from '../data/plantCellData';
import { WORKSHEET_CONFIG_BY_MODULE } from '../data/worksheetTemplates';
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
    'LEMBAR KERJA PRAKTIKUM VIRTUAL — EDUSPACE (SMA KELAS XI)',
    ...(moduleTitle ? [`Modul          : ${moduleTitle}`] : []),
    `Tanggal Ekspor : ${dateStr}`,
    `Total Data     : ${records.length}`,
    '------------------------------------------------------------',
  ];

  let hasAnatomy = false;
  if (records.length === 0) {
    lines.push('Belum ada data percobaan yang dicatat.');
  } else {
    records.forEach((rec, idx) => {
      const isAnatomy =
        rec.recordKind === 'anatomy' || rec.moduleId === 'biology-anatomy';
      if (isAnatomy) {
        hasAnatomy = true;
        lines.push(
          `Observasi ${idx + 1} [${rec.moduleTitle}] (${rec.timestamp})`,
          `  Organ & Mode           : ${rec.anatomyRecord?.organAndMode ?? rec.inputSummary}`,
          `  Struktur Diidentifikasi: ${rec.anatomyRecord?.identifiedStructures ?? rec.formulaText}`,
          `  Fungsi Fisiologis      : ${rec.anatomyRecord?.physiologicalFunction ?? rec.outputSummary}`,
        );
      } else {
        const col1 = cfg?.col1Label ?? 'Variabel Input';
        const col2 = cfg?.col2Label ?? 'Hasil Hitung';
        lines.push(
          `${cfg?.indexLabel ?? 'Uji'} ${idx + 1} [${rec.moduleTitle}] (${rec.timestamp})`,
          `  ${col1}: ${rec.inputSummary}`,
          `  ${col2}: ${rec.outputSummary}`,
          `  Persamaan: ${rec.formulaText}`,
        );
      }
    });
  }

  if (manualNote.trim()) {
    lines.push(
      '------------------------------------------------------------',
      'RANGKUMAN & CATATAN PENGAMATAN SISWA:',
      manualNote.trim(),
    );
  }

  if (hasAnatomy || moduleId === 'biology-anatomy') {
    lines.push(
      '------------------------------------------------------------',
      ANATOMY_LICENSE_ATTRIBUTION,
    );
  }
  if (moduleId === 'biology-cell') {
    lines.push(
      '------------------------------------------------------------',
      PLANT_CELL_LICENSE_ATTRIBUTION,
    );
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
