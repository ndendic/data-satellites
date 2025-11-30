/**
 * StarHTML Persist Handler - Datastar AttributePlugin Implementation
 * Handles data-persist attributes for automatic signal persistence to storage
 */

import { attribute } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar@develop/bundles/datastar.js';
import { effect, getPath, mergePatch, beginBatch, endBatch } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar@develop/bundles/datastar.js';
import { createDebounce } from "./throttle.js";

interface PersistConfig {
  storage: Storage;
  storageKey: string;
  signals: string[];
  isWildcard: boolean;
}

const DEFAULT_STORAGE_KEY = "datastar";
const DEFAULT_THROTTLE = 500;

function getStorage(isSession: boolean): Storage | null {
  try {
    const storage = isSession ? sessionStorage : localStorage;
    const testKey = "__test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function parseConfig(key: string | null, value: any, mods: Map<string, any>, el: HTMLElement): PersistConfig | null {
  console.log('[Persist Plugin] parseConfig - key:', key, 'value:', value, 'type:', typeof value);

  const isSession = mods.has("session");
  const storage = getStorage(isSession);
  if (!storage) return null;

  // RC.6: Custom keys come as data-persist:mykey, so the key is in ctx.key
  const storageKey = key ? `${DEFAULT_STORAGE_KEY}-${key}` : DEFAULT_STORAGE_KEY;

  let signals: string[] = [];
  let isWildcard = false;

  // Handle value - it might be evaluated or a raw string
  // If the value looks like it was evaluated (not a simple identifier string), 
  // we need to get the raw attribute value from the element
  let rawValue = value;
  
  // If value is undefined/null or not a string that looks like signal names,
  // try to get the raw attribute value
  if (value === undefined || value === null || (typeof value !== 'string')) {
    // Try to get raw attribute value from element
    rawValue = el.getAttribute('data-persist') || el.getAttribute('data-persist:' + (key || '')) || '';
    console.log('[Persist Plugin] Using raw attribute value:', rawValue);
  }

  // Parse value for signals to persist
  const trimmedValue = typeof rawValue === 'string' ? rawValue.trim() : '';
  console.log('[Persist Plugin] trimmedValue:', trimmedValue);
  
  if (trimmedValue) {
    // If value is provided and not empty, parse it as comma-separated signals
    signals = trimmedValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    // No value (boolean attribute) or empty value means persist all signals
    isWildcard = true;
  }

  console.log('[Persist Plugin] Parsed - signals:', signals, 'isWildcard:', isWildcard);
  return { storage, storageKey, signals, isWildcard };
}

function loadFromStorage(config: PersistConfig): void {
  try {
    const stored = config.storage.getItem(config.storageKey);
    console.log('[Persist Plugin] Loading from storage:', config.storageKey, 'stored:', stored);
    
    if (!stored) {
      console.log('[Persist Plugin] No stored data found');
      return;
    }

    const data = JSON.parse(stored);
    console.log('[Persist Plugin] Parsed data:', data);
    
    if (!data || typeof data !== "object") {
      console.log('[Persist Plugin] Invalid data format');
      return;
    }

    // Delay the merge slightly to ensure Datastar has initialized signals
    setTimeout(() => {
      console.log('[Persist Plugin] Applying stored data:', data);
      beginBatch();
      try {
        if (config.isWildcard) {
          mergePatch(data);
        } else {
          const patch = Object.fromEntries(
            config.signals.filter((signal) => signal in data).map((signal) => [signal, data[signal]])
          );

          console.log('[Persist Plugin] Filtered patch:', patch);
          if (Object.keys(patch).length > 0) {
            mergePatch(patch);
          }
        }
      } finally {
        endBatch();
      }
      console.log('[Persist Plugin] Data applied successfully');
    }, 0);
  } catch (err) {
    console.error('[Persist Plugin] Error loading from storage:', err);
  }
}

function getSignalsFromElement(el: HTMLElement): string[] {
  const signals: string[] = [];

  // Scan all attributes for data-signals:* pattern (RC.6 uses : delimiter)
  for (const attr of el.attributes) {
    if (attr.name.startsWith("data-signals:")) {
      // Extract signal name from attribute name: data-signals:mySignal -> mySignal
      const signalName = attr.name.substring("data-signals:".length);
      if (signalName) {
        signals.push(signalName);
      }
    }
  }

  // Also check for data-signals="{...}" syntax (inline JSON object)
  const signalsAttr = el.getAttribute("data-signals");
  if (signalsAttr) {
    try {
      // Try to parse as JSON-like object to extract keys
      // Match patterns like {key1: value, key2: value}
      const keyMatches = signalsAttr.matchAll(/(\w+)\s*:/g);
      for (const match of keyMatches) {
        if (match[1] && !signals.includes(match[1])) {
          signals.push(match[1]);
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }

  console.log('[Persist Plugin] Detected signals from element:', signals);
  return signals;
}

function saveToStorage(
  config: PersistConfig,
  signalData: Record<string, any>
): void {
  try {
    const stored = config.storage.getItem(config.storageKey);
    const existing = stored ? JSON.parse(stored) : {};
    const merged = { ...existing, ...signalData };

    if (Object.keys(merged).length > 0) {
      config.storage.setItem(config.storageKey, JSON.stringify(merged));
    }
  } catch {
    // Storage quota exceeded or other storage errors
  }
}

attribute({
  name: 'persist',
  requirement: 'optional',
  apply({ el, key, mods, value, error }) {
    console.log('[Persist Plugin] Applying to element:', el, 'key:', key, 'value:', value);
    
    const config = parseConfig(key, value, mods, el);
    if (!config) {
      console.warn('[Persist Plugin] Failed to parse config');
      return;
    }
    
    console.log('[Persist Plugin] Config:', config);

    loadFromStorage(config);

    const throttleMs = mods.has("immediate")
      ? 0
      : Number.parseInt(String(mods.get("throttle") ?? DEFAULT_THROTTLE));

    let cachedSignalData: Record<string, any> = {};

    const persistData = () => {
      if (Object.keys(cachedSignalData).length > 0) {
        saveToStorage(config, cachedSignalData);
      }
    };

    const throttledPersist = throttleMs > 0 ? createDebounce(persistData, throttleMs) : persistData;

    // Single-pass signal tracking with data collection
    const cleanup = effect(() => {
      const signals = config.isWildcard ? getSignalsFromElement(el) : config.signals;
      console.log('[Persist Plugin] Effect running, tracking signals:', signals);

      const data: Record<string, any> = {};

      // Single pass: create dependencies and collect values
      for (const signal of signals) {
        try {
          const value = getPath(signal);
          data[signal] = value;
          console.log('[Persist Plugin] Signal', signal, '=', value);
        } catch (err) {
          console.log('[Persist Plugin] Signal', signal, 'not found');
        }
      }

      cachedSignalData = data;
      throttledPersist();
    });

    return cleanup;
  },
});

console.log('[Persist Plugin] Module loaded');