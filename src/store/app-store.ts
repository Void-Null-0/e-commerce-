import { create } from 'zustand'

type AdminTab = 'overview' | 'products' | 'orders'
type View = 'store' | 'admin'

interface AppStore {
  view: View
  adminTab: AdminTab
  setView: (view: View) => void
  setAdminTab: (tab: AdminTab) => void
  selectedProduct: string | null
  setSelectedProduct: (id: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  view: 'store',
  adminTab: 'overview',
  setView: (view) => set({ view }),
  setAdminTab: (adminTab) => set({ adminTab }),
  selectedProduct: null,
  setSelectedProduct: (id) => set({ selectedProduct: id }),
}))