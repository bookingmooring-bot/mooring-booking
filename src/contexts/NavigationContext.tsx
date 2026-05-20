import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { NavigationDestination } from "@/lib/navigation";
import NavigationMapModal from "@/components/NavigationMapModal";

interface NavigationContextValue {
  openNavigation: (destination: NavigationDestination) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [destination, setDestination] = useState<NavigationDestination | null>(null);

  const openNavigation = useCallback((dest: NavigationDestination) => {
    setDestination(dest);
  }, []);

  return (
    <NavigationContext.Provider value={{ openNavigation }}>
      {children}
      {destination && (
        <NavigationMapModal
          destination={destination}
          onClose={() => setDestination(null)}
        />
      )}
    </NavigationContext.Provider>
  );
};
