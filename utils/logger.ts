import { ItemData, ConversionResult } from '../types';
import { db, analytics } from './firebase';
import { collection, addDoc } from 'https://esm.sh/firebase@12.8.0/firestore';
import { logEvent } from 'https://esm.sh/firebase@12.8.0/analytics';

interface LogPayload {
  timestamp: string;
  itemCount: number;
  strategy: 'AI' | 'MANUAL';
  settings: {
    grindLevel?: number;
    useDamagePricing?: boolean;
    multiplier?: number;
  };
  items: { id: string; name: string; value: number; calculatedPrice: number }[];
}

/**
 * Logs generation usage data.
 * 
 * Logging destinations:
 * 1. Browser Console (Always)
 * 2. Firestore Database (Enabled)
 * 3. Discord Webhook (If WEBHOOK_URL is set)
 * 4. Firebase Analytics (If supported)
 */
export const logUsage = async (
  inputItems: ItemData[],
  results: ConversionResult[],
  isAi: boolean,
  settings: { grindLevel: number; useDamagePricing: boolean; multiplier: number }
) => {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    itemCount: inputItems.length,
    strategy: isAi ? 'AI' : 'MANUAL',
    settings: isAi 
      ? { grindLevel: settings.grindLevel } 
      : { useDamagePricing: settings.useDamagePricing, multiplier: settings.multiplier },
    items: results.map(r => ({
      id: r.input.id,
      name: r.input.name,
      value: r.input.value,
      calculatedPrice: r.calculatedPrice
    }))
  };

  // 1. Always log to console for debugging/local tracking
  console.groupCollapsed(`📊 Generation Log - ${payload.timestamp}`);
  console.log(`Mode: %c${payload.strategy}`, 'font-weight: bold; color: ' + (isAi ? '#a855f7' : '#d97706'));
  console.log("Settings:", payload.settings);
  console.table(payload.items);
  console.groupEnd();

  // 2. Firestore Logging
  try {
    // Modular SDK: addDoc(collection(...))
    await addDoc(collection(db, "generation_logs"), payload);
    console.log("✅ Log saved to Firestore");
  } catch (error) {
    console.warn("⚠️ Failed to save log to Firestore:", error);
  }

  // 3. External Logging (e.g., Discord Webhook)
  const WEBHOOK_URL = process.env.LOGGING_WEBHOOK_URL || "";

  if (WEBHOOK_URL) {
    try {
      const discordBody = {
        username: "TOT! Admin Logger",
        embeds: [{
          title: "New Item Generation",
          color: isAi ? 10181046 : 15105570, // Purple for AI, Orange for Manual
          fields: [
            { name: "Strategy", value: isAi ? "AI (Gemini)" : "Manual", inline: true },
            { name: "Item Count", value: payload.itemCount.toString(), inline: true },
            { 
              name: "Settings", 
              value: isAi ? `Grind Lvl: ${settings.grindLevel}` : `Mult: ${settings.multiplier}x`, 
              inline: true 
            },
            { 
              name: "Summary", 
              value: `Generated ${payload.itemCount} items. \nFirst: ${payload.items[0]?.name || 'N/A'} (${payload.items[0]?.calculatedPrice || 0})` 
            }
          ],
          footer: { text: "TOT! Admin Converter" },
          timestamp: payload.timestamp
        }]
      };

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordBody)
      });
    } catch (error) {
      console.warn("Failed to send log to external service", error);
    }
  }

  // 4. Firebase Analytics
  if (analytics) {
    try {
      logEvent(analytics, 'generate_items', {
        strategy: isAi ? 'AI' : 'MANUAL',
        item_count: inputItems.length,
        grind_level: isAi ? settings.grindLevel : 0,
        use_damage_pricing: isAi ? 0 : (settings.useDamagePricing ? 1 : 0),
        multiplier: isAi ? 0 : settings.multiplier
      });
      console.log("✅ Logged to Analytics");
    } catch (error) {
      console.warn("⚠️ Failed to log to Analytics:", error);
    }
  }
};