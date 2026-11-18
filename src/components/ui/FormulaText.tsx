import katex from 'katex';
import { useMemo } from 'react';

interface FormulaTextProps {
  /** Ekspresi LaTeX eksplisit (opsional; jika kosong akan dikonversi dari text) */
  latex?: string;
  /** Teks persamaan standar yang menjadi sumber/fallback */
  text: string;
  displayMode?: boolean;
  className?: string;
}

export function convertFormulaToLatex(raw: string): string {
  let out = raw.trim();
  if (!out) return '';

  // Hapus pembungkus $...$ jika ada
  if (out.startsWith('$$') && out.endsWith('$$')) {
    out = out.slice(2, -2).trim();
  } else if (out.startsWith('$') && out.endsWith('$')) {
    out = out.slice(1, -1).trim();
  }

  out = out
    .replace(/·/g, ' \\cdot ')
    .replace(/×/g, '\\times ')
    .replace(/−/g, '-')
    .replace(/→/g, '\\rightarrow ')
    .replace(/°/g, '^{\\circ}')
    .replace(/√(\d+)/g, '\\sqrt{$1}')
    .replace(/√([a-zA-Z]+)/g, '\\sqrt{$1}')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√/g, '\\sqrt{}')
    .replace(/θ/g, '\\theta ')
    .replace(/μm/g, '\\,\\mu\\text{m}')
    .replace(/μ/g, '\\mu ')
    .replace(/α/g, '\\alpha ')
    .replace(/π/g, '\\pi ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/Ω/g, '\\Omega')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁻¹/g, '^{-1}')
    .replace(/\bm\/s\^2\b/g, '\\text{m/s}^2')
    .replace(/\b(sin|cos|tan)\b/g, '\\$1')
    .replace(/\bR_tot\b/g, 'R_{\\text{tot}}')
    .replace(/\bI_tot\b/g, 'I_{\\text{tot}}')
    .replace(/\bF_net\b/g, 'F_{\\text{net}}')
    .replace(/\bD_asli\b/g, 'D_{\\text{asli}}')
    .replace(/\b([VRIF])_([12])\b/g, '$1_$2')
    .replace(/\s(mm|cm|kg|N|V|A|W)\b/g, '\\,\\text{$1}');

  return out;
}

export function FormulaText({
  latex,
  text,
  displayMode = false,
  className = '',
}: FormulaTextProps) {
  const html = useMemo(() => {
    const expr = latex?.trim() ? latex.trim() : convertFormulaToLatex(text);
    if (!expr) return '';
    return katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  }, [latex, text, displayMode]);

  if (!html) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`katex-formula-wrap inline-block align-middle ${className}`}
      aria-label={text}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
