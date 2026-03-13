import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { CustomTheme, SavedTheme } from '../../types';
import { HexColorPicker } from "react-colorful";

const Icons = {
  Settings: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Close: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Save: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Trash: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

interface ThemeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string; // If provided, edits the session theme. Otherwise, edits the global theme.
}

const defaultCustomTheme: CustomTheme = {
  accent: '#d58f99',
  accentHover: '#e6a8b1',
  accentLight: '#fff0f3',
  bgBase: '#fdfbfb',
  bgCard: '#ffffff',
  bgApp: '#f9f6f7',
  textMain: '#5a4a42',
  textMuted: '#a38585',
  border: '#f0e6e6',
  borderLight: '#d58f99',
  codeBg: '#f9f6f7',
  codeText: '#5a4a42',
  shadowGlow: '0 4px 12px rgba(213, 143, 153, 0.3)',
  fontFamily: 'Nunito',
  fontSize: 'medium',
  customFontUrl: undefined,
  bubbleLuna: '#fff0f3',
  bubbleWade: '#ffffff',
};

const ColorPicker = ({ label, field, theme, onChange }: { label: string, field: keyof CustomTheme, theme: CustomTheme, onChange: (key: keyof CustomTheme, value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(theme[field] as string);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempColor(theme[field] as string);
  }, [theme, field]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onChange(field, tempColor);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-2 hover:bg-wade-bg-app rounded-lg transition-colors relative">
      <span className="text-xs font-bold text-wade-text-main">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-wade-text-muted font-mono uppercase">{theme[field]}</span>
        <div 
          className="w-8 h-8 rounded cursor-pointer border border-wade-border shadow-sm"
          style={{ backgroundColor: theme[field] as string }}
          onClick={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute top-full right-0 mt-2 z-50 bg-wade-bg-card p-3 rounded-2xl shadow-xl border border-wade-border flex flex-col gap-3 animate-fade-in"
        >
          <HexColorPicker color={tempColor} onChange={setTempColor} />
          <div className="flex justify-between items-center">
            <div className="w-6 h-6 rounded-full border border-wade-border" style={{ backgroundColor: tempColor }} />
            <div className="flex gap-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-[10px] font-bold text-wade-text-muted hover:bg-wade-bg-app rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="px-3 py-1.5 text-[10px] font-bold bg-wade-accent text-white rounded-lg hover:brightness-110 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ThemeStudio: React.FC<ThemeStudioProps> = ({ isOpen, onClose, sessionId }) => {
  const { settings, updateSettings, sessions, updateSession } = useStore();
  
  const [theme, setTheme] = useState<CustomTheme>(defaultCustomTheme);
  const [themeTitle, setThemeTitle] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'chat'>('presets');

  useEffect(() => {
    if (isOpen) {
      if (sessionId) {
        const session = sessions.find(s => s.id === sessionId);
        if (session?.customTheme) {
          setTheme(session.customTheme);
        } else if (settings.customTheme) {
          setTheme(settings.customTheme);
        } else {
          setTheme(defaultCustomTheme);
        }
      } else {
        if (settings.customTheme) {
          setTheme(settings.customTheme);
        } else {
          setTheme(defaultCustomTheme);
        }
      }
    }
  }, [isOpen, sessionId, sessions, settings.customTheme]);

  if (!isOpen) return null;

  const handleChange = (key: keyof CustomTheme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (sessionId) {
      updateSession(sessionId, { customTheme: theme });
    } else {
      updateSettings({ customTheme: theme });
    }
    onClose();
  };

  const handleReset = () => {
    if (sessionId) {
      updateSession(sessionId, { customTheme: undefined });
    } else {
      updateSettings({ customTheme: undefined });
    }
    onClose();
  };

  const handleSavePreset = () => {
    if (!themeTitle.trim()) return;
    const newPreset: SavedTheme = {
      id: Date.now().toString(),
      title: themeTitle.trim(),
      theme: { ...theme }
    };
    updateSettings({
      savedThemes: [...(settings.savedThemes || []), newPreset]
    });
    setThemeTitle('');
  };

  const handleLoadPreset = (preset: SavedTheme) => {
    setTheme(preset.theme);
    setShowPresets(false);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings({
      savedThemes: (settings.savedThemes || []).filter(t => t.id !== id)
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-wade-bg-base w-[90%] max-w-3xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent">
              <Icons.Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-wade-text-main text-sm tracking-tight">
                {sessionId ? 'Chat Theme' : 'Global Theme'}
              </h3>
              <p className="text-[10px] text-wade-text-muted uppercase tracking-wider font-medium">Appearance Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors">
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-wade-border px-4 overflow-x-auto hide-scrollbar shrink-0 bg-wade-bg-base">
          {[
            { id: 'presets', label: 'Presets' },
            { id: 'colors', label: 'Colors' },
            { id: 'typography', label: 'Typography' },
            { id: 'chat', label: 'Chat Bubbles' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-wade-accent text-wade-accent' 
                  : 'border-transparent text-wade-text-muted hover:text-wade-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Presets Section */}
          {activeTab === 'presets' && (
            <div className="space-y-3 bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-wade-text-main">Saved Themes</h3>
              <button 
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs font-bold text-wade-accent hover:text-wade-accent-hover transition-colors px-2 py-1 rounded-md hover:bg-wade-accent-light"
              >
                {showPresets ? 'Hide' : 'Show'} ({(settings.savedThemes || []).length})
              </button>
            </div>
            
            {showPresets && (
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                {(settings.savedThemes || []).length === 0 ? (
                  <p className="text-xs text-wade-text-muted italic text-center py-4">No saved themes yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(settings.savedThemes || []).map(preset => (
                      <div 
                        key={preset.id} 
                        onClick={() => handleLoadPreset(preset)}
                        className="flex items-center justify-between p-3 bg-wade-bg-app rounded-xl border border-wade-border hover:border-wade-accent cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: preset.theme.accent }} />
                          <span className="text-xs font-bold text-wade-text-main">{preset.title}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="text-wade-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-wade-border mt-3">
              <input 
                type="text" 
                value={themeTitle}
                onChange={(e) => setThemeTitle(e.target.value)}
                placeholder="Name your current theme..."
                className="flex-1 bg-wade-bg-app border border-wade-border rounded-xl px-3 py-2 text-sm text-wade-text-main outline-none focus:border-wade-accent transition-colors"
              />
              <button 
                onClick={handleSavePreset}
                disabled={!themeTitle.trim()}
                className="w-10 h-10 flex items-center justify-center bg-wade-accent text-white rounded-xl disabled:opacity-50 hover:bg-wade-accent-hover transition-colors shrink-0 shadow-sm"
                title="Save Theme"
              >
                <Icons.Save className="w-4 h-4" />
              </button>
            </div>
          </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-wade-text-muted uppercase tracking-wider mb-3 px-2">Core Colors</h3>
                <div className="bg-wade-bg-card rounded-2xl border border-wade-border p-2 shadow-sm">
                  <ColorPicker label="Primary Buttons & Highlights" field="accent" theme={theme} onChange={handleChange} />
                  <ColorPicker label="Button Hover State" field="accentHover" theme={theme} onChange={handleChange} />
                  <ColorPicker label="Subtle Highlights / Selected Items" field="accentLight" theme={theme} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-wade-text-muted uppercase tracking-wider mb-3 px-2">Backgrounds</h3>
                <div className="bg-wade-bg-card rounded-2xl border border-wade-border p-2 shadow-sm">
                  <ColorPicker label="Main App Background" field="bgBase" theme={theme} onChange={handleChange} />
                  <ColorPicker label="Card & Modal Background" field="bgCard" theme={theme} onChange={handleChange} />
                  <ColorPicker label="Secondary Background (Sidebars)" field="bgApp" theme={theme} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-wade-text-muted uppercase tracking-wider mb-3 px-2">Typography & Text</h3>
                <div className="bg-wade-bg-card rounded-2xl border border-wade-border p-2 shadow-sm">
                  <ColorPicker label="Primary Text Color" field="textMain" theme={theme} onChange={handleChange} />
                  <ColorPicker label="Secondary / Muted Text" field="textMuted" theme={theme} onChange={handleChange} />
                  
                  <div className="p-3 mt-2 border-t border-wade-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-wade-text-main">Font Family (Google Fonts supported)</span>
                      <label className="text-[10px] text-wade-accent cursor-pointer hover:underline">
                        Upload Font
                        <input 
                          type="file" 
                          accept=".ttf,.otf,.woff,.woff2" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                const fontName = file.name.split('.')[0];
                                handleChange('customFontUrl', base64);
                                handleChange('fontFamily', fontName);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input 
                      type="text"
                      list="font-family-options"
                      value={theme.fontFamily}
                      onChange={(e) => {
                        handleChange('fontFamily', e.target.value);
                        if (theme.customFontUrl) {
                          handleChange('customFontUrl', '');
                        }
                      }}
                      placeholder="e.g., Roboto, Open Sans..."
                      className="w-full bg-wade-bg-app border border-wade-border rounded-xl p-2.5 text-sm text-wade-text-main outline-none focus:border-wade-accent transition-colors"
                    />
                    <datalist id="font-family-options">
                      <option value="Nunito">Nunito (Default)</option>
                      <option value="Inter">Inter (Modern)</option>
                      <option value="Comic Sans MS">Comic Sans (Wade)</option>
                      <option value="Courier New">Courier (Hacker)</option>
                      <option value="Georgia">Georgia (Classic)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Playfair Display">Playfair Display</option>
                    </datalist>
                  </div>

                  <div className="p-3">
                    <span className="text-xs font-bold text-wade-text-main block mb-2">Font Size</span>
                    <select 
                      value={theme.fontSize}
                      onChange={(e) => handleChange('fontSize', e.target.value)}
                      className="w-full bg-wade-bg-app border border-wade-border rounded-xl p-2.5 text-sm text-wade-text-main outline-none focus:border-wade-accent transition-colors"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-wade-text-muted uppercase tracking-wider mb-3 px-2">Chat Bubbles</h3>
                <div className="bg-wade-bg-card rounded-2xl border border-wade-border p-2 shadow-sm">
                  <ColorPicker label="Luna's Chat Bubble" field="bubbleLuna" theme={theme} onChange={handleChange} />
                  <ColorPicker label="Wade's Chat Bubble" field="bubbleWade" theme={theme} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="px-6 py-4 border-t border-wade-border bg-wade-bg-card/50 backdrop-blur-md flex gap-3 justify-end">
          <button 
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-xs font-medium text-wade-text-muted hover:bg-wade-border transition-colors"
          >
            Reset to Default
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-xs font-medium bg-wade-accent text-white hover:bg-wade-accent-hover transition-colors shadow-sm"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
