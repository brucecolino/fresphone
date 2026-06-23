import type { DeviceEngine, DeviceStatus, MediaItem, SourceKey } from './engine'

function sample(n: number): MediaItem[] {
  const items: MediaItem[] = []
  for (let i = 0; i < n; i++) {
    const isVideo = i % 5 === 2
    items.push({
      id: `m${i}`,
      name: `${isVideo ? 'VID' : 'IMG'}_${1000 + i}${isVideo ? '.MOV' : '.HEIC'}`,
      type: isVideo ? 'video' : 'photo',
      sizeBytes: (isVideo ? 40_000_000 : 3_500_000) + i * 12_000,
      date: new Date(2026, 0, 1 + i).toISOString(),
      durationSec: isVideo ? 14 + (i % 40) : undefined,
      kind: isVideo ? 'video' : 'HEIC',
    })
  }
  return items
}

// Motore demo: simula un iPhone collegato con contenuti di esempio, così la UI
// è dimostrabile prima di integrare libimobiledevice (F1).
export const mockEngine: DeviceEngine = {
  getStatus(): DeviceStatus {
    return { connected: true, name: 'iPhone (demo)', usedBytes: 89_200_000_000, totalBytes: 128_000_000_000 }
  },
  list(source: SourceKey): MediaItem[] {
    if (source === 'files') {
      return sample(12).map((m, i) => ({
        ...m,
        type: 'file',
        name: `Documento_${i + 1}.${['pdf', 'txt', 'zip', 'mov'][i % 4]}`,
        kind: ['PDF', 'Testo', 'Archivio', 'Video'][i % 4],
      }))
    }
    return sample(24)
  },
}
