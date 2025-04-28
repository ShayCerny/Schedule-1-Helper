type Recipe = {
	output: string;
	type: string;
	displayName: string;
	ingredients: string[] | Substance[];
	base: string | Product;
	cost: number[];
	salePrice: number;
	effects: string[];
	addiction: number;
};

type SaveFile = {
	name: string;
	path: string;
	netWorth: number;
};

type ComputedMix = {
	effects: string[];
	cost: number[];
	sellPrice: 64;
	addiction: number;
};

type Settings = {
	displayDisclaimer: boolean;
	useCustomFont: boolean;
	directoryPath: string;
};

interface Window {
	electron: {
		close: () => void;
		minimize: () => void;

		getSaves: () => SaveFile[];
		selectSave: (path: string) => void;
		getHelperData: () => any;
		testMix: (data: { base; ingredients }) => ComputedMix;
		getRecipes: () => Recipe[];
		getSavedPath: () => string;
		onFileUpdated: (callback: () => any) => void;
		getGuideInfo: () => { rules: EffectRule[]; effects: EffectData };
		getSubstances: () => Record<Substance, SubstanceData>;
		getProducts: () => Record<Product, ProductData>;
		getEffects: () => Record<EffectCode, EffectData>;
		getSettings: () => Settings | null;
		updateSettings: (s: Settings) => void;

		openDirectory: () => string;
	};
}
