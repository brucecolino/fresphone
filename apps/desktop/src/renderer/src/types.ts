export interface DeviceStatus {
  connected: boolean
  name?: string
  usedBytes?: number
  totalBytes?: number
}

export interface MediaItem {
  id: string
  name: string
  type: 'photo' | 'video' | 'file'
  sizeBytes: number
  date: string
  durationSec?: number
  kind?: string
}
