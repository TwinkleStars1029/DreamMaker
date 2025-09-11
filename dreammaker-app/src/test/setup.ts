import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => ({
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
        })),
      })),
    },
    onsuccess: null,
    onerror: null,
  })),
}
Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
})

// Mock fetch
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Global test configuration
config.global.mocks = {
  $t: (key: string) => key,
}

