import { create } from 'zustand'

export type TableDensity = 'compact' | 'comfortable'

export interface UiState {
  readonly isSidebarCollapsed: boolean
  readonly isMobileNavOpen: boolean
  readonly activeModal: string | null
  readonly modalPayload: unknown
  readonly tableDensity: TableDensity

  readonly toggleSidebar: () => void
  readonly setSidebarCollapsed: (collapsed: boolean) => void
  readonly toggleMobileNav: () => void
  readonly setMobileNavOpen: (open: boolean) => void
  readonly openModal: (modalId: string, payload?: unknown) => void
  readonly closeModal: () => void
  readonly setTableDensity: (density: TableDensity) => void
  readonly resetUiState: () => void
}

const initialState = {
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  activeModal: null,
  modalPayload: null,
  tableDensity: 'comfortable' as TableDensity,
}

export const useUiStore = create<UiState>()((set) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed: boolean) =>
    set({ isSidebarCollapsed: collapsed }),

  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  setMobileNavOpen: (open: boolean) =>
    set({ isMobileNavOpen: open }),

  openModal: (modalId: string, payload: unknown = null) =>
    set({ activeModal: modalId, modalPayload: payload }),

  closeModal: () =>
    set({ activeModal: null, modalPayload: null }),

  setTableDensity: (density: TableDensity) =>
    set({ tableDensity: density }),

  resetUiState: () =>
    set({ ...initialState }),
}))

