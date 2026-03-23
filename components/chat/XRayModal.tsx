import React from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';

interface XRayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XRayModal: React.FC<XRayModalProps> = ({ isOpen, onClose }) => {
  const {
    messages,
    settings,
    activeSessionId,
    sessions,
    coreMemories,
    llmPresets,
    activeMode,
  } = useStore();

  // 把你原来那个多余的包裹层去掉了，直接如果没打开就 return null
  if (!isOpen) return null;

  const currentSessionMsgs = messages
    .filter((m) => m.sessionId === activeSessionId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const historyPayload = currentSessionMsgs.slice(-20).map((m) => ({
    role: m.role,
    content: m.text,
  }));

  // 1. 基础变量定义
  const wadePersona = settings.wadePersonality || "(None)";
  const lunaInfo = settings.lunaInfo || "(None)";
  const singleExamples = settings.wadeSingleExamples || "(None)";

  // 2. 动态逻辑
  let dialogueExamples = settings.exampleDialogue || "(None)";
  let systemInstructions = settings.systemInstruction || "";
  let modeSpecificInstructions = "";

  if (activeMode === 'sms') {
    if (settings.smsExampleDialogue) {
      dialogueExamples = settings.smsExampleDialogue + "\n(SMS Mode Override)";
    }
    modeSpecificInstructions = settings.smsInstructions
      ? settings.smsInstructions
      : `[MANDATORY OUTPUT FORMAT]
1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags.
2. After the closing </think> tag, write your SMS response separated by |||.`;

    systemInstructions += `\n\n${modeSpecificInstructions}`;
  } else {
    modeSpecificInstructions = settings.roleplayInstructions
      ? settings.roleplayInstructions
      : `[MANDATORY OUTPUT FORMAT]
1. You MUST start your response with an internal monologue wrapped in <think>...</think> tags.
2. After the closing </think> tag, write your immersive response.`;

    systemInstructions += `\n\n${modeSpecificInstructions}`;
  }

  // 3. 加上人设
  if (settings.wadePersonality) {
    systemInstructions += `\n\n[CHARACTER PERSONA]\n${settings.wadePersonality}`;
  }

  // 4. 计算 Session 和 Memories
  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
  const activeMemories = currentSession?.activeMemoryIds
    ? safeMemories.filter((m) => currentSession.activeMemoryIds!.includes(m.id))
    : safeMemories.filter((m) => m.enabled);

  const spiceContent = currentSession?.customPrompt || "";
  const memoriesContent = JSON.stringify(activeMemories);

  // 5. 计算当前模型
  const effectiveLlmId = currentSession?.customLlmId || settings.activeLlmId;
  const activeLlm = effectiveLlmId ? llmPresets.find((p) => p.id === effectiveLlmId) : null;
  const currentModelName =
    activeLlm?.name || (activeMode === 'roleplay' ? 'Gemini 3 Pro (Default)' : 'Gemini 3 Flash (Default)');
  const currentProvider = activeLlm?.provider || 'Google';

  // 6. Token 估算
  const promptLength =
    JSON.stringify(historyPayload).length +
    systemInstructions.length +
    wadePersona.length +
    lunaInfo.length +
    singleExamples.length +
    dialogueExamples.length +
    memoriesContent.length +
    spiceContent.length;

  const estTokens = Math.round(promptLength / 4);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-wade-bg-base w-[90%] max-w-3xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent">
              <Icons.Bug size={14} />
            </div>
            <div>
              <h3 className="font-bold text-wade-text-main text-sm tracking-tight">Brain X-Ray</h3>
              <p className="text-[10px] text-wade-text-muted uppercase tracking-wider font-medium">Context Inspector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-8">
            {/* Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-accent shadow-[0_2px_10px_-4px_rgba(213,143,153,0.2)] flex flex-col items-center justify-center text-center group transition-colors">
                <div className="text-wade-accent font-bold uppercase text-[9px] tracking-[0.2em] mb-1">Active Brain</div>
                <div className="text-sm font-black text-wade-text-main tracking-tight line-clamp-1 px-1">{currentModelName}</div>
                <div className="text-[9px] text-wade-text-muted/60 mt-1 font-mono uppercase">{currentProvider}</div>
              </div>

              <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-[0_2px_10px_-4px_rgba(213,143,153,0.1)] flex flex-col items-center justify-center text-center group hover:border-wade-accent/30 transition-colors">
                <div className="text-wade-text-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1">Total Context</div>
                <div className="text-2xl font-black text-wade-text-main tracking-tight group-hover:text-wade-accent transition-colors">{estTokens}</div>
                <div className="text-[9px] text-wade-text-muted/60 mt-1 font-medium">Est. Tokens</div>
              </div>

              <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-[0_2px_10px_-4px_rgba(213,143,153,0.1)] flex flex-col items-center justify-center text-center group hover:border-wade-accent/30 transition-colors">
                <div className="text-wade-text-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1">Active Memories</div>
                <div className="text-2xl font-black text-wade-text-main tracking-tight group-hover:text-wade-accent transition-colors">{activeMemories.length}</div>
                <div className="text-[9px] text-wade-text-muted/60 mt-1 font-medium">Injected Items</div>
              </div>

              <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-[0_2px_10px_-4px_rgba(213,143,153,0.1)] flex flex-col items-center justify-center text-center group hover:border-wade-accent/30 transition-colors">
                <div className="text-wade-text-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1">History Limit</div>
                <div className="text-2xl font-black text-wade-text-main tracking-tight group-hover:text-wade-accent transition-colors">{settings.contextLimit || 50}</div>
                <div className="text-[9px] text-wade-text-muted/60 mt-1 font-medium">Messages</div>
              </div>
            </div>

            {/* 1. System Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-1 rounded-full bg-wade-accent"></div>
                <h4 className="font-bold text-wade-text-main text-xs uppercase tracking-widest">
                  System Instructions <span className="text-wade-text-muted font-normal normal-case opacity-50 ml-1">(Jailbreak / Core Rules)</span>
                </h4>
              </div>
              <div className="bg-wade-bg-card p-5 rounded-2xl border border-wade-border shadow-sm">
                <div className="text-[11px] leading-relaxed font-mono text-wade-text-main/80 whitespace-pre-wrap max-h-[150px] overflow-y-auto custom-scrollbar">
                  {systemInstructions}
                </div>
              </div>
            </div>

            {/* 2. Wade's Persona */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-1 rounded-full bg-wade-accent"></div>
                <h4 className="font-bold text-wade-text-main text-xs uppercase tracking-widest">
                  Wade's Persona <span className="text-wade-text-muted font-normal normal-case opacity-50 ml-1">(Character Card)</span>
                </h4>
              </div>
              <div className="bg-wade-bg-card p-5 rounded-2xl border border-wade-border shadow-sm">
                <div className="text-[11px] leading-relaxed font-mono text-wade-text-main/80 whitespace-pre-wrap max-h-[150px] overflow-y-auto custom-scrollbar">
                  {wadePersona}
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="pt-4 border-t border-wade-border">
              <details className="group">
                <summary className="cursor-pointer flex items-center gap-2 text-wade-text-muted hover:text-wade-accent transition-colors select-none">
                  <div className="w-4 h-4 rounded bg-wade-border group-open:bg-wade-accent flex items-center justify-center text-white transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-open:rotate-90 transition-transform">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Raw Payload</span>
                </summary>
                <div className="mt-4 bg-wade-code-bg rounded-xl p-4 overflow-hidden shadow-inner">
                  <pre className="text-[10px] font-mono text-wade-code-text overflow-x-auto custom-scrollbar leading-tight whitespace-pre-wrap">
                    {JSON.stringify(
                      {
                        system_instructions: systemInstructions,
                        wade_persona: wadePersona,
                        luna_info: lunaInfo,
                        single_examples: singleExamples,
                        dialogue_examples: dialogueExamples,
                        memories_sent: activeMemories.map((m) => m.content),
                        history: historyPayload,
                        current_turn_spice: spiceContent || "(None)",
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};