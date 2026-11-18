import katex from 'katex';
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { convertFormulaToLatex } from './FormulaText';

interface RichMathMessageProps {
  text: string;
}

function renderKatexHtml(expr: string, displayMode: boolean): string {
  return katex.renderToString(expr.trim(), {
    displayMode,
    throwOnError: false,
    strict: false,
  });
}

function renderInlineTokens(line: string, keyPrefix: string): ReactNode[] {
  // Tangkap inline math ($...$ atau \(...\)), bold (**...**), inline code (`...`), atau italic (*...*)
  const tokenRegex =
    /(\\\((?:\\.|[^)])+?\\\)|\$(?:\\.|[^$\n])+?\$|\*\*[^*\n]+?\*\*|`[^`\n]+?`|\*[^*\n]+?\*)/g;

  const nodes: ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(line.slice(lastIdx, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${idx++}`;

    if (token.startsWith('$') && token.endsWith('$')) {
      const math = token.slice(1, -1);
      nodes.push(
        <span
          key={key}
          className="inline-block align-baseline px-0.5 text-[#0E5A63]"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, false) }}
        />,
      );
    } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
      const math = token.slice(2, -2);
      nodes.push(
        <span
          key={key}
          className="inline-block align-baseline px-0.5 text-[#0E5A63]"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, false) }}
        />,
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-[#23272A]">
          {renderInlineTokens(token.slice(2, -2), `${key}-b`)}
        </strong>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeContent = token.slice(1, -1);
      const looksLikeFormula =
        /[=√θμαπΔΩ₁₂²³]|\\(frac|sqrt|theta|sin|cos|alpha|cdot)/.test(codeContent);
      if (looksLikeFormula) {
        nodes.push(
          <span
            key={key}
            className="inline-block rounded-md bg-[#F6F3EC] px-1.5 py-0.5 align-baseline text-[#0E5A63]"
            dangerouslySetInnerHTML={{
              __html: renderKatexHtml(convertFormulaToLatex(codeContent), false),
            }}
          />,
        );
      } else {
        nodes.push(
          <code
            key={key}
            className="font-code rounded-md bg-[#F6F3EC] px-1.5 py-0.5 text-[12px] font-medium text-[#0E5A63]"
          >
            {codeContent}
          </code>,
        );
      }
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      nodes.push(token);
    }

    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < line.length) {
    nodes.push(line.slice(lastIdx));
  }

  return nodes;
}

export function RichMathMessage({ text }: RichMathMessageProps) {
  // Pisahkan blok display math $$...$$ atau \[...\] terlebih dahulu
  const displayRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
  const segments = text.split(displayRegex);

  return (
    <div className="flex flex-col gap-2.5 text-sm leading-relaxed text-[#23272A]">
      {segments.map((seg, segIdx) => {
        if (!seg) return null;

        if (
          (seg.startsWith('$$') && seg.endsWith('$$')) ||
          (seg.startsWith('\\[') && seg.endsWith('\\]'))
        ) {
          const expr = seg.slice(2, -2);
          return (
            <div
              key={`disp-${segIdx}`}
              className="tactile-raised overflow-x-auto rounded-xl px-3.5 py-2"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(expr, true) }}
            />
          );
        }

        // Proses paragraf & daftar bernomor/bullet
        const blocks = seg.trim().split(/\n{2,}/);
        return (
          <Fragment key={`blk-grp-${segIdx}`}>
            {blocks.map((block, blkIdx) => {
              const lines = block
                .split('\n')
                .map((l) => l.trimEnd())
                .filter((l) => l.trim().length > 0);
              if (lines.length === 0) return null;

              const isOrdered = lines.every((l) => /^\d+[.)]\s+/.test(l.trim()));
              const isBullet = lines.every((l) => /^[-*•]\s+/.test(l.trim()));

              if (isOrdered) {
                return (
                  <ol
                    key={`ol-${segIdx}-${blkIdx}`}
                    className="flex list-decimal flex-col gap-1.5 pl-5"
                  >
                    {lines.map((line, liIdx) => {
                      const content = line.trim().replace(/^\d+[.)]\s+/, '');
                      return (
                        <li key={`li-${liIdx}`} className="pl-0.5">
                          {renderInlineTokens(content, `ol-${segIdx}-${blkIdx}-${liIdx}`)}
                        </li>
                      );
                    })}
                  </ol>
                );
              }

              if (isBullet) {
                return (
                  <ul
                    key={`ul-${segIdx}-${blkIdx}`}
                    className="flex list-disc flex-col gap-1.5 pl-5"
                  >
                    {lines.map((line, liIdx) => {
                      const content = line.trim().replace(/^[-*•]\s+/, '');
                      return (
                        <li key={`li-${liIdx}`} className="pl-0.5">
                          {renderInlineTokens(content, `ul-${segIdx}-${blkIdx}-${liIdx}`)}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Campuran baris teks + list di satu blok
              return (
                <div key={`p-${segIdx}-${blkIdx}`} className="flex flex-col gap-1.5">
                  {lines.map((line, lIdx) => {
                    const ordMatch = line.trim().match(/^(\d+[.)])\s+(.*)$/);
                    if (ordMatch) {
                      return (
                        <div key={`mix-${lIdx}`} className="flex items-start gap-2 pl-1">
                          <span className="font-code mt-0.5 text-xs font-semibold text-[#0E5A63]">
                            {ordMatch[1]}
                          </span>
                          <span>
                            {renderInlineTokens(
                              ordMatch[2],
                              `mix-${segIdx}-${blkIdx}-${lIdx}`,
                            )}
                          </span>
                        </div>
                      );
                    }
                    const bulMatch = line.trim().match(/^[-*•]\s+(.*)$/);
                    if (bulMatch) {
                      return (
                        <div key={`mix-${lIdx}`} className="flex items-start gap-2 pl-1">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E5A63]" />
                          <span>
                            {renderInlineTokens(
                              bulMatch[1],
                              `mix-${segIdx}-${blkIdx}-${lIdx}`,
                            )}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <p key={`mix-${lIdx}`}>
                        {renderInlineTokens(line, `p-${segIdx}-${blkIdx}-${lIdx}`)}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
