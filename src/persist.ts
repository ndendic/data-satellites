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

const DEFAULT_STORAGE_KEY = "satellite-persist";
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

function parseConfig(key: string | null, value: string | null, mods: Map<string, any>): PersistConfig | null {

  const isSession = mods.has("session");
  const storage = getStorage(isSession);
  if (!storage) return null;

  // v1.0.0-RC.3+: Custom keys come as data-persist-mykey, so the key is in ctx.key
  const storageKey = key ? `${DEFAULT_STORAGE_KEY}-${key}` : DEFAULT_STORAGE_KEY;

  let signals: string[] = [];
  let isWildcard = false;

  // Parse value for signals to persist
  const trimmedValue = value?.trim();
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

  return { storage, storageKey, signals, isWildcard };
}

function loadFromStorage(config: PersistConfig): void {
  try {
    const stored = config.storage.getItem(config.storageKey);
    if (!stored) return;

    const data = JSON.parse(stored);
    if (!data || typeof data !== "object") return;

    beginBatch();
    try {
      if (config.isWildcard) {
        mergePatch(data);
      } else {
        const patch = Object.fromEntries(
          config.signals.filter((signal) => signal in data).map((signal) => [signal, data[signal]])
        );

        if (Object.keys(patch).length > 0) {
          mergePatch(patch);
        }
      }
    } finally {
      endBatch();
    }
  } catch {
    // Storage errors are expected in some environments
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
    const config = parseConfig(key, value, mods);
    if (!config) return;

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

      const data: Record<string, any> = {};

      // Single pass: create dependencies and collect values
      for (const signal of signals) {
        try {
          data[signal] = getPath(signal);
        } catch {
          // Signal doesn't exist, skip it
        }
      }

      cachedSignalData = data;
      throttledPersist();
    });

    return cleanup;
  },
});