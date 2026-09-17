// Client-side helper for Gemini API Key management & live connectivity verification

export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('juragan_custom_gemini_key') || '';
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem('juragan_custom_gemini_key', trimmed);
  } else {
    localStorage.removeItem('juragan_custom_gemini_key');
  }
}

export function getAiHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const storedKey = getStoredGeminiKey();
  if (storedKey) {
    headers['x-gemini-api-key'] = storedKey;
  }
  return headers;
}

export interface ConnectionTestResult {
  connected: boolean;
  modelUsed?: string;
  keyPrefix?: string;
  latencyMs?: number;
  message: string;
  reason?: string;
  isAqKey?: boolean;
  status?: number;
  rawError?: string;
}

export async function testGeminiConnection(customKey?: string): Promise<ConnectionTestResult> {
  const keyToTest = customKey !== undefined ? customKey.trim() : getStoredGeminiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (keyToTest) {
    headers['x-gemini-api-key'] = keyToTest;
  }

  try {
    const res = await fetch('/api/ai/test-connection', {
      method: 'POST',
      headers,
      body: JSON.stringify({ apiKey: keyToTest }),
    });

    if (!res.ok) {
      return {
        connected: false,
        status: res.status,
        message: `Server merespons status HTTP ${res.status}.`,
      };
    }

    const data: ConnectionTestResult = await res.json();
    return data;
  } catch (err: any) {
    return {
      connected: false,
      message: 'Gagal menghubungi server proxy: ' + (err?.message || 'Jaringan offline'),
    };
  }
}
