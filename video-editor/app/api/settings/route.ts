import { supabase } from '@/lib/supabase';
import { decryptValue, encryptValue } from '@/lib/encryption';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value, is_encrypted')
      .eq('category', 'api_key');

    if (error) throw error;

    // Decrypt values and format as key-value pairs
    const settings: Record<string, string> = {};
    data?.forEach((setting: any) => {
      settings[setting.key] = setting.is_encrypted 
        ? decryptValue(setting.value || '')
        : setting.value || '';
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    // Encrypt the value
    const encryptedValue = encryptValue(value || '');

    // Upsert the setting
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value: encryptedValue,
        category: 'api_key',
        is_encrypted: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Setting saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Failed to save setting', details: error.message },
      { status: 500 }
    );
  }
}
