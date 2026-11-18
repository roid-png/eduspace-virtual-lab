import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormulaText } from '../components/ui/FormulaText';
import { TactileCard } from '../components/ui/TactileCard';
import { useLab } from '../context/LabContext';
import { ANATOMY_LICENSE_ATTRIBUTION } from '../data/anatomyData';
import { MODULE_MAP } from '../data/modules';
import { PLANT_CELL_LICENSE_ATTRIBUTION } from '../data/plantCellData';
import {
  WORKSHEET_CONFIG_BY_MODULE,
  buildModuleSummaryFromExplored,
  buildModuleSummaryFromRecords,
} from '../data/worksheetTemplates';
import {
  copyWorksheetText,
  downloadWorksheetTxt,
  exportWorksheetPdf,
  formatWorksheetText,
} from '../services/exportReport';

export function WorksheetPage() {
  const {
    records,
    removeRecord,
    clearRecords,
    exploredItems,
    toggleExploredItemForSummary,
    setAllExploredForSummary,
    clearExploredItems,
    addExploredItemsToWorksheet,
    manualNote,
    setManualNote,
    activeModuleId,
    setView,
    computedResult,
    recordCurrentExperiment,
  } = useLab();

  const [showNoteBox, setShowNoteBox] = useState(Boolean(manualNote.trim()));
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [copyStatusText, setCopyStatusText] = useState('');
  const copyTimerRef = useRef<number | null>(null);
  const mod = MODULE_MAP[activeModuleId];
  const cfg = WORKSHEET_CONFIG_BY_MODULE[activeModuleId];
  const selectedExploredCount = exploredItems.filter(
    (item) => item.selectedForSummary,
  ).length;
  const isAnatomyTable = cfg.isAnatomyLayout;
  const isNoteVisible = showNoteBox || Boolean(manualNote.trim());
  const autoSummaryText = useMemo(
    () => buildModuleSummaryFromRecords(activeModuleId, records),
    [activeModuleId, records],
  );
  const [printExportDate, setPrintExportDate] = useState(() =>
    new Date().toLocaleString('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }),
  );

  const handlePrintPdf = () => {
    setPrintExportDate(
      new Date().toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
    );
    window.requestAnimationFrame(() => {
      exportWorksheetPdf();
    });
  };

  const handleGenerateSummaryFromSelected = () => {
    const summaryText = buildModuleSummaryFromExplored(activeModuleId, exploredItems);
    if (!summaryText) return;
    setManualNote(summaryText);
    setShowNoteBox(true);
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const formatted = formatWorksheetText(records, manualNote, mod.title, activeModuleId);
    const ok = await copyWorksheetText(formatted);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    setCopyState(ok ? 'copied' : 'failed');
    setCopyStatusText(ok ? 'Tersalin!' : 'Gagal menyalin');
    copyTimerRef.current = window.setTimeout(() => {
      setCopyState('idle');
      setCopyStatusText('');
    }, 2200);
  };

  const handleDownloadTxt = () => {
    const formatted = formatWorksheetText(records, manualNote, mod.title, activeModuleId);
    downloadWorksheetTxt(formatted, `lembar-kerja-${activeModuleId}.txt`);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      {/* Toast Status Pill */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setView('workspace')}
          className="tactile-raised tactile-raised-interactive min-h-[38px] cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-[#0E5A63]"
        >
          ← Kembali ke Lab 3D
        </button>

        <div className="tactile-raised flex items-center gap-2 rounded-full px-4 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0E5A63]" strokeWidth={2} />
          <span className="text-xs font-medium text-[#23272A] sm:text-sm">
            Real-Time Aktif: {records.length} data praktikum tersimpan
          </span>
        </div>
      </div>

      {/* Main Worksheet Card (tercetak rapi pada @media print sebagai lembar putih bersih) */}
      <TactileCard
        variant="raised-lg"
        className="print-clean-card flex flex-col gap-5 rounded-3xl p-4 sm:gap-6 sm:p-8"
      >
        {/* Header Lembar Kerja */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#5C6064]/15 pb-4 sm:flex-row sm:items-center print:border-b-2 print:border-[#111827] print:pb-3">
          <div>
            <span className="font-code text-[11px] font-semibold tracking-wider text-[#0E5A63] uppercase print:text-[#111827]">
              EDUSPACE • Kurikulum Merdeka / Sekolah Menengah Atas
            </span>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#23272A] sm:text-3xl print:text-2xl print:text-[#111827]">
              Lembar Kerja &amp; Laporan Hasil Praktikum
            </h1>
            <p className="mt-1 text-xs text-[#5C6064] sm:text-sm print:text-[#374151]">
              Modul: <strong className="text-[#23272A] print:text-[#111827]">{mod.title}</strong> ({mod.categoryLabel})
            </p>
            <p className="print-only mt-1 font-code text-[11px] text-[#374151]">
              Tanggal Cetak: {printExportDate} · Total Data Praktikum: {records.length}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="tactile-raised tactile-raised-interactive inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-[#23272A] sm:px-4"
              >
                {copyState === 'copied' ? (
                  <Check className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                ) : (
                  <Copy className="h-4 w-4 text-[#5C6064]" strokeWidth={2} />
                )}
                <span>
                  {copyState === 'copied'
                    ? 'Tersalin!'
                    : copyState === 'failed'
                      ? 'Gagal Salin'
                      : 'Salin Teks'}
                </span>
              </button>
              <span role="status" className="sr-only">
                {copyStatusText}
              </span>
            </span>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="tactile-raised tactile-raised-interactive inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-[#23272A] sm:px-4"
            >
              <FileText className="h-4 w-4 text-[#5C6064]" strokeWidth={2} />
              <span>Unduh .txt</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="tactile-pill-cta inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold sm:px-5"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Status Praktikum Real-Time (Kondisi Simulasi 3D Aktif Saat Ini) */}
        <div className="no-print tactile-inset flex flex-col gap-1.5 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#0E5A63]" />
            <span className="font-code text-[11px] font-semibold text-[#0E5A63] uppercase">
              Pantauan Real-Time Modul Aktif
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-code text-xs text-[#23272A]">
            <span>{computedResult.summaryInputText}</span>
            <span className="text-[#0E5A63]">→ {computedResult.summaryOutputText}</span>
          </div>
        </div>

        {/* Empty State */}
        {records.length === 0 ? (
          <TactileCard
            variant="inset"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center"
          >
            <p className="text-sm font-semibold text-[#23272A]">
              Belum ada data percobaan yang dicatat pada sesi ini.
            </p>
            <p className="max-w-md text-xs text-[#5C6064]">
              Atur parameter di Ruang Simulasi 3D lalu klik tombol &ldquo;Catat Data&rdquo;,
              atau catat kondisi parameter aktif saat ini sekarang.
            </p>
            <button
              type="button"
              onClick={recordCurrentExperiment}
              className="tactile-pill-cta mt-1 cursor-pointer rounded-full px-5 py-2 text-xs font-semibold"
            >
              + Catat Kondisi Simulasi Saat Ini
            </button>
          </TactileCard>
        ) : (
          <>
            {/* Desktop & Print Observation Table */}
            <div
              tabIndex={0}
              role="region"
              aria-label="Tabel Data Observasi Praktikum"
              className="print-table-region tactile-inset hidden overflow-x-auto rounded-2xl md:block"
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#EFECE4]/70">
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-bold tracking-wider text-[#5C6064] uppercase"
                    >
                      {cfg.indexLabel}
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-bold tracking-wider text-[#5C6064] uppercase"
                    >
                      {cfg.col1Label}
                    </th>
                    {isAnatomyTable ? (
                      <>
                        <th
                          scope="col"
                          className="px-5 py-3.5 text-xs font-bold tracking-wider text-[#5C6064] uppercase"
                        >
                          {cfg.col2Label}
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3.5 text-xs font-bold tracking-wider text-[#5C6064] uppercase"
                        >
                          {cfg.col3Label ?? 'Fungsi Fisiologis'}
                        </th>
                      </>
                    ) : (
                      <th
                        scope="col"
                        className="px-5 py-3.5 text-xs font-bold tracking-wider text-[#5C6064] uppercase"
                      >
                        {cfg.col2Label}
                      </th>
                    )}
                    <th
                      scope="col"
                      className="no-print px-4 py-3.5 text-center text-xs font-bold tracking-wider text-[#5C6064] uppercase"
                    >
                      Hapus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, idx) => {
                    const isAnatomyRow =
                      rec.recordKind === 'anatomy' || rec.moduleId === 'biology-anatomy';
                    const organAndMode = rec.anatomyRecord?.organAndMode ?? rec.inputSummary;
                    const identifiedStructures =
                      rec.anatomyRecord?.identifiedStructures ?? rec.formulaText;
                    const physiologicalFunction =
                      rec.anatomyRecord?.physiologicalFunction ?? rec.outputSummary;

                    return (
                      <tr
                        key={rec.id}
                        className="transition-colors hover:bg-[#F6F3EC]/70"
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="tactile-raised w-fit rounded-lg px-2.5 py-0.5 font-code text-xs font-semibold text-[#23272A]">
                              {isAnatomyRow ? `Obs ${idx + 1}` : `Uji ${idx + 1}`}
                            </span>
                            <span className="font-code text-[11px] text-[#5C6064]">
                              {rec.moduleTitle}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top font-code text-xs text-[#23272A] sm:text-sm">
                          {isAnatomyRow ? organAndMode : rec.inputSummary}
                        </td>
                        {isAnatomyTable ? (
                          <>
                            <td className="px-5 py-4 align-top text-xs font-semibold text-[#0E5A63] sm:text-sm">
                              {identifiedStructures}
                            </td>
                            <td className="px-5 py-4 align-top text-xs leading-relaxed text-[#23272A]">
                              {physiologicalFunction}
                            </td>
                          </>
                        ) : (
                          <td className="px-5 py-4 align-top">
                            <div className="flex flex-col gap-1">
                              <span className="font-code text-xs font-semibold text-[#0E5A63] sm:text-sm">
                                {isAnatomyRow ? identifiedStructures : rec.outputSummary}
                              </span>
                              <span className="font-code text-[11px] text-[#5C6064]">
                                {isAnatomyRow ? (
                                  physiologicalFunction
                                ) : (
                                  <FormulaText text={rec.formulaText} />
                                )}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="no-print px-4 py-4 text-center align-top">
                          <button
                            type="button"
                            aria-label={`Hapus ${isAnatomyRow ? 'Observasi' : 'Uji'} ${idx + 1}`}
                            onClick={() => removeRecord(rec.id)}
                            className="mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#5C6064] transition-colors hover:text-[#23272A]"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Observation Cards */}
            <div className="no-print flex flex-col gap-3 md:hidden">
              {records.map((rec, idx) => {
                const isAnatomyRow =
                  rec.recordKind === 'anatomy' || rec.moduleId === 'biology-anatomy';
                return (
                  <TactileCard
                    key={rec.id}
                    variant="raised"
                    className="flex flex-col gap-3 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="tactile-inset w-fit rounded-full px-3 py-0.5 font-code text-xs font-semibold text-[#23272A]">
                          {isAnatomyRow ? 'Observasi' : 'Uji'} {idx + 1} · {rec.timestamp}
                        </span>
                        <span className="text-xs font-medium text-[#5C6064]">
                          {rec.moduleTitle}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Hapus ${isAnatomyRow ? 'Observasi' : 'Uji'} ${idx + 1}`}
                        onClick={() => removeRecord(rec.id)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#5C6064] hover:text-[#23272A]"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>

                    {isAnatomyRow ? (
                      <div className="tactile-inset flex flex-col gap-1.5 rounded-xl p-3">
                        <span className="font-code text-[11px] text-[#5C6064]">
                          {cfg.col1Label}: {rec.anatomyRecord?.organAndMode ?? rec.inputSummary}
                        </span>
                        <span className="text-xs font-semibold text-[#0E5A63]">
                          {cfg.col2Label}: {rec.anatomyRecord?.identifiedStructures ?? rec.formulaText}
                        </span>
                        <span className="text-xs leading-relaxed text-[#23272A]">
                          {cfg.col3Label ?? 'Fungsi Fisiologis'}:{' '}
                          {rec.anatomyRecord?.physiologicalFunction ?? rec.outputSummary}
                        </span>
                      </div>
                    ) : (
                      <div className="tactile-inset flex flex-col gap-1.5 rounded-xl p-3">
                        <span className="font-code text-[11px] text-[#5C6064]">
                          {cfg.col1Label}: {rec.inputSummary}
                        </span>
                        <span className="font-code text-xs font-semibold text-[#0E5A63]">
                          {rec.outputSummary}
                        </span>
                        <span className="font-code text-[11px] text-[#5C6064]">
                          <FormulaText text={rec.formulaText} />
                        </span>
                      </div>
                    )}
                  </TactileCard>
                );
              })}
            </div>
          </>
        )}

        {/* Pemilih Hasil Eksplorasi 3D untuk Rangkuman Siswa (Terisolasi & Spesifik per Modul) */}
        <TactileCard
          variant="inset"
          className="no-print flex flex-col gap-3 rounded-2xl p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold tracking-wider text-[#23272A] uppercase">
                {cfg.pickerTitle}
              </span>
              <span className="text-xs text-[#5C6064]">
                {cfg.pickerDescription}
              </span>
            </div>

            {exploredItems.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3 font-code text-[11px]">
                <button
                  type="button"
                  onClick={() => setAllExploredForSummary(true)}
                  className="cursor-pointer font-semibold text-[#0E5A63] hover:underline"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={() => setAllExploredForSummary(false)}
                  className="cursor-pointer font-semibold text-[#5C6064] hover:text-[#23272A]"
                >
                  Hapus Pilihan
                </button>
                <button
                  type="button"
                  onClick={clearExploredItems}
                  className="cursor-pointer font-semibold text-[#5C6064] hover:text-[#23272A]"
                >
                  Bersihkan Riwayat
                </button>
              </div>
            ) : null}
          </div>

          {exploredItems.length === 0 ? (
            <div className="tactile-raised rounded-xl px-4 py-3 text-xs text-[#5C6064]">
              {cfg.pickerEmptyHint}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {exploredItems.map((item) => {
                  const checked = item.selectedForSummary;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleExploredItemForSummary(item.id)}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl p-3 text-left transition-all ${
                        checked
                          ? 'tactile-raised ring-1 ring-[#0E5A63]/40'
                          : 'bg-[#F6F3EC]/55 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md ${
                          checked
                            ? 'bg-[#0E5A63] text-white'
                            : 'tactile-inset text-transparent'
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-xs font-bold text-[#23272A]">
                          {item.title}
                        </span>
                        <span className="truncate font-code text-[10px] font-medium text-[#0E5A63]">
                          {item.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={selectedExploredCount === 0}
                  onClick={addExploredItemsToWorksheet}
                  className="tactile-raised tactile-raised-interactive cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-[#23272A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Masukkan ke Tabel ({selectedExploredCount})
                </button>
                <button
                  type="button"
                  disabled={selectedExploredCount === 0}
                  onClick={handleGenerateSummaryFromSelected}
                  className="tactile-pill-cta cursor-pointer rounded-full px-5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Susun Rangkuman dari Pilihan ({selectedExploredCount})
                </button>
              </div>
            </>
          )}
        </TactileCard>

        {/* Ringkasan Otomatis Hasil Praktikum (Real-Time, tampil di layar & tercetak utuh di PDF) */}
        {autoSummaryText ? (
          <section className="flex flex-col gap-2 rounded-2xl border border-[#5C6064]/15 bg-[#F6F3EC]/50 p-4 print:rounded-lg print:border print:border-[#d1d5db] print:bg-white print:p-3">
            <h2 className="text-xs font-bold tracking-wider text-[#0E5A63] uppercase print:text-[#111827]">
              Rangkuman Laporan Hasil Praktikum (Real-Time)
            </h2>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#23272A] sm:text-sm print:text-xs print:text-[#111827]">
              {autoSummaryText}
            </p>
          </section>
        ) : null}

        {/* Strip Catatan Pengamatan Manual */}
        <div className="no-print tactile-inset flex flex-col justify-between gap-2 rounded-2xl px-4 py-3 sm:flex-row sm:items-center">
          <span className="font-code text-xs text-[#5C6064]">
            Penyimpanan Lokal Aktif • Tersimpan terpisah untuk modul {mod.shortTitle}
          </span>
          <div className="flex flex-wrap items-center gap-4">
            {records.length > 0 ? (
              <button
                type="button"
                onClick={clearRecords}
                className="cursor-pointer text-xs font-semibold text-[#5C6064] hover:text-[#23272A]"
              >
                Bersihkan Tabel Modul Ini
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowNoteBox((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#0E5A63] hover:underline"
            >
              {isNoteVisible ? (
                <>
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Sembunyikan Catatan</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Tambah Catatan Manual</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isNoteVisible ? (
          <div className="tactile-inset flex flex-col gap-2 rounded-2xl p-4 print:rounded-lg print:border print:border-[#d1d5db] print:bg-white print:p-3">
            <label
              htmlFor="manual-observation-note"
              className="text-xs font-bold tracking-wider text-[#5C6064] uppercase print:text-[#111827]"
            >
              Kesimpulan &amp; Catatan Pengamatan Siswa — {mod.shortTitle}
            </label>
            <textarea
              id="manual-observation-note"
              rows={5}
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="Susun rangkuman dari hasil eksplorasi 3D di atas atau tuliskan kesimpulan praktikum kamu di sini..."
              className="no-print w-full resize-y border-0 bg-transparent text-base leading-relaxed text-[#23272A] placeholder:text-[#5C6064] focus:outline-none sm:text-sm"
            />
            {manualNote.trim() ? (
              <div className="print-only whitespace-pre-wrap text-xs leading-relaxed text-[#111827]">
                {manualNote.trim()}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeModuleId === 'biology-anatomy' ? (
          <p className="font-code text-[11px] text-[#5C6064]">
            {ANATOMY_LICENSE_ATTRIBUTION}
          </p>
        ) : activeModuleId === 'biology-cell' ? (
          <p className="font-code text-[11px] text-[#5C6064]">
            {PLANT_CELL_LICENSE_ATTRIBUTION}
          </p>
        ) : null}
      </TactileCard>
    </div>
  );
}
