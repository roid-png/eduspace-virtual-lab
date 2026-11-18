import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ORGAN_STRUCTURE_GROUPS,
  SEPARABLE_PARTS,
} from '../data/anatomyData';
import { MODULE_MAP } from '../data/modules';
import { createExploredItemFromModuleState } from '../data/worksheetTemplates';
import { computeModuleResult, DEFAULT_MODULE_PARAMS } from '../engines';
import { resolveAnatomyExploration } from '../engines/biologyAnatomy';
import { askCopilot, getActiveGeminiApiKey } from '../services/geminiCopilot';
import {
  loadActiveModuleId,
  loadExploredByModule,
  loadGuidedSteps,
  loadNotesByModule,
  loadRecordsByModule,
  loadSessionApiKey,
  saveActiveModuleId,
  saveExploredByModule,
  saveGuidedSteps,
  saveNotesByModule,
  saveRecordsByModule,
  saveSessionApiKey,
} from '../services/storage';
import type { ExploredByModule, NotesByModule, RecordsByModule } from '../services/storage';
import type {
  AnatomyInspectionMode,
  AnatomyLungVariant,
  AnatomyOrganKey,
  AnatomyParams,
  AnatomySeparablePart,
  ChatMessage,
  ComputedModuleResult,
  ExperimentRecord,
  GuidedStepDef,
  ModuleExploredItem,
  ModuleId,
  ModuleParamsMap,
  ViewStage,
} from '../types/lab';

interface LabContextValue {
  view: ViewStage;
  setView: (view: ViewStage) => void;
  activeModuleId: ModuleId;
  selectModule: (moduleId: ModuleId, navigateToWorkspace?: boolean) => void;
  paramsMap: ModuleParamsMap;
  updateModuleParams: <K extends ModuleId>(
    moduleId: K,
    patch: Partial<ModuleParamsMap[K]>,
  ) => void;
  setAnatomyInspectionMode: (mode: AnatomyInspectionMode) => void;
  setAnatomyFocusOrgan: (organ: AnatomyOrganKey) => void;
  setAnatomyLungVariant: (variant: AnatomyLungVariant) => void;
  handleAnatomyOrganClick: (part: AnatomySeparablePart) => void;
  resetActiveModule: () => void;
  computedResult: ComputedModuleResult;
  showVectors: boolean;
  setShowVectors: (show: boolean) => void;
  isSimRunning: boolean;
  setIsSimRunning: (running: boolean) => void;
  triggerSimulationRun: () => void;
  cameraResetTick: number;
  resetCameraView: () => void;
  activeGuidedStep: GuidedStepDef['step'];
  setActiveGuidedStep: (step: GuidedStepDef['step']) => void;
  records: ExperimentRecord[];
  recordCurrentExperiment: () => void;
  removeRecord: (id: string) => void;
  clearRecords: () => void;
  exploredItems: ModuleExploredItem[];
  toggleExploredItemForSummary: (id: string) => void;
  setAllExploredForSummary: (selected: boolean) => void;
  clearExploredItems: () => void;
  addExploredItemsToWorksheet: () => void;
  manualNote: string;
  setManualNote: (note: string) => void;
  chatMessages: ChatMessage[];
  sendCopilotMessage: (text: string) => Promise<void>;
  isCopilotLoading: boolean;
  hasGeminiKey: boolean;
  sessionApiKey: string;
  setSessionApiKey: (key: string) => void;
  toastMessage: string | null;
}

const LabContext = createContext<LabContextValue | null>(null);

function formatClock(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewStage>('landing');
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(() => loadActiveModuleId());
  const [paramsMap, setParamsMap] = useState<ModuleParamsMap>(() => ({
    ...DEFAULT_MODULE_PARAMS,
  }));
  const [showVectors, setShowVectors] = useState(true);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [cameraResetTick, setCameraResetTick] = useState(0);
  const [guidedSteps, setGuidedSteps] = useState<
    Partial<Record<ModuleId, GuidedStepDef['step']>>
  >(() => loadGuidedSteps());
  const [recordsByModule, setRecordsByModule] = useState<RecordsByModule>(() =>
    loadRecordsByModule(),
  );
  const [exploredByModule, setExploredByModule] = useState<ExploredByModule>(() =>
    loadExploredByModule(),
  );
  const [notesByModule, setNotesByModule] = useState<NotesByModule>(() =>
    loadNotesByModule(),
  );
  const sliderCaptureTimerRef = useRef<number | null>(null);
  const [chatHistoryMap, setChatHistoryMap] = useState<
    Partial<Record<ModuleId, ChatMessage[]>>
  >({});
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [sessionApiKey, setSessionApiKeyState] = useState<string>(() => loadSessionApiKey());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const records = useMemo(
    () => recordsByModule[activeModuleId] ?? [],
    [recordsByModule, activeModuleId],
  );
  const exploredItems = useMemo(
    () => exploredByModule[activeModuleId] ?? [],
    [exploredByModule, activeModuleId],
  );
  const manualNote = notesByModule[activeModuleId] ?? '';
  const activeGuidedStep: GuidedStepDef['step'] = guidedSteps[activeModuleId] ?? 1;

  const computedResult = useMemo(
    () => computeModuleResult(activeModuleId, paramsMap[activeModuleId]),
    [activeModuleId, paramsMap],
  );

  useEffect(() => {
    saveActiveModuleId(activeModuleId);
  }, [activeModuleId]);

  useEffect(() => {
    saveRecordsByModule(recordsByModule);
  }, [recordsByModule]);

  useEffect(() => {
    saveExploredByModule(exploredByModule);
  }, [exploredByModule]);

  useEffect(() => {
    saveNotesByModule(notesByModule);
  }, [notesByModule]);

  useEffect(() => {
    return () => {
      if (sliderCaptureTimerRef.current !== null) {
        window.clearTimeout(sliderCaptureTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    saveGuidedSteps(guidedSteps);
  }, [guidedSteps]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const selectModule = (moduleId: ModuleId, navigateToWorkspace = true) => {
    setActiveModuleId(moduleId);
    setIsSimRunning(false);
    setCameraResetTick((t) => t + 1);
    if (navigateToWorkspace) {
      setView('workspace');
    }
  };

  const captureExploredItem = <K extends ModuleId>(
    moduleId: K,
    moduleParams: ModuleParamsMap[K],
  ) => {
    const computed = computeModuleResult(moduleId, moduleParams);
    const nextItem = createExploredItemFromModuleState(
      moduleId,
      moduleParams,
      computed,
      formatClock(),
    );
    setExploredByModule((prev) => {
      const currList = prev[moduleId] ?? [];
      if (currList.some((item) => item.id === nextItem.id)) return prev;
      return {
        ...prev,
        [moduleId]: [...currList, nextItem],
      };
    });
  };

  const updateModuleParams = <K extends ModuleId>(
    moduleId: K,
    patch: Partial<ModuleParamsMap[K]>,
  ) => {
    const nextModuleState = {
      ...paramsMap[moduleId],
      ...patch,
    } as ModuleParamsMap[K];

    setParamsMap((prev) => ({
      ...prev,
      [moduleId]: nextModuleState,
    }));

    const patchKeys = Object.keys(patch);
    const isDiscretePatch =
      moduleId === 'biology-anatomy' ||
      patchKeys.some((k) =>
        [
          'mode',
          'specimen',
          'focusOrganelle',
          'caseMode',
          'objectType',
          'hasSwitch',
          'switchClosed',
          'hasLamp',
          'lampType',
          'lampPlacement',
          'lightCondition',
          'subMode',
          'transformType',
          'reflectionAxis',
          'showTangent',
          'showChord',
        ].includes(k),
      );

    if (sliderCaptureTimerRef.current !== null) {
      window.clearTimeout(sliderCaptureTimerRef.current);
      sliderCaptureTimerRef.current = null;
    }

    if (isDiscretePatch) {
      captureExploredItem(moduleId, nextModuleState);
    } else {
      sliderCaptureTimerRef.current = window.setTimeout(() => {
        captureExploredItem(moduleId, nextModuleState);
        sliderCaptureTimerRef.current = null;
      }, 650);
    }

    setGuidedSteps((prev) => {
      const curr = prev[moduleId] ?? 1;
      if (curr < 2) {
        return { ...prev, [moduleId]: 2 };
      }
      return prev;
    });
  };

  const setAnatomyInspectionMode = (mode: AnatomyInspectionMode) => {
    const curr = paramsMap['biology-anatomy'];
    const group = ORGAN_STRUCTURE_GROUPS[curr.focusOrgan];
    const nextStructureId =
      mode === 'belah' ? group.cutawayDefaultId : group.defaultStructureId;
    const nextSeparated =
      mode === 'pisahkan'
        ? curr.separatedParts.length > 0
          ? curr.separatedParts
          : [...SEPARABLE_PARTS]
        : curr.separatedParts;
    const nextAnatomy: AnatomyParams = {
      ...curr,
      inspectionMode: mode,
      separatedParts: nextSeparated,
      selectedStructureId: nextStructureId,
    };

    setParamsMap((prev) => ({
      ...prev,
      'biology-anatomy': nextAnatomy,
    }));
    captureExploredItem('biology-anatomy', nextAnatomy);
    setGuidedSteps((prev) => {
      const currStep = prev['biology-anatomy'] ?? 1;
      const targetStep = mode === 'belah' ? 3 : mode === 'pisahkan' ? 2 : currStep;
      return currStep < targetStep ? { ...prev, 'biology-anatomy': targetStep } : prev;
    });
  };

  const setAnatomyFocusOrgan = (organ: AnatomyOrganKey) => {
    const curr = paramsMap['biology-anatomy'];
    const group = ORGAN_STRUCTURE_GROUPS[organ];
    let nextStructureId =
      curr.inspectionMode === 'belah' ? group.cutawayDefaultId : group.defaultStructureId;
    if (organ === 'paru') {
      nextStructureId =
        curr.lungVariant === 'transparan' ? 'lung-t-trachea' : 'paru-kanan-utuh';
    }
    const nextAnatomy: AnatomyParams = {
      ...curr,
      focusOrgan: organ,
      selectedStructureId: nextStructureId,
    };

    setParamsMap((prev) => ({
      ...prev,
      'biology-anatomy': nextAnatomy,
    }));
    captureExploredItem('biology-anatomy', nextAnatomy);
    setGuidedSteps((prev) => {
      const currStep = prev['biology-anatomy'] ?? 1;
      return currStep < 2 ? { ...prev, 'biology-anatomy': 2 } : prev;
    });
  };

  const setAnatomyLungVariant = (lungVariant: AnatomyLungVariant) => {
    const curr = paramsMap['biology-anatomy'];
    const nextAnatomy: AnatomyParams = {
      ...curr,
      focusOrgan: 'paru',
      lungVariant,
      selectedStructureId:
        lungVariant === 'transparan' ? 'lung-t-trachea' : 'paru-kanan-utuh',
    };

    setParamsMap((prev) => ({
      ...prev,
      'biology-anatomy': nextAnatomy,
    }));
    captureExploredItem('biology-anatomy', nextAnatomy);
    setGuidedSteps((prev) => {
      const currStep = prev['biology-anatomy'] ?? 1;
      return currStep < 3 ? { ...prev, 'biology-anatomy': 3 } : prev;
    });
  };

  const handleAnatomyOrganClick = (part: AnatomySeparablePart) => {
    const organMap: Record<AnatomySeparablePart, AnatomyOrganKey> = {
      jantung: 'jantung',
      'paru-kanan': 'paru',
      'paru-kiri': 'paru',
      aorta: 'aorta',
    };
    const defaultByPart: Record<AnatomySeparablePart, { outer: string; inner: string }> = {
      jantung: { outer: 'jantung-utuh', inner: 'bilik-kiri' },
      'paru-kanan': { outer: 'paru-kanan-utuh', inner: 'bronkus-bronkiolus' },
      'paru-kiri': { outer: 'paru-kiri-utuh', inner: 'parenkim-alveolus' },
      aorta: { outer: 'aorta-utuh', inner: 'lumen-aorta' },
    };

    const curr = paramsMap['biology-anatomy'];
    const isCutaway = curr.inspectionMode === 'belah';
    const nextStructureId = isCutaway
      ? defaultByPart[part].inner
      : defaultByPart[part].outer;

    let nextSeparated = curr.separatedParts;
    if (curr.inspectionMode === 'pisahkan') {
      const exists = curr.separatedParts.includes(part);
      nextSeparated = exists
        ? curr.separatedParts.filter((item) => item !== part)
        : [...curr.separatedParts, part];
    }

    const nextAnatomy: AnatomyParams = {
      ...curr,
      focusOrgan: curr.focusOrgan === 'semua' ? 'semua' : organMap[part],
      separatedParts: nextSeparated,
      selectedStructureId: nextStructureId,
    };

    setParamsMap((prev) => ({
      ...prev,
      'biology-anatomy': nextAnatomy,
    }));
    captureExploredItem('biology-anatomy', nextAnatomy);

    setGuidedSteps((prev) => {
      const currStep = prev['biology-anatomy'] ?? 1;
      return currStep < 2 ? { ...prev, 'biology-anatomy': 2 } : prev;
    });
  };

  const resetActiveModule = () => {
    setParamsMap((prev) => ({
      ...prev,
      [activeModuleId]: { ...DEFAULT_MODULE_PARAMS[activeModuleId] },
    }));
    setIsSimRunning(false);
    setCameraResetTick((t) => t + 1);
    showToast('Parameter simulasi dikembalikan ke nilai awal');
  };

  const triggerSimulationRun = () => {
    if (!isSimRunning) {
      captureExploredItem(activeModuleId, paramsMap[activeModuleId]);
    }
    setIsSimRunning((prev) => !prev);
  };

  const resetCameraView = () => {
    setCameraResetTick((t) => t + 1);
  };

  const setActiveGuidedStep = (step: GuidedStepDef['step']) => {
    setGuidedSteps((prev) => ({
      ...prev,
      [activeModuleId]: step,
    }));
  };

  const recordCurrentExperiment = () => {
    const mod = MODULE_MAP[activeModuleId];
    const primaryNumericValue = Number(computedResult.rawNumbers.primaryValue ?? 0);
    const primaryUnit = String(computedResult.rawNumbers.primaryUnit ?? '');

    let nextRecord: ExperimentRecord;

    if (activeModuleId === 'biology-anatomy') {
      const anatomyExp = resolveAnatomyExploration(paramsMap['biology-anatomy']);
      nextRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        moduleId: activeModuleId,
        moduleTitle: mod.title,
        subject: mod.subject,
        timestamp: formatClock(),
        inputSummary: anatomyExp.recordPayload.organAndMode,
        outputSummary: anatomyExp.recordPayload.physiologicalFunction,
        primaryNumericValue,
        primaryUnit,
        formulaText: anatomyExp.recordPayload.identifiedStructures,
        recordKind: 'anatomy',
        anatomyRecord: anatomyExp.recordPayload,
      };
    } else {
      nextRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        moduleId: activeModuleId,
        moduleTitle: mod.title,
        subject: mod.subject,
        timestamp: formatClock(),
        inputSummary: computedResult.summaryInputText,
        outputSummary: computedResult.summaryOutputText,
        primaryNumericValue,
        primaryUnit,
        formulaText: computedResult.primaryEquation,
        recordKind: 'numeric',
      };
    }

    setRecordsByModule((prev) => ({
      ...prev,
      [activeModuleId]: [...(prev[activeModuleId] ?? []), nextRecord],
    }));
    setActiveGuidedStep(4);
    showToast(`Data tercatat (${records.length + 1} data pada ${mod.shortTitle})`);
  };

  const removeRecord = (id: string) => {
    setRecordsByModule((prev) => ({
      ...prev,
      [activeModuleId]: (prev[activeModuleId] ?? []).filter((r) => r.id !== id),
    }));
  };

  const clearRecords = () => {
    setRecordsByModule((prev) => ({
      ...prev,
      [activeModuleId]: [],
    }));
    showToast(`Data lembar kerja ${MODULE_MAP[activeModuleId].shortTitle} dibersihkan`);
  };

  const toggleExploredItemForSummary = (id: string) => {
    setExploredByModule((prev) => ({
      ...prev,
      [activeModuleId]: (prev[activeModuleId] ?? []).map((item) =>
        item.id === id ? { ...item, selectedForSummary: !item.selectedForSummary } : item,
      ),
    }));
  };

  const setAllExploredForSummary = (selected: boolean) => {
    setExploredByModule((prev) => ({
      ...prev,
      [activeModuleId]: (prev[activeModuleId] ?? []).map((item) => ({
        ...item,
        selectedForSummary: selected,
      })),
    }));
  };

  const clearExploredItems = () => {
    setExploredByModule((prev) => ({
      ...prev,
      [activeModuleId]: [],
    }));
    showToast(
      `Riwayat eksplorasi 3D ${MODULE_MAP[activeModuleId].shortTitle} dibersihkan`,
    );
  };

  const addExploredItemsToWorksheet = () => {
    const selected = exploredItems.filter((item) => item.selectedForSummary);
    if (selected.length === 0) {
      showToast('Pilih minimal 1 hasil eksplorasi 3D terlebih dahulu');
      return;
    }

    const mod = MODULE_MAP[activeModuleId];
    const currentRecords = recordsByModule[activeModuleId] ?? [];
    const existingKeys = new Set(
      currentRecords.map((r) => `${r.inputSummary}::${r.formulaText}`),
    );

    const added: ExperimentRecord[] = [];
    for (const item of selected) {
      const dedupKey = `${item.inputSummary}::${item.formulaText}`;
      if (existingKeys.has(dedupKey)) continue;
      existingKeys.add(dedupKey);
      added.push({
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        moduleId: activeModuleId,
        moduleTitle: mod.title,
        subject: mod.subject,
        timestamp: item.clickedAt,
        inputSummary: item.inputSummary,
        outputSummary: item.outputSummary,
        primaryNumericValue: item.primaryNumericValue,
        primaryUnit: item.primaryUnit,
        formulaText: item.formulaText,
        recordKind: item.recordKind,
        anatomyRecord: item.anatomyRecord,
      });
    }

    if (added.length === 0) {
      showToast('Seluruh item terpilih sudah ada di tabel observasi modul ini');
      return;
    }

    setRecordsByModule((prev) => ({
      ...prev,
      [activeModuleId]: [...(prev[activeModuleId] ?? []), ...added],
    }));
    setActiveGuidedStep(4);
    showToast(`${added.length} item terpilih ditambahkan ke tabel ${mod.shortTitle}`);
  };

  const setManualNote = (note: string) => {
    setNotesByModule((prev) => ({
      ...prev,
      [activeModuleId]: note,
    }));
  };

  const setSessionApiKey = (key: string) => {
    setSessionApiKeyState(key);
    saveSessionApiKey(key);
    showToast(key.trim() ? 'Kunci Gemini API sesi disimpan' : 'Kunci Gemini API sesi dihapus');
  };

  const chatMessages = useMemo<ChatMessage[]>(() => {
    const existing = chatHistoryMap[activeModuleId];
    if (existing && existing.length > 0) return existing;

      const mod = MODULE_MAP[activeModuleId];
      return [
        {
          id: `welcome-${activeModuleId}`,
          role: 'assistant',
          text:
            activeModuleId === 'biology-anatomy'
              ? `Halo! Saya AI Co-Pilot untuk modul ${mod.title}. ${computedResult.copilotInsight} Tanyakan tentang struktur ruang jantung, katup, percabangan bronkus, atau gangguan sistem kardiorespirasi.`
              : activeModuleId === 'biology-cell'
                ? `Halo! Saya AI Co-Pilot khusus ${mod.title}. ${computedResult.copilotInsight} Tanyakan tentang struktur dan fungsi organel yang sedang kamu amati (Nukleus, Kloroplas, Vakuola, Mitokondria, RE, Badan Golgi, Plasmodesmata) maupun perbedaan saat sel terkena cahaya dan gelap!`
                : activeModuleId === 'math-geometry3d'
                  ? `Halo! Saya AI Co-Pilot untuk modul ${mod.title} Kelas XI. ${computedResult.copilotInsight} Tanyakan mengenai perkalian matriks transformasi 2×2, determinan luas bayangan, panjang busur, sudut keliling, maupun pembuktian garis singgung lingkaran!`
                  : `Halo! Saya AI Co-Pilot untuk modul ${mod.title}. ${computedResult.copilotInsight}`,
          formulaChip: computedResult.primaryEquation,
          timestamp: formatClock(),
          verifiedLabel: 'Konteks Modul SMA Kelas XI',
        },
      ];
  }, [activeModuleId, chatHistoryMap, computedResult]);

  const sendCopilotMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isCopilotLoading) return;

    const modId = activeModuleId;
    const nowClock = formatClock();
    const studentMsg: ChatMessage = {
      id: `stu-${Date.now()}`,
      role: 'student',
      text: trimmed,
      timestamp: nowClock,
    };
    const streamMsgId = `ai-${Date.now() + 1}`;
    const placeholderAssistantMsg: ChatMessage = {
      id: streamMsgId,
      role: 'assistant',
      text: 'Menyusun penjelasan...',
      formulaChip: computedResult.primaryEquation,
      timestamp: nowClock,
      verifiedLabel: 'Menghubungkan ke Gemini Flash...',
    };

    const historySnapshot = chatHistoryMap[modId] ?? chatMessages;

    setChatHistoryMap((prev) => {
      const curr = prev[modId] ?? chatMessages;
      return {
        ...prev,
        [modId]: [...curr, studentMsg, placeholderAssistantMsg],
      };
    });

    setIsCopilotLoading(true);
    try {
      const reply = await askCopilot(
        trimmed,
        {
          moduleId: modId,
          guidedStep: activeGuidedStep,
          recordedCount: records.length,
          computed: computedResult,
          anatomyParams: modId === 'biology-anatomy' ? paramsMap['biology-anatomy'] : undefined,
          circuitParams: modId === 'physics-circuit' ? paramsMap['physics-circuit'] : undefined,
          cellParams: modId === 'biology-cell' ? paramsMap['biology-cell'] : undefined,
          geometryParams: modId === 'math-geometry3d' ? paramsMap['math-geometry3d'] : undefined,
          history: historySnapshot,
        },
        (partialText) => {
          setChatHistoryMap((prev) => {
            const curr = prev[modId] ?? [];
            return {
              ...prev,
              [modId]: curr.map((m) =>
                m.id === streamMsgId
                  ? {
                      ...m,
                      text: partialText,
                      verifiedLabel: 'Gemini Flash · Menjawab...',
                    }
                  : m,
              ),
            };
          });
        },
      );

      const finalVerifiedLabel =
        reply.mode === 'gemini'
          ? `${reply.modelUsed ?? 'Gemini Flash'} · Terverifikasi SMA Kelas XI`
          : reply.errorDetail
            ? `Fallback Lokal (${reply.errorDetail})`
            : 'Analisis Deterministik Lokal (Mode Offline)';

      setChatHistoryMap((prev) => {
        const curr = prev[modId] ?? [];
        return {
          ...prev,
          [modId]: curr.map((m) =>
            m.id === streamMsgId
              ? {
                  ...m,
                  text: reply.text,
                  formulaChip: reply.formulaChip,
                  verifiedLabel: finalVerifiedLabel,
                }
              : m,
          ),
        };
      });
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const hasGeminiKey = Boolean(getActiveGeminiApiKey() || sessionApiKey.trim());

  return (
    <LabContext.Provider
      value={{
        view,
        setView,
        activeModuleId,
        selectModule,
        paramsMap,
        updateModuleParams,
        setAnatomyInspectionMode,
        setAnatomyFocusOrgan,
        setAnatomyLungVariant,
        handleAnatomyOrganClick,
        resetActiveModule,
        computedResult,
        showVectors,
        setShowVectors,
        isSimRunning,
        setIsSimRunning,
        triggerSimulationRun,
        cameraResetTick,
        resetCameraView,
        activeGuidedStep,
        setActiveGuidedStep,
        records,
        recordCurrentExperiment,
        removeRecord,
        clearRecords,
        exploredItems,
        toggleExploredItemForSummary,
        setAllExploredForSummary,
        clearExploredItems,
        addExploredItemsToWorksheet,
        manualNote,
        setManualNote,
        chatMessages,
        sendCopilotMessage,
        isCopilotLoading,
        hasGeminiKey,
        sessionApiKey,
        setSessionApiKey,
        toastMessage,
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used inside LabProvider');
  return ctx;
}
