import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsSchema, type Settings } from '@shared/schema';
import { getDisplayVoiceNames } from '@shared/voice-mapping';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'voice-translator-settings';

// Migrate old Gemini voice names to ElevenLabs voice names
const migrateVoiceName = (oldVoice: string): string => {
  const validVoices = getDisplayVoiceNames();
  if (validVoices.includes(oldVoice)) {
    return oldVoice;
  }
  // Default to Rachel if the old voice is not valid
  return 'Rachel';
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      const clonedVoice = localStorage.getItem('clonedVoice');
      
      let clonedVoiceId: string | undefined;
      let clonedVoiceName: string | undefined;
      
      if (clonedVoice) {
        try {
          const parsed = JSON.parse(clonedVoice);
          clonedVoiceId = parsed.id;
          clonedVoiceName = parsed.name;
        } catch {
          // Ignore parsing errors
        }
      }
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old voice names to new ElevenLabs voices
        if (parsed.voice) {
          parsed.voice = migrateVoiceName(parsed.voice);
        }
        // Merge stored settings with new defaults to ensure new fields get their defaults
        const defaults = settingsSchema.parse({});
        const mergedSettings = { 
          ...defaults, 
          ...parsed,
          // Force new default values for these specific settings
          autoplay: true,
          autoDetectLanguage: true,
          // Include cloned voice from localStorage
          clonedVoiceId: clonedVoiceId || parsed.clonedVoiceId,
          clonedVoiceName: clonedVoiceName || parsed.clonedVoiceName,
        };
        return settingsSchema.parse(mergedSettings);
      }
      
      // No stored settings, return defaults with cloned voice if available
      return settingsSchema.parse({
        clonedVoiceId,
        clonedVoiceName,
      });
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return settingsSchema.parse({});
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Settings) => {
    console.log('=== SETTINGS UPDATE ===');
    console.log('Current settings:', settings);
    console.log('New settings:', newSettings);
    console.log('autoDetectLanguage changed from', settings.autoDetectLanguage, 'to', newSettings.autoDetectLanguage);
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}