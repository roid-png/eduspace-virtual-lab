import type {
  ExperimentRecord,
  GuidedStepDef,
  ModuleExploredItem,
  ModuleId,
} from '../types/lab';

const VALID_MODULE_IDS: readonly ModuleId[] = [
  'physics-inclined',
  'physics-circuit',
  'biology-anatomy',
  'biology-cell',
  'math-geometry3d',
];

const KEYS = {
  legacyRecords: 'eduspace_v1_records',
  legacyNotes: 'eduspace_v1_notes',
  legacyExploredAnatomy: 'eduspace_v1_explored_anatomy',
  recordsByModule: 'eduspace_v1_records_by_module',
  notesByModule: 'eduspace_v1_notes_by_module',
  exploredByModule: 'eduspace_v1_explored_by_module',
  activeModule: 'eduspace_v1_active_module',
  guidedSteps: 'eduspace_v1_guided_steps',
  apiKey: 'eduspace_v1_gemini_key',
} as const;

export type RecordsByModule = Partial<Record<ModuleId, ExperimentRecord[]>>;
export type NotesByModule = Partial<Record<ModuleId, string>>;
export type ExploredByModule = Partial<Record<ModuleId, ModuleExploredItem[]>>;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan jika kuota penyimpanan browser penuh atau dibatasi
  }
}

export function isValidModuleId(id: string | null | undefined): id is ModuleId {
  return Boolean(id && (VALID_MODULE_IDS as readonly string[]).includes(id));
}

function isStalePlantCellEntry(textParts: Array<string | undefined>): boolean {
  const joined = textParts.filter(Boolean).join(' ').toLowerCase();
  return (
    joined.includes('sel darah') ||
    joined.includes('fov =') ||
    joined.includes('fov=') ||
    joined.includes('hemoglobin') ||
    joined.includes('exploded =') ||
    joined.includes('sa/v')
  );
}

function isStaleGeometryEntry(textParts: Array<string | undefined>): boolean {
  const joined = textParts.filter(Boolean).join(' ').toLowerCase();
  return (
    joined.includes('dimensi tiga') ||
    joined.includes('bdg') ||
    joined.includes('p → bd') ||
    joined.includes('sudut eq') ||
    joined.includes('sudut garis eq') ||
    joined.includes('alas abcd') ||
    joined.includes('sudut proyeksi') ||
    joined.includes('kubus') ||
    joined.includes('rusuk s =') ||
    joined.includes('s = ') ||
    joined.includes('d(p,')
  );
}

export function loadRecordsByModule(): RecordsByModule {
  try {
    const existingRaw = localStorage.getItem(KEYS.recordsByModule);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw) as RecordsByModule;
      const sanitized: RecordsByModule = {};
      for (const modId of VALID_MODULE_IDS) {
        if (Array.isArray(parsed[modId])) {
          if (modId === 'biology-cell') {
            sanitized[modId] = parsed[modId]!.filter(
              (rec) =>
                rec.recordKind === 'anatomy' &&
                !isStalePlantCellEntry([
                  rec.moduleTitle,
                  rec.inputSummary,
                  rec.outputSummary,
                  rec.formulaText,
                ]),
            );
          } else if (modId === 'math-geometry3d') {
            sanitized[modId] = parsed[modId]!.filter(
              (rec) =>
                !isStaleGeometryEntry([
                  rec.moduleTitle,
                  rec.inputSummary,
                  rec.outputSummary,
                  rec.formulaText,
                ]),
            );
          } else {
            sanitized[modId] = parsed[modId];
          }
        }
      }
      return sanitized;
    }

    // Migrasi satu kali dari format array global lama ke map per modul
    const legacy = safeReadJson<ExperimentRecord[]>(KEYS.legacyRecords, []);
    if (legacy.length > 0) {
      const migrated: RecordsByModule = {};
      for (const rec of legacy) {
        if (!isValidModuleId(rec.moduleId)) continue;
        const bucket = migrated[rec.moduleId] ?? [];
        bucket.push(rec);
        migrated[rec.moduleId] = bucket;
      }
      safeWriteJson(KEYS.recordsByModule, migrated);
      return migrated;
    }
  } catch {
    // fallback kosong
  }
  return {};
}

export function saveRecordsByModule(map: RecordsByModule): void {
  safeWriteJson(KEYS.recordsByModule, map);
}

export function loadNotesByModule(): NotesByModule {
  try {
    const existingRaw = localStorage.getItem(KEYS.notesByModule);
    if (existingRaw) {
      return JSON.parse(existingRaw) as NotesByModule;
    }

    const legacyNote = localStorage.getItem(KEYS.legacyNotes);
    if (legacyNote && legacyNote.trim()) {
      const active = loadActiveModuleId();
      const migrated: NotesByModule = { [active]: legacyNote };
      safeWriteJson(KEYS.notesByModule, migrated);
      return migrated;
    }
  } catch {
    // fallback kosong
  }
  return {};
}

export function saveNotesByModule(map: NotesByModule): void {
  safeWriteJson(KEYS.notesByModule, map);
}

export function loadActiveModuleId(): ModuleId {
  try {
    const val = localStorage.getItem(KEYS.activeModule);
    if (isValidModuleId(val)) {
      return val;
    }
    return 'physics-inclined';
  } catch {
    return 'physics-inclined';
  }
}

export function saveActiveModuleId(moduleId: ModuleId): void {
  try {
    localStorage.setItem(KEYS.activeModule, moduleId);
  } catch {
    // noop
  }
}

export function loadGuidedSteps(): Partial<Record<ModuleId, GuidedStepDef['step']>> {
  return safeReadJson<Partial<Record<ModuleId, GuidedStepDef['step']>>>(
    KEYS.guidedSteps,
    {},
  );
}

export function saveGuidedSteps(
  steps: Partial<Record<ModuleId, GuidedStepDef['step']>>,
): void {
  safeWriteJson(KEYS.guidedSteps, steps);
}

export function loadSessionApiKey(): string {
  try {
    return localStorage.getItem(KEYS.apiKey) ?? '';
  } catch {
    return '';
  }
}

export function saveSessionApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(KEYS.apiKey, key.trim());
    } else {
      localStorage.removeItem(KEYS.apiKey);
    }
  } catch {
    // noop
  }
}

interface LegacyAnatomyExplored {
  id: string;
  organAndMode: string;
  structureName: string;
  location: string;
  physiologicalFunction: string;
  selectedForSummary: boolean;
  clickedAt: string;
}

export function loadExploredByModule(): ExploredByModule {
  try {
    const existingRaw = localStorage.getItem(KEYS.exploredByModule);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw) as ExploredByModule;
      const sanitized: ExploredByModule = {};
      for (const modId of VALID_MODULE_IDS) {
        if (Array.isArray(parsed[modId])) {
          if (modId === 'biology-cell') {
            sanitized[modId] = parsed[modId]!.filter(
              (item) =>
                item.recordKind === 'anatomy' &&
                !isStalePlantCellEntry([
                  item.title,
                  item.subtitle,
                  item.summaryLine,
                  item.inputSummary,
                ]),
            );
          } else if (modId === 'math-geometry3d') {
            sanitized[modId] = parsed[modId]!.filter(
              (item) =>
                !isStaleGeometryEntry([
                  item.title,
                  item.subtitle,
                  item.summaryLine,
                  item.inputSummary,
                ]),
            );
          } else {
            sanitized[modId] = parsed[modId];
          }
        }
      }
      return sanitized;
    }

    // Migrasi satu kali dari format exploredAnatomy lama ke bucket 'biology-anatomy'
    const legacy = safeReadJson<LegacyAnatomyExplored[]>(KEYS.legacyExploredAnatomy, []);
    if (legacy.length > 0) {
      const migratedAnatomy: ModuleExploredItem[] = legacy.map((item) => ({
        id: item.id,
        moduleId: 'biology-anatomy',
        title: item.structureName,
        subtitle: item.organAndMode,
        summaryLine: `${item.structureName} [${item.organAndMode}] — Letak: ${item.location}. Fungsi: ${item.physiologicalFunction}`,
        inputSummary: item.organAndMode,
        outputSummary: item.physiologicalFunction,
        formulaText: item.structureName,
        primaryNumericValue: 1,
        primaryUnit: 'struktur',
        recordKind: 'anatomy',
        anatomyRecord: {
          organAndMode: item.organAndMode,
          identifiedStructures: item.structureName,
          physiologicalFunction: item.physiologicalFunction,
        },
        selectedForSummary: item.selectedForSummary,
        clickedAt: item.clickedAt,
      }));
      const migrated: ExploredByModule = { 'biology-anatomy': migratedAnatomy };
      safeWriteJson(KEYS.exploredByModule, migrated);
      return migrated;
    }
  } catch {
    // fallback kosong
  }
  return {};
}

export function saveExploredByModule(map: ExploredByModule): void {
  safeWriteJson(KEYS.exploredByModule, map);
}
