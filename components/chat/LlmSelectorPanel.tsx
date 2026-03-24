/**
 * LlmSelectorPanel.tsx — Brain Transplant / Neural Net Selector v4
 * 
 * 全屏毛玻璃模态框，卡片网格布局。
 * 手机端自适应：滑块一行一个，桌面端一行两个。
 * 滑块风格参考 Settings 页面（label + 数值显示框）。
 */

import React, { useState } from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';

const PROVIDERS = [
  { value: 'Gemini', label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-3-pro-preview' },
  { value: 'Claude', label: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-3-5-sonnet-20241022' },
  { value: 'OpenAI', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { value: 'DeepSeek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  { value: 'OpenRouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: '' },
  { value: 'Custom', label: 'Custom', baseUrl: '', defaultModel: '' }
];

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'Gemini': return <Icons.Sparkle />;
    case 'Claude': return <Icons.Face />;
    case 'OpenAI': return <Icons.Hexagon />;
    case 'DeepSeek': return <Icons.Eye />;
    case 'OpenRouter': return <Icons.Infinity />;
    default: return <Icons.Cube />;
  }
};

const DEFAULT_FORM = {
  provider: 'Custom', name: '', model: '', apiKey: '', baseUrl: '',
  temperature: 1.0, topP: 0.95, topK: 40,
  frequencyPenalty: 0, presencePenalty: 0,
  isVision: false, isImageGen: false
};

// --- 高级参数编辑区（Settings风格，手机自适应） ---
const AdvancedParamsForm = ({
  values,
  onChange
}: {
  values: typeof DEFAULT_FORM;
  onChange: (key: string, value: any) => void;
}) => {
  // 滑块配置：统一管理
  const sliders = [
    { key: 'temperature', label: 'Temperature', min: 0, max: 2, step: 0.01, decimals: 2 },
    { key: 'topP', label: 'Top P', min: 0, max: 1, step: 0.01, decimals: 2 },
    { key: 'frequencyPenalty', label: 'Frequency Penalty', min: -2, max: 2, step: 0.01, decimals: 2 },
    { key: 'presencePenalty', label: 'Presence Penalty', min: -2, max: 2, step: 0.01, decimals: 2 },
  ];

  return (
    <div className="space-y-5 mt-2 p-5 bg-wade-bg-app rounded-xl border border-wade-border/60">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-wade-accent"></div>
        <span className="text-[10px] font-bold text-wade-text-muted/60 uppercase tracking-widest">Advanced Tuning</span>
      </div>

      {/* 滑块列表：手机一行一个，桌面一行两个 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sliders.map((field) => (
          <div key={field.key}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-wade-text-muted uppercase tracking-wider">{field.label}</span>
              <span className="text-[11px] text-wade-text-main bg-wade-bg-card px-2 py-0.5 rounded border border-wade-border">
                {(values[field.key as keyof typeof values] as number).toFixed(field.decimals)}
              </span>
            </div>
            <input
              type="range"
              min={field.min} max={field.max} step={field.step}
              value={values[field.key as keyof typeof values] as number}
              onChange={e => onChange(field.key, parseFloat(e.target.value))}
              className="w-full accent-[var(--wade-accent)] h-1.5 bg-wade-border rounded-lg cursor-pointer appearance-none hover:accent-[var(--wade-accent-hover)] transition-all"
            />
          </div>
        ))}
      </div>

      {/* Top K：数字输入框 */}
      <div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-wade-text-muted uppercase tracking-wider">Top K</span>
          <input
            type="number"
            value={values.topK}
            onChange={e => onChange('topK', parseInt(e.target.value) || 0)}
            className="w-20 text-[11px] text-wade-text-main bg-wade-bg-card border border-wade-border rounded px-2 py-1 text-right outline-none focus:border-wade-accent transition-colors"
          />
        </div>
      </div>

      {/* Vision + ImageGen 开关 */}
      <div className="flex gap-4 bg-wade-bg-card p-3 rounded-lg border border-wade-border">
        <label className="flex items-center cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={values.isVision}
            onChange={e => onChange('isVision', e.target.checked)}
            className="w-8 h-3 rounded border-wade-accent text-wade-accent focus:ring-wade-accent focus:ring-offset-0"
          />
          <span className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">Vision</span>
        </label>
        <label className="flex items-center cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={values.isImageGen}
            onChange={e => onChange('isImageGen', e.target.checked)}
            className="w-8 h-3 rounded border-wade-accent text-wade-accent focus:ring-wade-accent focus:ring-offset-0"
          />
          <span className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">Image Gen</span>
        </label>
      </div>
    </div>
  );
};

// ==========================================
// 主组件
// ==========================================

interface LlmSelectorPanelProps {
  onClose: () => void;
}

export const LlmSelectorPanel: React.FC<LlmSelectorPanelProps> = ({ onClose }) => {
  const {
    llmPresets, addLlmPreset, updateLlmPreset, updateSettings, updateSession,
    activeSessionId, settings, sessions
  } = useStore();

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);

  const updateForm = (key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectPreset = async (presetId: string) => {
    if (activeSessionId) {
      await updateSession(activeSessionId, { customLlmId: presetId });
    } else {
      await updateSettings({ activeLlmId: presetId });
    }
  };

  const handleStartEdit = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = llmPresets.find(p => p.id === presetId);
    if (!preset) return;
    setFormValues({
      provider: preset.provider || 'Custom',
      name: preset.name,
      model: preset.model,
      apiKey: preset.apiKey,
      baseUrl: preset.baseUrl,
      temperature: preset.temperature ?? 1.0,
      topP: preset.topP ?? 0.95,
      topK: preset.topK ?? 40,
      frequencyPenalty: preset.frequencyPenalty ?? 0,
      presencePenalty: preset.presencePenalty ?? 0,
      isVision: preset.isVision ?? false,
      isImageGen: preset.isImageGen ?? false
    });
    setEditingPresetId(presetId);
    setMode('edit');
  };

  const handleSaveEdit = async () => {
    if (!editingPresetId) return;
    await updateLlmPreset(editingPresetId, {
      provider: formValues.provider,
      name: formValues.name,
      model: formValues.model,
      apiKey: formValues.apiKey,
      baseUrl: formValues.baseUrl.replace(/\/$/, ''),
      temperature: formValues.temperature,
      topP: formValues.topP,
      topK: formValues.topK,
      frequencyPenalty: formValues.frequencyPenalty,
      presencePenalty: formValues.presencePenalty,
      isVision: formValues.isVision,
      isImageGen: formValues.isImageGen
    });
    setMode('list');
    setEditingPresetId(null);
  };

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDERS.find(p => p.value === provider);
    if (preset) {
      setFormValues(prev => ({
        ...prev, provider,
        baseUrl: preset.baseUrl,
        model: preset.defaultModel,
        name: prev.name || preset.label
      }));
    }
  };

  const handleStartAdd = () => {
    setFormValues(DEFAULT_FORM);
    setMode('add');
  };

  const handleSaveNew = async () => {
    if (!formValues.name || !formValues.apiKey) {
      return alert("Name and API Key are required!");
    }
    await addLlmPreset({
      provider: formValues.provider,
      name: formValues.name,
      model: formValues.model,
      apiKey: formValues.apiKey,
      baseUrl: formValues.baseUrl.replace(/\/$/, ''),
      apiPath: '',
      temperature: formValues.temperature,
      topP: formValues.topP,
      topK: formValues.topK,
      frequencyPenalty: formValues.frequencyPenalty,
      presencePenalty: formValues.presencePenalty,
      isVision: formValues.isVision,
      isImageGen: formValues.isImageGen
    });
    setMode('list');
    setFormValues(DEFAULT_FORM);
  };

  // ==========================================
  // 列表模式
  // ==========================================
  const renderList = () => (
    <>
      <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent">
            <Icons.Hexagon size={14} />
          </div>
          <div>
            <h3 className="font-bold text-wade-text-main text-sm tracking-tight">Neural Net Selector</h3>
            <p className="text-[10px] text-wade-text-muted uppercase tracking-wider font-medium">Pick my brain. Literally.</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors">
          <Icons.Close size={16} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar bg-wade-bg-base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {llmPresets.length === 0 ? (
            <div className="col-span-full text-center py-10 text-wade-text-muted opacity-60 italic text-xs">
              No neural nets found. Configure presets in Settings first.
            </div>
          ) : (
            llmPresets.map((preset) => {
              const currentSession = sessions.find(s => s.id === activeSessionId);
              const isActive = currentSession?.customLlmId === preset.id || (!currentSession?.customLlmId && settings.activeLlmId === preset.id);

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`relative group p-4 rounded-2xl border text-left transition-all duration-300 ease-out flex flex-col gap-3
                    ${isActive
                      ? 'bg-wade-bg-card border-wade-accent shadow-md scale-[1.02]'
                      : 'bg-wade-bg-card border-wade-border hover:border-wade-accent/50 hover:shadow-sm'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-wade-accent rounded-full animate-pulse shadow-[0_0_8px_var(--wade-accent)]" />
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors
                      ${isActive ? 'bg-wade-accent-light text-wade-accent' : 'bg-wade-bg-app text-wade-text-muted group-hover:text-wade-accent group-hover:bg-wade-accent-light'}
                    `}>
                      {getProviderIcon(preset.provider)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-bold text-sm truncate ${isActive ? 'text-wade-text-main' : 'text-wade-text-main/80'}`}>
                          {preset.name}
                        </h4>
                        <div
                          onClick={(e) => handleStartEdit(preset.id, e)}
                          className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-wade-accent hover:text-white text-wade-text-muted transition-all cursor-pointer shrink-0"
                        >
                          <Icons.Edit size={10} />
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-wade-accent' : 'text-wade-text-muted/60'}`}>
                        {preset.provider || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs truncate w-full ${isActive ? 'text-wade-text-muted' : 'text-wade-text-muted/60'}`}>
                    {preset.model}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wade-bg-app text-wade-text-muted">
                      T:{preset.temperature?.toFixed(1) ?? '1.0'}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wade-bg-app text-wade-text-muted">
                      P:{preset.topP?.toFixed(1) ?? '0.95'}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wade-bg-app text-wade-text-muted">
                      K:{preset.topK ?? 40}
                    </span>
                    {preset.isVision && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wade-accent-light text-wade-accent font-bold">👁 Vision</span>
                    )}
                    {preset.isImageGen && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wade-accent-light text-wade-accent font-bold">🎨 ImgGen</span>
                    )}
                  </div>

                  <div className={`absolute bottom-2 right-3 text-[8px] uppercase opacity-20 ${isActive ? 'text-wade-accent' : 'text-wade-text-muted'}`}>
                    ID: {preset.id.slice(0, 8)}
                  </div>
                </button>
              );
            })
          )}

          <button
            onClick={handleStartAdd}
            className="p-4 rounded-2xl border border-dashed border-wade-border hover:border-wade-accent/60 hover:bg-wade-accent-light/30 transition-all flex flex-col items-center justify-center gap-2 text-wade-text-muted hover:text-wade-accent min-h-[100px] group"
          >
            <div className="p-2 rounded-full bg-wade-bg-app group-hover:bg-wade-accent group-hover:text-white transition-colors">
              <Icons.Plus size={16} />
            </div>
            <span className="text-xs font-bold">Configure Nets</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-wade-border bg-wade-bg-app text-center">
        <p className="text-[10px] text-wade-text-muted/60 uppercase tracking-wider">
          Wade Wilson OS v2.0 // System Core
        </p>
      </div>
    </>
  );

  // ==========================================
  // 新增 / 编辑表单
  // ==========================================
  const renderForm = () => {
    const isEdit = mode === 'edit';
    return (
      <>
        <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent">
              {isEdit ? <Icons.Edit size={14} /> : <Icons.Plus size={14} />}
            </div>
            <div>
              <h3 className="font-bold text-wade-text-main text-sm tracking-tight">
                {isEdit ? 'Edit Neural Net' : 'New Neural Net'}
              </h3>
              <p className="text-[10px] text-wade-text-muted uppercase tracking-wider font-medium">
                {isEdit ? 'Fine-tune the brain.' : 'Fresh brain, who dis?'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setMode('list'); setEditingPresetId(null); }}
            className="text-wade-text-muted text-xs font-bold hover:text-wade-accent transition-colors"
          >
            Back
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-wade-bg-base">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider (新增时显示，占满一行) */}
            {!isEdit && (
              <select
                className="col-span-1 md:col-span-2 bg-wade-bg-card border border-wade-border rounded-2xl px-4 py-3 text-sm text-wade-text-main focus:border-wade-accent focus:outline-none focus:ring-1 focus:ring-wade-accent/20 h-10"
                value={formValues.provider}
                onChange={e => handleProviderChange(e.target.value)}
              >
                {PROVIDERS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            )}

            {/* Name */}
            <input
              value={formValues.name}
              onChange={e => updateForm('name', e.target.value)}
              placeholder="Name"
              className="bg-wade-bg-card border border-wade-border rounded-2xl px-4 py-3 text-sm text-wade-text-main focus:border-wade-accent focus:outline-none focus:ring-1 focus:ring-wade-accent/20 h-10"
            />

            {/* Model */}
            <input
              value={formValues.model}
              onChange={e => updateForm('model', e.target.value)}
              placeholder={formValues.provider === 'OpenRouter' ? 'Model (e.g. google/gemini-flash-1.5)' : 'Model (e.g. gemini-3-flash)'}
              className="bg-wade-bg-card border border-wade-border rounded-2xl px-4 py-3 text-sm text-wade-text-main focus:border-wade-accent focus:outline-none focus:ring-1 focus:ring-wade-accent/20 h-10"
            />

            {/* API Key (占满一行) */}
            <input
              value={formValues.apiKey}
              onChange={e => updateForm('apiKey', e.target.value)}
              placeholder="API Key"
              type="password"
              className="col-span-1 md:col-span-2 bg-wade-bg-card border border-wade-border rounded-2xl px-4 py-3 text-sm text-wade-text-main focus:border-wade-accent focus:outline-none focus:ring-1 focus:ring-wade-accent/20 h-10"
            />

            {/* Base URL (占满一行) */}
            <input
              value={formValues.baseUrl}
              onChange={e => updateForm('baseUrl', e.target.value)}
              placeholder="Base URL (Optional)"
              className="col-span-1 md:col-span-2 bg-wade-bg-card border border-wade-border rounded-2xl px-4 py-3 text-sm text-wade-text-main focus:border-wade-accent focus:outline-none focus:ring-1 focus:ring-wade-accent/20 h-10"
            />

            {/* 高级参数 (占满一行) */}
            <div className="col-span-1 md:col-span-2">
              <AdvancedParamsForm values={formValues} onChange={updateForm} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-wade-border bg-wade-bg-app">
          <button
            onClick={() => { setMode('list'); setEditingPresetId(null); }}
            className="text-xs font-bold text-wade-text-muted hover:text-wade-text-main px-4 py-2 transition-colors rounded-lg hover:bg-wade-bg-card"
          >
            Cancel
          </button>
          <button
            onClick={isEdit ? handleSaveEdit : handleSaveNew}
            className="bg-wade-accent text-white text-xs font-bold px-6 py-2 rounded-full hover:bg-wade-accent-hover shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            {isEdit ? 'Save' : 'Install Brain'}
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-wade-bg-base w-[90%] max-w-3xl max-h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border"
        onClick={e => e.stopPropagation()}
      >
        {mode === 'list' ? renderList() : renderForm()}
      </div>
    </div>
  );
};