import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from '@/stores'

describe('Zustand UI Store', () => {
  beforeEach(() => {
    useUiStore.getState().resetUiState()
  })

  it('initializes with default UI state', () => {
    const state = useUiStore.getState()
    expect(state.isSidebarCollapsed).toBe(false)
    expect(state.activeModal).toBe(null)
    expect(state.modalPayload).toBe(null)
    expect(state.tableDensity).toBe('comfortable')
  })

  it('toggles and sets sidebar state', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().isSidebarCollapsed).toBe(true)

    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().isSidebarCollapsed).toBe(false)

    useUiStore.getState().setSidebarCollapsed(true)
    expect(useUiStore.getState().isSidebarCollapsed).toBe(true)
  })

  it('opens and closes modals with payload', () => {
    const payload = { candidateId: '123', name: 'Jane Doe' }
    useUiStore.getState().openModal('ADD_CANDIDATE_MODAL', payload)

    expect(useUiStore.getState().activeModal).toBe('ADD_CANDIDATE_MODAL')
    expect(useUiStore.getState().modalPayload).toEqual(payload)

    useUiStore.getState().closeModal()
    expect(useUiStore.getState().activeModal).toBe(null)
    expect(useUiStore.getState().modalPayload).toBe(null)
  })

  it('updates table density preference', () => {
    useUiStore.getState().setTableDensity('compact')
    expect(useUiStore.getState().tableDensity).toBe('compact')

    useUiStore.getState().setTableDensity('comfortable')
    expect(useUiStore.getState().tableDensity).toBe('comfortable')
  })

  it('resets all UI state cleanly', () => {
    useUiStore.getState().setSidebarCollapsed(true)
    useUiStore.getState().openModal('TEST_MODAL')
    useUiStore.getState().setTableDensity('compact')

    useUiStore.getState().resetUiState()

    const state = useUiStore.getState()
    expect(state.isSidebarCollapsed).toBe(false)
    expect(state.activeModal).toBe(null)
    expect(state.tableDensity).toBe('comfortable')
  })
})
