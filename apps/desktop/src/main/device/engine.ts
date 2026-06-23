// Interfaccia del motore device. In F1 verrà implementata su libimobiledevice;
// per ora esiste solo l'implementazione mock (dati demo) per costruire la UI.

export type SourceKey = 'photos' | 'files'

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

export interface DeviceEngine {
  getStatus(): DeviceStatus | Promise<DeviceStatus>
  list(source: SourceKey): MediaItem[] | Promise<MediaItem[]>
}
