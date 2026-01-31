
export interface ItemData {
  id: string;
  name: string;
  value: number; // Represents either damage or direct price depending on settings
}

export interface ConversionResult {
  input: ItemData;
  output: string;
  calculatedPrice: number;
  error?: string;
}

export interface WeaponItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  damage: number;
  durability: number;
  weight: number;
  penetration: string;
}

export interface ArmorItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  armorValue: number;
  durability: number;
  weight: number;
}

export interface ToolItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string; 
  durability: number;
  weight: number;
  damage: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface BuildingItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  weight: number;
  durability: number;
}

export interface ConsumableItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface StationItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface DecorationItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface TreasureItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface UtilityItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}

export interface WarpaintItem {
  id: string;
  name: string;
  category: string;
  tier: number | string;
  type: string;
  weight: number;
  durability: number;
}
