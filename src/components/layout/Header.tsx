import {
  ArrowLeft,
  Box,
  KeyRound,
  NotebookPen,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { MODULE_MAP } from '../../data/modules';
import { sanitizeApiKey, testGeminiConnection } from '../../services/geminiCopilot';

export function Header() {
  const {
    view,
    setView,
    activeModuleId,
    resetActiveModule,
    recordCurrentExperiment,
    records,
    hasGeminiKey,
    sessionApiKey,
    setSessionApiKey,
  } = useLab();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyDraft, setKeyDraft] = useState(sessionApiKey);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [isTestingKey, setIsTestingKey] = useState(false);

  const activeModule = MODULE_MAP[activeModuleId];
  const isLabFlow = view === 'workspace' || view === 'analysis' || view === 'worksheet';

  return (
    <header className="no-print fixed top-0 left-0 right-0 z-50 bg-[#EFECE4]/90 backdrop-blur-xl shadow-[0_1px_10px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        {/* Left: Brand & Contextual Breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {view !== 'landing' ? (
            <button
              type="button"
              aria-label="Kembali"
              onClick={() => {
                if (view === 'catalog') setView('landing');
                else if (view === 'workspace') setView('catalog');
                else setView('workspace');
              }}
              className="tactile-raised tactile-raised-interactive flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#23272A] sm:h-9 sm:w-9 md:hidden"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setView('landing')}
            className="flex cursor-pointer items-center gap-1.5 sm:gap-2 focus-visible:outline-2 focus-visible:outline-[#0E5A63]"
          >
            <div className="tactile-inset flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#0E5A63] sm:h-9 sm:w-9">
              <Box className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            </div>
            <span className="text-base font-bold tracking-tight text-[#0E5A63] sm:text-lg">
              EDUSPACE
            </span>
          </button>

          {isLabFlow ? (
            <div className="hidden items-center gap-2 font-code text-xs text-[#5C6064] md:flex">
              <span className="opacity-40">/</span>
              <button
                type="button"
                onClick={() => setView('catalog')}
                className="cursor-pointer transition-colors hover:text-[#23272A]"
              >
                Pilih Materi
              </button>
              <span className="opacity-40">/</span>
              <span className="truncate font-semibold text-[#0E5A63]">
                {activeModule.shortTitle}
              </span>
            </div>
          ) : null}
        </div>

        {/* Center: Stage Navigation Pill (Tahap 3-5 Desktop) */}
        {isLabFlow ? (
          <nav
            aria-label="Navigasi Tahap Praktikum"
            className="tactile-inset hidden items-center gap-1 rounded-full p-1 lg:flex"
          >
            {(
              [
                { id: 'workspace', label: 'Simulasi 3D' },
                {
                  id: 'analysis',
                  label:
                    activeModuleId === 'physics-inclined'
                      ? 'Analisis & Rumus'
                      : 'Analisis & AI',
                },
                { id: 'worksheet', label: `Lembar Kerja (${records.length})` },
              ] as const
            ).map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                      : 'text-[#5C6064] hover:text-[#23272A]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : null}

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {view === 'landing' ? (
            <>
              <span className="tactile-inset hidden rounded-full px-3 py-1 font-code text-xs text-[#5C6064] sm:inline-flex">
                SMA Kelas XI
              </span>
              <button
                type="button"
                onClick={() => setView('catalog')}
                className="tactile-pill-cta cursor-pointer rounded-full px-5 py-2 text-xs font-semibold"
              >
                Masuk Lab
              </button>
            </>
          ) : null}

          {isLabFlow ? (
            <>
              <button
                type="button"
                onClick={recordCurrentExperiment}
                className="tactile-raised tactile-raised-interactive flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-[#23272A] sm:h-9 sm:px-3.5"
              >
                <NotebookPen className="h-3.5 w-3.5 text-[#0E5A63] sm:h-4 sm:w-4" strokeWidth={2} />
                <span className="hidden sm:inline">Catat Data</span>
                <span className="tactile-inset rounded-full px-1.5 py-0.5 font-code text-[11px] text-[#0E5A63]">
                  {records.length}
                </span>
              </button>

              {view === 'workspace' ? (
                <button
                  type="button"
                  aria-label="Reset Simulasi"
                  title="Reset Parameter Simulasi"
                  onClick={resetActiveModule}
                  className="tactile-raised tactile-raised-interactive flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#5C6064] hover:text-[#23272A] sm:h-9 sm:w-9"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                </button>
              ) : null}
            </>
          ) : null}

          {/* Tombol Konfigurasi Gemini API Key Sesi Lokal (tanpa login) */}
          <button
            type="button"
            aria-label="Atur Kunci Gemini Flash Sesi"
            title={
              hasGeminiKey
                ? 'Gemini Flash Aktif (Klik untuk ubah kunci sesi)'
                : 'Mode Offline Aktif (Klik untuk isi API Key Gemini Flash)'
            }
            onClick={() => {
              setKeyDraft(sessionApiKey);
              setShowKeyModal((s) => !s);
            }}
            className={`tactile-raised tactile-raised-interactive flex h-8 w-8 cursor-pointer items-center justify-center rounded-full sm:h-9 sm:w-9 ${
              hasGeminiKey ? 'text-[#0E5A63]' : 'text-[#5C6064]'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Compact Mobile Stage Switcher for Tahap 3-5 */}
      {isLabFlow ? (
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-4 pb-2.5 lg:hidden">
          {(
            [
              { id: 'workspace', label: 'Simulasi 3D' },
              {
                id: 'analysis',
                label:
                  activeModuleId === 'physics-inclined'
                    ? 'Analisis & Rumus'
                    : 'Analisis & AI',
              },
              { id: 'worksheet', label: `Lembar Kerja (${records.length})` },
            ] as const
          ).map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`flex-1 cursor-pointer rounded-full py-1.5 text-center text-[11px] font-semibold transition-all ${
                  active
                    ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                    : 'tactile-inset text-[#5C6064]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Popover Pengaturan Kunci Gemini API Sesi Lokal */}
      {showKeyModal ? (
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <div className="tactile-raised ml-auto flex max-w-md flex-col gap-2.5 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#23272A]">
                Kunci API Gemini Flash (Opsional · Sesi Browser)
              </span>
              <span className="font-code text-[11px] text-[#0E5A63]">
                {hasGeminiKey ? 'Terhubung' : 'Mode Lokal'}
              </span>
            </div>
            <p className="text-xs text-[#5C6064]">
              Disimpan lokal di browser untuk mengaktifkan AI Co-Pilot Gemini Flash. Jika kosong,
              aplikasi tetap berjalan menggunakan analisis deterministik lokal.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => {
                  setKeyDraft(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Tempel API Key Gemini (AIza...)..."
                className="tactile-inset w-full rounded-full border-0 px-3.5 py-2 font-code text-xs text-[#23272A] placeholder:text-[#5C6064] focus:outline-2 focus:outline-[#0E5A63]"
              />
              <button
                type="button"
                disabled={isTestingKey}
                onClick={async () => {
                  const clean = sanitizeApiKey(keyDraft);
                  setSessionApiKey(clean);
                  setIsTestingKey(true);
                  const res = await testGeminiConnection(clean || undefined);
                  setTestResult(res);
                  setIsTestingKey(false);
                }}
                className="tactile-raised tactile-raised-interactive shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold text-[#0E5A63]"
              >
                {isTestingKey ? 'Menguji...' : 'Tes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSessionApiKey(sanitizeApiKey(keyDraft));
                  setShowKeyModal(false);
                }}
                className="tactile-pill-cta shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold"
              >
                Simpan
              </button>
            </div>
            {testResult ? (
              <p
                className={`font-code text-[11px] ${
                  testResult.ok ? 'text-[#0E5A63]' : 'text-[#23272A]'
                }`}
              >
                {testResult.ok ? '✓ ' : '⚠ '}
                {testResult.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
