
import { ItemData } from '../types';

/**
 * Generates a random 32-character hexadecimal string.
 */
export const generateRandomHex32 = (): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

/**
 * Parses raw input string "ID, Name, Value" into ItemData objects.
 */
export const parseInput = (raw: string): ItemData[] => {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 3) return null;
      
      const [id, name, valueStr] = parts;
      const value = parseFloat(valueStr);
      
      if (isNaN(value)) return null;
      
      return { id, name, value };
    })
    .filter((item): item is ItemData => item !== null);
};

/**
 * Formats a single ItemData into the TOT ! Admin ruledata string.
 */
export const convertToTOTAdminString = (
  item: ItemData, 
  price: number
): string => {
  const guid = generateRandomHex32();
  const finalPrice = Math.round(price);
  
  return `<o>|Guid|${guid}|Name|${item.name}|ruledata|<o>&pip;<e>|Items|<o>&pip;Items&pip;<a>&pip;<o>&pip;templateId&pip;${item.id}&pip;Stack&pip;1&pip;maxstack&pip;1&pip;chances&pip;100&pip;<e>&pip;<e>&pip;<e>|Prices|<o>&pip;${item.id}&pip;<o>&pip;Constant&pip;0&pip;bprice&pip;${finalPrice}&pip;Price&pip;-1&pip;Unit&pip;1&pip;<e>&pip;<e>|Currency|11054|buymultiplier|1.0|SellMultiplier|1.0|currencymin|0|currencymax|0|refreshcooldown|1.0|<e>`;
};

/**
 * Generates a single Batch RuleData string for multiple items.
 */
export const generateBatchTOTAdminString = (
  results: { input: ItemData; calculatedPrice: number }[]
): string => {
  if (results.length === 0) return '';
  
  const guid = generateRandomHex32().toUpperCase();
  const mainName = results.length > 1 
    ? `${results[0].input.name} + ${results.length - 1} items` 
    : results[0].input.name;

  // Build Items list
  const itemEntries = results.map(res => 
    `<o>&pip;templateId&pip;${res.input.id}&pip;Stack&pip;1&pip;maxstack&pip;1&pip;chances&pip;100&pip;<e>`
  ).join('&pip;');

  // Build Prices list
  const priceEntries = results.map(res => 
    `${res.input.id}&pip;<o>&pip;Constant&pip;0&pip;bprice&pip;${Math.round(res.calculatedPrice)}&pip;Price&pip;-1&pip;Unit&pip;1&pip;<e>`
  ).join('&pip;');

  return `<o>|Guid|${guid}|Name|${mainName}|ruledata|<o>&pip;<e>|Items|<o>&pip;Items&pip;<a>&pip;${itemEntries}&pip;<e>&pip;<e>&pip;<e>|Prices|<o>&pip;${priceEntries}&pip;<e>|Currency|11054|buymultiplier|1.0|SellMultiplier|1.0|currencymin|0|currencymax|0|refreshcooldown|1.0|<e>`;
};
