import { ReactNode, useContext, useState } from "react";
import { createContext } from "react";

const DataContext = createContext<{
	recipes: Recipe[] | null;
	setRecipes: (r: Recipe[]) => void;
	settings: Settings | null;
	setSettings: (s: Settings | null) => void;
} | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
	const [recipes, setRecipes] = useState<Recipe[] | null>(null);
	const [settings, setSettings] = useState<Settings | null>(null);

	return <DataContext.Provider value={{ recipes, setRecipes, settings, setSettings }}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
	const context = useContext(DataContext);
	if (!context) throw new Error("useDataContext must be used within DataProvider");
	return context;
};
