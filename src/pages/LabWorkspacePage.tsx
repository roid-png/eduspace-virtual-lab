import { Compass, Pause, Play } from 'lucide-react';
import { Module3DCanvas } from '../components/three/Module3DCanvas';
import { TactileCard } from '../components/ui/TactileCard';
import { TactileSlider } from '../components/ui/TactileSlider';
import { TactileSegmented, TactileSwitch } from '../components/ui/TactileToggle';
import { useLab } from '../context/LabContext';
import {
  ANATOMY_LICENSE_ATTRIBUTION,
  SEPARABLE_PARTS,
  getActiveLicenseAttribution,
} from '../data/anatomyData';
import { MODULE_MAP } from '../data/modules';
import {
  PLANT_CELL_LICENSE_ATTRIBUTION,
  PLANT_CELL_ORGANELLE_LIST,
} from '../data/plantCellData';
import { DEFAULT_RAMP_LENGTH_M, GRAVITY } from '../engines/physicsInclined';

export function LabWorkspacePage() {
  const {
    activeModuleId,
    paramsMap,
    updateModuleParams,
    setAnatomyInspectionMode,
    setAnatomyFocusOrgan,
    setAnatomyLungVariant,
    handleAnatomyOrganClick,
    computedResult,
    showVectors,
    setShowVectors,
    isSimRunning,
    triggerSimulationRun,
    cameraResetTick,
    resetCameraView,
  } = useLab();

  const mod = MODULE_MAP[activeModuleId];
  const isAnatomy = activeModuleId === 'biology-anatomy';
  const isPlantCell = activeModuleId === 'biology-cell';

  const renderModuleControls = () => {
    switch (activeModuleId) {
      case 'physics-inclined': {
        const p = paramsMap['physics-inclined'];
        const rampLength = p.rampLengthMeters || DEFAULT_RAMP_LENGTH_M;
        const maxHeight = Number((rampLength * Math.sin((60 * Math.PI) / 180)).toFixed(2));
        const currentHeight = Number(
          (rampLength * Math.sin((p.theta * Math.PI) / 180)).toFixed(2),
        );
        const currentWeight = Number((p.mass * GRAVITY).toFixed(1));
        return (
          <>
            <TactileSegmented
              label="Objek Simulasi 3D"
              value={p.objectType}
              options={[
                { value: 'barang', label: 'Peti Barang' },
                { value: 'mobil', label: 'Mobil & Bukit' },
              ]}
              onChange={(objectType) =>
                updateModuleParams('physics-inclined', { objectType })
              }
            />
            <TactileSlider
              label="Sudut Kemiringan"
              symbol="θ"
              value={p.theta}
              min={0}
              max={60}
              step={1}
              unit="°"
              precision={0}
              hint="Sudut lereng bidang miring (tersinkron otomatis dengan h)"
              onChange={(theta) => updateModuleParams('physics-inclined', { theta })}
            />
            <TactileSlider
              label="Tinggi Bidang / Bukit"
              symbol="h"
              value={currentHeight}
              min={0}
              max={maxHeight}
              step={0.05}
              unit="m"
              precision={2}
              hint={`Tersinkron dengan h = L·sin θ (panjang lintasan L = ${rampLength.toFixed(1)} m)`}
              onChange={(nextH) => {
                const maxSin = Math.sin((60 * Math.PI) / 180);
                const clampedRatio = Math.min(maxSin, Math.max(0, nextH / rampLength));
                const nextTheta = Math.round((Math.asin(clampedRatio) * 180) / Math.PI);
                updateModuleParams('physics-inclined', { theta: nextTheta });
              }}
            />
            <TactileSlider
              label={p.objectType === 'mobil' ? 'Massa Mobil' : 'Massa Peti Barang'}
              symbol="m"
              value={p.mass}
              min={1}
              max={10}
              step={0.5}
              unit="kg"
              precision={1}
              hint="Massa benda uji (tersinkron otomatis dengan gaya berat W)"
              onChange={(mass) => updateModuleParams('physics-inclined', { mass })}
            />
            <TactileSlider
              label="Gaya Berat"
              symbol="W"
              value={currentWeight}
              min={GRAVITY}
              max={Number((10 * GRAVITY).toFixed(1))}
              step={0.5}
              unit="N"
              precision={1}
              hint={`Tersinkron dengan W = m·g (g = ${GRAVITY.toFixed(2)} m/s²)`}
              onChange={(nextW) => {
                const nextMass = Number(
                  Math.min(10, Math.max(1, nextW / GRAVITY)).toFixed(2),
                );
                updateModuleParams('physics-inclined', { mass: nextMass });
              }}
            />
            <TactileSlider
              label="Koefisien Gesek"
              symbol="μ"
              value={p.mu}
              min={0}
              max={1}
              step={0.05}
              precision={2}
              minLabel="0.00 (Licin)"
              maxLabel="1.00 (Kasar)"
              hint="Kekasaran permukaan lereng (memunculkan partikel gesek saat bergerak)"
              onChange={(mu) => updateModuleParams('physics-inclined', { mu })}
            />
          </>
        );
      }

      case 'physics-circuit': {
        const p = paramsMap['physics-circuit'];
        return (
          <>
            <TactileSegmented
              label="Konfigurasi Rangkaian"
              value={p.mode}
              options={[
                { value: 'seri', label: 'Seri' },
                { value: 'paralel', label: 'Paralel' },
                { value: 'campuran', label: 'Campuran' },
              ]}
              onChange={(mode) => updateModuleParams('physics-circuit', { mode })}
            />
            <TactileSlider
              label="Tegangan Sumber"
              symbol="V"
              value={p.voltage}
              min={1.5}
              max={24}
              step={0.5}
              unit="V"
              precision={1}
              onChange={(voltage) => updateModuleParams('physics-circuit', { voltage })}
            />
            <TactileSlider
              label={p.mode === 'campuran' ? 'Hambatan R₁ (Seri)' : 'Hambatan 1'}
              symbol="R₁"
              value={p.r1}
              min={2}
              max={50}
              step={1}
              unit="Ω"
              precision={0}
              onChange={(r1) => updateModuleParams('physics-circuit', { r1 })}
            />
            <TactileSlider
              label={p.mode === 'campuran' ? 'Hambatan R₂ (Cabang)' : 'Hambatan 2'}
              symbol="R₂"
              value={p.r2}
              min={2}
              max={50}
              step={1}
              unit="Ω"
              precision={0}
              onChange={(r2) => updateModuleParams('physics-circuit', { r2 })}
            />
            {p.mode === 'campuran' ? (
              <TactileSlider
                label="Hambatan R₃ (Cabang)"
                symbol="R₃"
                value={p.r3}
                min={2}
                max={50}
                step={1}
                unit="Ω"
                precision={0}
                hint="Dipasang paralel terhadap R₂ lalu diserikan dengan R₁"
                onChange={(r3) => updateModuleParams('physics-circuit', { r3 })}
              />
            ) : null}

            {/* Kontrol Saklar (Opsional & Bisa ON/OFF) */}
            <div className="flex flex-col gap-2 border-t border-[#5C6064]/15 pt-3">
              <TactileSwitch
                label="Pasang Saklar (Switch)"
                description="Putus atau hubungkan aliran arus pada rangkaian"
                checked={p.hasSwitch}
                onChange={(hasSwitch) =>
                  updateModuleParams('physics-circuit', { hasSwitch })
                }
              />
              {p.hasSwitch ? (
                <TactileSegmented
                  label="Posisi Saklar (atau klik saklar 3D)"
                  value={p.switchClosed ? 'on' : 'off'}
                  options={[
                    { value: 'on', label: 'Tertutup (ON)' },
                    { value: 'off', label: 'Terbuka (OFF)' },
                  ]}
                  onChange={(state) =>
                    updateModuleParams('physics-circuit', {
                      switchClosed: state === 'on',
                    })
                  }
                />
              ) : null}
            </div>

            {/* Kontrol Lampu Beban (Opsional & Bervariasi) */}
            <div className="flex flex-col gap-2 border-t border-[#5C6064]/15 pt-3">
              <TactileSwitch
                label="Pasang Lampu Indikator"
                description="Lihat variasi nyala terang-redup lampu sesuai daya"
                checked={p.hasLamp}
                onChange={(hasLamp) =>
                  updateModuleParams('physics-circuit', { hasLamp })
                }
              />
              {p.hasLamp ? (
                <>
                  <TactileSegmented
                    label="Jenis & Hambatan Lampu"
                    value={p.lampType}
                    options={[
                      { value: 'led-5', label: 'LED 5 Ω' },
                      { value: 'pijar-10', label: 'Pijar 10 Ω' },
                      { value: 'halogen-20', label: 'Filamen 20 Ω' },
                    ]}
                    onChange={(lampType) =>
                      updateModuleParams('physics-circuit', { lampType })
                    }
                  />
                  {p.mode !== 'seri' ? (
                    <TactileSegmented
                      label="Penempatan Lampu"
                      value={p.lampPlacement}
                      options={[
                        { value: 'utama', label: 'Jalur Utama' },
                        { value: 'cabang', label: 'Cabang R₂' },
                      ]}
                      onChange={(lampPlacement) =>
                        updateModuleParams('physics-circuit', { lampPlacement })
                      }
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          </>
        );
      }

      case 'biology-anatomy': {
        const p = paramsMap['biology-anatomy'];
        return (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#23272A]">Fokus Organ</span>
              <div
                role="radiogroup"
                aria-label="Fokus Organ"
                className="tactile-inset grid grid-cols-2 gap-1.5 rounded-2xl p-1.5"
              >
                {(
                  [
                    { value: 'semua', label: 'Semua' },
                    { value: 'jantung', label: 'Jantung' },
                    { value: 'paru', label: 'Paru-paru' },
                    { value: 'aorta', label: 'Aorta' },
                  ] as const
                ).map((opt) => {
                  const active = p.focusOrgan === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setAnatomyFocusOrgan(opt.value)}
                      className={`cursor-pointer rounded-xl px-2.5 py-2 text-center text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#0E5A63] ${
                        active
                          ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                          : 'text-[#5C6064] hover:text-[#23272A]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {p.focusOrgan === 'semua' ? (
              <>
                <TactileSegmented
                  label="Mode Inspeksi 3D"
                  value={p.inspectionMode}
                  options={[
                    { value: 'utuh', label: 'Utuh' },
                    { value: 'pisahkan', label: 'Pisahkan' },
                    { value: 'belah', label: 'Belah Organ' },
                  ]}
                  onChange={(mode) => setAnatomyInspectionMode(mode)}
                />

                {p.inspectionMode === 'pisahkan' ? (
                  <div className="tactile-inset flex flex-col gap-2 rounded-2xl px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#23272A]">
                        Pemisahan Organ ({p.separatedParts.length}/4)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateModuleParams('biology-anatomy', {
                              separatedParts: [...SEPARABLE_PARTS],
                            })
                          }
                          className="cursor-pointer font-code text-[11px] font-semibold text-[#0E5A63] hover:underline"
                        >
                          Pisah Semua
                        </button>
                        <span className="text-[#5C6064]/40">·</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateModuleParams('biology-anatomy', { separatedParts: [] })
                          }
                          className="cursor-pointer font-code text-[11px] font-semibold text-[#5C6064] hover:text-[#23272A]"
                        >
                          Satukan
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] leading-snug text-[#5C6064]">
                      Klik langsung organ pada kanvas 3D untuk memisah atau menyatukannya kembali.
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}

            {p.focusOrgan === 'paru' ? (
              <div className="flex flex-col gap-3">
                <TactileSegmented
                  label="Tampilan Model Paru-paru"
                  value={p.lungVariant}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'transparan', label: 'Transparan' },
                  ]}
                  onChange={(variant) => setAnatomyLungVariant(variant)}
                />
                <div className="tactile-inset rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed text-[#5C6064]">
                  {p.lungVariant === 'transparan' ? (
                    <span>
                      <strong className="text-[#0E5A63]">Mode Transparan:</strong> Klik langsung
                      bagian di dalam paru (Trakea, Bronkus Kanan/Kiri, Laring, Epiglotis, atau
                      Pita Suara) pada kanvas 3D untuk melihat penamaan dan fungsinya.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-[#23272A]">Mode Normal:</strong> Mengamati struktur
                      lobus luar dan fisura paru. Ubah ke <strong className="text-[#0E5A63]">Transparan</strong>{' '}
                      untuk melihat percabangan bronkus di dalamnya.
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {p.focusOrgan === 'jantung' ? (
              <div className="tactile-inset rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed text-[#5C6064]">
                <strong className="text-[#0E5A63]">Model Jantung Berdenyut:</strong> Klik pin
                pada kanvas 3D atau tekan tombol putar ritme di bawah untuk mengamati gerakan otot
                miokardium dan katup jantung secara langsung.
              </div>
            ) : null}

            {p.focusOrgan === 'aorta' ? (
              <div className="tactile-inset rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed text-[#5C6064]">
                <strong className="text-[#0E5A63]">Detail Aorta &amp; Koarktasio:</strong> Amati
                lengkung aorta, percabangan arteri kepala-lengan, serta zona penyempitan lumen
                (koarktasio aorta).
              </div>
            ) : null}
          </>
        );
      }

      case 'biology-cell': {
        const p = paramsMap['biology-cell'];
        return (
          <>
            <TactileSegmented
              label="Simulasi Kondisi Cahaya"
              value={p.lightCondition}
              options={[
                { value: 'terang', label: 'Terkena Cahaya' },
                { value: 'gelap', label: 'Tanpa Cahaya (Gelap)' },
              ]}
              onChange={(lightCondition) =>
                updateModuleParams('biology-cell', { lightCondition })
              }
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#23272A]">
                  Fokus &amp; Auto-Zoom Organel
                </span>
                {p.focusOrganelle !== 'semua' ? (
                  <button
                    type="button"
                    onClick={() =>
                      updateModuleParams('biology-cell', { focusOrganelle: 'semua' })
                    }
                    className="cursor-pointer font-code text-[11px] font-semibold text-[#0E5A63] hover:underline"
                  >
                    Lihat Semua
                  </button>
                ) : null}
              </div>

              <div
                role="radiogroup"
                aria-label="Fokus Organel Sel Tumbuhan"
                className="tactile-inset grid max-h-[240px] grid-cols-2 gap-1.5 overflow-y-auto rounded-2xl p-2"
              >
                {PLANT_CELL_ORGANELLE_LIST.map((org) => {
                  const active = p.focusOrganelle === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        updateModuleParams('biology-cell', {
                          focusOrganelle: org.id,
                        })
                      }
                      className={`cursor-pointer rounded-xl px-2.5 py-2 text-left text-[11px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#0E5A63] ${
                        active
                          ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                          : 'text-[#5C6064] hover:text-[#23272A]'
                      }`}
                    >
                      {org.shortLabel}
                    </button>
                  );
                })}
              </div>

              <div className="tactile-inset rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed text-[#5C6064]">
                Klik nama organel atau klik langsung bagian pada model 3D untuk{' '}
                <strong className="text-[#0E5A63]">auto-zoom</strong> ke struktur tersebut (tetap bisa scroll zoom &amp; putar manual).
              </div>
            </div>
          </>
        );
      }

      case 'math-geometry3d': {
        const p = paramsMap['math-geometry3d'];
        return (
          <>
            <TactileSegmented
              label="Sub-Mode Materi Geometri"
              value={p.subMode}
              options={[
                { value: 'transformasi', label: 'Transformasi' },
                { value: 'lingkaran', label: 'Lingkaran' },
              ]}
              onChange={(subMode) =>
                updateModuleParams('math-geometry3d', { subMode })
              }
            />

            {p.subMode === 'transformasi' ? (
              <>
                <TactileSegmented
                  label="Jenis Transformasi"
                  value={p.transformType}
                  options={[
                    { value: 'translasi', label: 'Translasi' },
                    { value: 'refleksi', label: 'Refleksi' },
                    { value: 'rotasi', label: 'Rotasi' },
                    { value: 'dilatasi', label: 'Dilatasi' },
                  ]}
                  onChange={(transformType) =>
                    updateModuleParams('math-geometry3d', { transformType })
                  }
                />

                {p.transformType === 'translasi' ? (
                  <>
                    <TactileSlider
                      label="Pergeseran Sumbu X"
                      symbol="a"
                      value={p.tx}
                      min={-5}
                      max={5}
                      step={0.5}
                      precision={1}
                      onChange={(tx) =>
                        updateModuleParams('math-geometry3d', { tx })
                      }
                    />
                    <TactileSlider
                      label="Pergeseran Sumbu Y"
                      symbol="b"
                      value={p.ty}
                      min={-5}
                      max={5}
                      step={0.5}
                      precision={1}
                      onChange={(ty) =>
                        updateModuleParams('math-geometry3d', { ty })
                      }
                    />
                  </>
                ) : null}

                {p.transformType === 'refleksi' ? (
                  <TactileSegmented
                    label="Garis / Sumbu Cermin"
                    value={p.reflectionAxis}
                    options={[
                      { value: 'sumbu-x', label: 'Sumbu X' },
                      { value: 'sumbu-y', label: 'Sumbu Y' },
                      { value: 'y=x', label: 'y = x' },
                      { value: 'y=-x', label: 'y = -x' },
                    ]}
                    onChange={(reflectionAxis) =>
                      updateModuleParams('math-geometry3d', { reflectionAxis })
                    }
                  />
                ) : null}

                {p.transformType === 'rotasi' ? (
                  <TactileSlider
                    label="Sudut Putar (Pusat O)"
                    symbol="α"
                    value={p.rotationDeg}
                    min={-180}
                    max={180}
                    step={15}
                    unit="°"
                    precision={0}
                    hint="Positif berlawanan jarum jam, negatif searah jarum jam"
                    onChange={(rotationDeg) =>
                      updateModuleParams('math-geometry3d', { rotationDeg })
                    }
                  />
                ) : null}

                {p.transformType === 'dilatasi' ? (
                  <TactileSlider
                    label="Faktor Skala (Pusat O)"
                    symbol="k"
                    value={p.dilationScale}
                    min={0.5}
                    max={2.5}
                    step={0.25}
                    precision={2}
                    hint="k > 1 memperbesar bangun, k < 1 memperkecil bangun"
                    onChange={(dilationScale) =>
                      updateModuleParams('math-geometry3d', { dilationScale })
                    }
                  />
                ) : null}

                <div className="flex flex-col gap-3 border-t border-[#5C6064]/15 pt-3">
                  <TactileSlider
                    label="Absis Titik Awal A"
                    symbol="xₐ"
                    value={p.pointAx}
                    min={-3}
                    max={3}
                    step={0.5}
                    precision={1}
                    onChange={(pointAx) =>
                      updateModuleParams('math-geometry3d', { pointAx })
                    }
                  />
                  <TactileSlider
                    label="Ordinat Titik Awal A"
                    symbol="yₐ"
                    value={p.pointAy}
                    min={-3}
                    max={3}
                    step={0.5}
                    precision={1}
                    onChange={(pointAy) =>
                      updateModuleParams('math-geometry3d', { pointAy })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <TactileSlider
                  label="Jari-jari Lingkaran"
                  symbol="r"
                  value={p.radius}
                  min={2}
                  max={6}
                  step={0.5}
                  unit="cm"
                  precision={1}
                  onChange={(radius) =>
                    updateModuleParams('math-geometry3d', { radius })
                  }
                />
                <TactileSlider
                  label="Sudut Pusat Juring"
                  symbol="θ"
                  value={p.centralAngleDeg}
                  min={30}
                  max={300}
                  step={10}
                  unit="°"
                  precision={0}
                  onChange={(centralAngleDeg) =>
                    updateModuleParams('math-geometry3d', { centralAngleDeg })
                  }
                />

                <div className="flex flex-col gap-2 border-t border-[#5C6064]/15 pt-3">
                  <TactileSwitch
                    label="Garis Singgung Lingkaran"
                    description="Tampilkan garis singgung PT tegak lurus jari-jari OT"
                    checked={p.showTangent}
                    onChange={(showTangent) =>
                      updateModuleParams('math-geometry3d', { showTangent })
                    }
                  />
                  {p.showTangent ? (
                    <TactileSlider
                      label="Jarak Titik Luar (OP)"
                      symbol="OP"
                      value={Number((p.radius + p.externalDistanceOffset).toFixed(1))}
                      min={Number((p.radius + 1.5).toFixed(1))}
                      max={Number((p.radius + 6.0).toFixed(1))}
                      step={0.5}
                      unit="cm"
                      precision={1}
                      hint="Mengubah panjang sisi miring OP untuk menghitung PT = √(OP² - r²)"
                      onChange={(nextOp) =>
                        updateModuleParams('math-geometry3d', {
                          externalDistanceOffset: Number(
                            Math.max(1.5, Math.min(6.0, nextOp - p.radius)).toFixed(1),
                          ),
                        })
                      }
                    />
                  ) : null}
                  <TactileSwitch
                    label="Tali Busur & Sudut Keliling"
                    description="Tampilkan tali busur AB & sudut keliling (θ/2)"
                    checked={p.showChord}
                    onChange={(showChord) =>
                      updateModuleParams('math-geometry3d', { showChord })
                    }
                  />
                </div>
              </>
            )}
          </>
        );
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Kanan di Desktop, Atas di Mobile: Kanvas 3D Isometrik (8 kolom) */}
        <TactileCard
          variant="raised"
          className="order-1 flex min-h-[380px] flex-col rounded-3xl p-4 sm:min-h-[500px] lg:order-2 lg:col-span-8 lg:min-h-[560px]"
        >
          <TactileCard
            variant="inset-deep"
            className="relative h-full min-h-[340px] w-full flex-1 overflow-hidden rounded-2xl sm:min-h-[460px]"
          >
            {/* Top-Left Stage Metadata Pills */}
            <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 sm:top-3.5 sm:left-3.5">
              <div className="tactile-raised flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3">
                <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
                <span className="font-code text-[10px] font-medium text-[#23272A] sm:text-[11px]">
                  <span className="hidden sm:inline">Kamera </span>Isometrik
                  <span className="hidden sm:inline"> · Skala</span> 1:1
                </span>
              </div>
              <div className="tactile-raised hidden rounded-full px-3 py-1 sm:flex">
                <span className="font-code text-[11px] text-[#5C6064]">
                  {mod.constantBadge}
                </span>
              </div>
            </div>

            {/* Top-Right Live Readout Callout */}
            <div className="pointer-events-none absolute top-3 right-3 z-20 sm:top-3.5 sm:right-3.5">
              <div className="tactile-raised flex flex-col gap-0.5 rounded-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2">
                <div className="flex items-center gap-1.5 font-code text-[11px] font-bold text-[#23272A] sm:gap-2 sm:text-xs">
                  <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
                  <span>{computedResult.calloutPrimary}</span>
                </div>
                <span className="pl-3.5 font-code text-[10px] text-[#5C6064] sm:pl-4 sm:text-[11px]">
                  {computedResult.calloutSecondary}
                </span>
              </div>
            </div>

            {/* Kanvas Three.js / React Three Fiber */}
            <Module3DCanvas
              moduleId={activeModuleId}
              paramsMap={paramsMap}
              showVectors={showVectors}
              isSimRunning={isSimRunning}
              resetTick={cameraResetTick}
              onAnatomyOrganClick={handleAnatomyOrganClick}
              onAnatomyStructureSelect={(selectedStructureId) =>
                updateModuleParams('biology-anatomy', { selectedStructureId })
              }
              onCircuitSwitchToggle={() =>
                updateModuleParams('physics-circuit', {
                  switchClosed: !paramsMap['physics-circuit'].switchClosed,
                })
              }
              onCellOrganelleSelect={(focusOrganelle) =>
                updateModuleParams('biology-cell', { focusOrganelle })
              }
            />

            {/* Bottom-Left License Attribution (Biologi Anatomi & Sel Tumbuhan) */}
            {isAnatomy || isPlantCell ? (
              <div className="pointer-events-none absolute bottom-3.5 left-3.5 z-10 hidden sm:block">
                <div className="tactile-raised rounded-full px-3 py-1 font-code text-[10px] text-[#5C6064]">
                  {isAnatomy
                    ? getActiveLicenseAttribution(
                        paramsMap['biology-anatomy'].focusOrgan,
                        paramsMap['biology-anatomy'].lungVariant,
                      ) || ANATOMY_LICENSE_ATTRIBUTION
                    : PLANT_CELL_LICENSE_ATTRIBUTION}
                </div>
              </div>
            ) : null}

            {/* Bottom-Right Reset Camera Button */}
            <div className="absolute right-3.5 bottom-3.5 z-10">
              <button
                type="button"
                onClick={resetCameraView}
                className="tactile-raised tactile-raised-interactive flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[#23272A]"
              >
                <Compass className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <span className="font-code text-[11px] font-medium">
                  Reset Sudut Pandang
                </span>
              </button>
            </div>
          </TactileCard>
        </TactileCard>

        {/* Kiri di Desktop, Bawah di Mobile: Panel Kontrol Variabel (4 kolom) */}
        <TactileCard
          variant="raised"
          className="order-2 flex flex-col justify-between gap-5 rounded-3xl p-6 lg:order-1 lg:col-span-4"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#23272A]">
                  {isAnatomy || isPlantCell ? 'Kontrol Eksplorasi 3D' : 'Variabel Simulasi'}
                </h1>
                <span className="h-2.5 w-2.5 rounded-full bg-[#0E5A63] shadow-[0_0_8px_rgba(14,90,99,0.35)]" />
              </div>
              <p className="mt-0.5 text-xs text-[#5C6064]">{mod.title}</p>
            </div>

            <div className="flex flex-col gap-4">{renderModuleControls()}</div>

            <TactileSwitch
              label={
                isAnatomy
                  ? 'Label Bagian Dalam (CalloutPin)'
                  : isPlantCell
                    ? 'Label Organel (CalloutPin)'
                    : 'Label & Vektor 3D'
              }
              description={
                isAnatomy
                  ? 'Tampilkan pin nama ruang jantung, bronkus, & aorta'
                  : isPlantCell
                    ? 'Tampilkan penunjuk nama organel pada model 3D'
                    : 'Tampilkan pin data & garis dimensi'
              }
              checked={showVectors}
              onChange={setShowVectors}
            />
          </div>

          <button
            type="button"
            onClick={triggerSimulationRun}
            className="tactile-pill-cta flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold"
          >
            {isSimRunning ? (
              <>
                <Pause className="h-4 w-4" strokeWidth={2} />
                <span>
                  {isAnatomy
                    ? 'Jeda Ritme Detak & Napas'
                    : isPlantCell
                      ? 'Jeda Efek Cahaya & Metabolisme'
                      : 'Hentikan Simulasi'}
                </span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" strokeWidth={2} />
                <span>
                  {isAnatomy
                    ? 'Putar Ritme Detak & Napas'
                    : isPlantCell
                      ? 'Putar Efek Cahaya & Metabolisme'
                      : 'Jalankan Simulasi'}
                </span>
              </>
            )}
          </button>
        </TactileCard>
      </div>
    </div>
  );
}
