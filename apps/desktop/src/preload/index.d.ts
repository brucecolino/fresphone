import type { FpApi } from './index'

declare global {
  interface Window {
    fp: FpApi
  }
}
