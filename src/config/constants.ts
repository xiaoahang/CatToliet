import type { CabinetConfig } from '../types/cabinet'

export const PROFILE_SIZES = {
  '2020': { w: 20, pricePerM: 12 },
  '3030': { w: 30, pricePerM: 18 },
  '4040': { w: 40, pricePerM: 28 },
} as const

export const PANEL_PRICES: Record<string, number> = {
  'acrylic-clear': 120,
  'acrylic-frosted': 140,
  'mesh': 60,
  'none': 0,
}

export const COLOR_MAP: Record<string, string> = {
  'silver-white': '#E8E8E8',
  'black': '#1A1A1A',
  'gold': '#D4956A',
}

export const PROFILE_WEIGHT: Record<string, number> = {
  '2020': 0.6,
  '3030': 1.2,
  '4040': 2.0,
}

export function getProfileSize(config: CabinetConfig) {
  return PROFILE_SIZES[config.profile]
}
