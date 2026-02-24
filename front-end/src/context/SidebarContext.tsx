import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  sidebarWidth: number;
  // Level 2 drawer state
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerWidth: number;
  // Total width for margin calculation
  totalWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SIDEBAR_WIDTH = 380; // Level 1 navigator
export const DRAWER_WIDTH = 420; // Level 2 config drawer

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);

  // Calculate total width based on what's open
  const totalWidth = isOpen ? (isDrawerOpen ? SIDEBAR_WIDTH + DRAWER_WIDTH : SIDEBAR_WIDTH) : 0;

  return (
    <SidebarContext.Provider value={{
      isOpen,
      setIsOpen,
      toggle,
      sidebarWidth: SIDEBAR_WIDTH,
      isDrawerOpen,
      setDrawerOpen,
      drawerWidth: DRAWER_WIDTH,
      totalWidth,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
