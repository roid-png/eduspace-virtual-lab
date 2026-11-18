import { Bot, CheckCircle2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  ChatMessage,
  ComputedModuleResult,
  ModuleDefinition,
} from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';
import { RichMathMessage } from '../ui/RichMathMessage';
import { TactileCard } from '../ui/TactileCard';

interface CopilotChatPanelProps {
  mod: ModuleDefinition;
  computedResult: ComputedModuleResult;
  chatMessages: ChatMessage[];
  isCopilotLoading: boolean;
  hasGeminiKey: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
  isAnatomy?: boolean;
  quickActionsOverride?: string[];
  placeholder?: string;
  className?: string;
}

export function CopilotChatPanel({
  mod,
  computedResult,
  chatMessages,
  isCopilotLoading,
  hasGeminiKey,
  onSendMessage,
  isAnatomy = false,
  quickActionsOverride,
  placeholder,
  className = 'min-h-[420px] w-full lg:min-h-[560px] lg:w-[55%]',
}: CopilotChatPanelProps) {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isCopilotLoading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await onSendMessage(trimmed);
  };

  const resolvedPlaceholder =
    placeholder ??
    (isAnatomy
      ? 'Tanya tentang ruang jantung, katup, bronkus, alveolus, atau gangguan kardiorespirasi...'
      : 'Tanya Asisten Cerdas mengenai konsep, grafik, atau turunan rumus...');

  return (
    <TactileCard
      variant="raised"
      className={`flex flex-col justify-between rounded-3xl p-4 sm:p-5 lg:p-6 ${className}`}
    >
      {/* Header Asisten Cerdas + Context Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="tactile-inset flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0E5A63]">
            <Bot className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-[#23272A] sm:text-base">
              Asisten Cerdas Laboratorium
            </h2>
            <span className="tactile-inset inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-code text-[11px] font-medium text-[#0E5A63]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E5A63]" />
              {hasGeminiKey ? 'Gemini Flash' : 'Mode Lokal'}
            </span>
          </div>
        </div>

        <div className="tactile-inset max-w-full truncate rounded-full px-3 py-1 font-code text-[11px] font-medium text-[#5C6064]">
          Membaca: {computedResult.summaryInputText}
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex max-h-[420px] flex-1 flex-col gap-4 overflow-y-auto py-3 pr-1"
      >
        {chatMessages.map((msg) => {
          const isStudent = msg.role === 'student';
          if (isStudent) {
            return (
              <div
                key={msg.id}
                className="flex max-w-[85%] flex-col items-end gap-1 self-end"
              >
                <div className="rounded-2xl rounded-br-sm bg-[#0E5A63] px-4 py-3 text-sm leading-relaxed text-white shadow-[4px_4px_10px_rgba(14,90,99,0.2)]">
                  {msg.text}
                </div>
                <span className="px-1 font-code text-[11px] text-[#5C6064]">
                  {msg.timestamp} • Siswa
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="flex max-w-[92%] flex-col items-start gap-1.5 self-start"
            >
              <div className="tactile-inset flex w-full flex-col gap-3 rounded-2xl rounded-bl-sm p-4 text-sm leading-relaxed text-[#23272A]">
                <RichMathMessage text={msg.text} />
                {msg.formulaChip ? (
                  <div className="tactile-raised w-fit rounded-xl px-3 py-1.5 font-code text-xs font-semibold text-[#0E5A63]">
                    {isAnatomy ? (
                      msg.formulaChip
                    ) : (
                      <FormulaText text={msg.formulaChip} />
                    )}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-1 px-1 text-[#5C6064]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0E5A63]" strokeWidth={2} />
                <span className="font-code text-[11px]">
                  {msg.timestamp} · {msg.verifiedLabel ?? 'Terverifikasi Kurikulum Merdeka'}
                </span>
              </div>
            </div>
          );
        })}

        {isCopilotLoading ? (
          <div className="tactile-inset w-fit rounded-2xl px-4 py-2.5 font-code text-xs text-[#5C6064]">
            Asisten Cerdas sedang menganalisis parameter...
          </div>
        ) : null}
      </div>

      {/* Quick-Action Pills + Input Bar */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {(quickActionsOverride ?? mod.quickActions).map((qa) => (
            <button
              key={qa}
              type="button"
              disabled={isCopilotLoading}
              onClick={() => onSendMessage(qa)}
              className="tactile-inset cursor-pointer rounded-full px-3.5 py-1.5 text-left text-xs font-medium text-[#23272A] transition-colors hover:text-[#0E5A63]"
            >
              {qa}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="tactile-inset flex flex-1 items-center rounded-full px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={resolvedPlaceholder}
              className="w-full border-0 bg-transparent text-base text-[#23272A] placeholder:text-[#5C6064] focus:outline-none sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isCopilotLoading}
            className="tactile-pill-cta flex min-h-[42px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold sm:px-5 sm:text-sm"
          >
            <span>Kirim</span>
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </TactileCard>
  );
}
