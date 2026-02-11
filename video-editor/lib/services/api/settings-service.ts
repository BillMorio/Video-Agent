import { supabase } from '@/lib/supabase';
import { decryptValue } from '@/lib/encryption';

export interface AppSetting {
  key: string;
  value: string;
  category: string;
  is_encrypted: boolean;
}

class SettingsService {
  /**
   * Fetch all settings and return them as a decrypted key-value map
   */
  async getAllSettings(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;

      const settings: Record<string, string> = {};
      data?.forEach((setting: AppSetting) => {
        settings[setting.key] = setting.is_encrypted 
          ? decryptValue(setting.value || '')
          : setting.value || '';
      });

      return settings;
    } catch (error) {
      console.error('[SettingsService] Failed to fetch settings:', error);
      return {};
    }
  }

  /**
   * Fetch a specific setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data.is_encrypted 
        ? decryptValue(data.value || '')
        : data.value || '';
    } catch (error) {
      console.error(`[SettingsService] Failed to fetch setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Helper to get the light-leak overlay URL
   */
  async getLightLeakOverlayUrl(): Promise<string | null> {
    return this.getSetting('asset_lightleak_overlay');
  }

  /**
   * Helper to get a specific system prompt
   */
  async getSystemPrompt(promptKey: string): Promise<string | null> {
    return this.getSetting(promptKey);
  }
}

export const settingsService = new SettingsService();
