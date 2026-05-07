export interface CabinetConfig {
  width: number
  height: number
  depth: number
  profile: '2020' | '3030' | '4040'
  panelMaterial: 'acrylic-clear' | 'acrylic-frosted' | 'mesh' | 'none'
  color: 'silver-white' | 'black' | 'gold'
  hasShelf: boolean
  shelfCount: number
  hasWheels: boolean
  topPanelType: 'wood-cover' | 'acrylic-inset'
}

export interface MaterialItem {
  name: string
  spec: string
  position: string
  count: number
  unitPrice: number
  total: number
}

export const DEFAULT_CONFIG: CabinetConfig = {
  width: 800,
  height: 1000,
  depth: 400,
  profile: '2020',
  panelMaterial: 'acrylic-frosted',
  color: 'silver-white',
  hasShelf: true,
  shelfCount: 2,
  hasWheels: true,
  topPanelType: 'wood-cover',
}
