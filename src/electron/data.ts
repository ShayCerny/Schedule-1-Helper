import path from "path";
import fs from "fs";
import { getDisplayNameAndType, processChains } from "./dataUtils.js";
import { store } from "./events.js";

export function extractOrgName() {
	const results: SaveFile[] = [];

	const settings = store.get("settings") as Settings;

	const rootPath = settings.directoryPath;

	if (!fs.existsSync(rootPath)) return results;

	const steamAccounts = fs.readdirSync(rootPath);

	for (const account of steamAccounts) {
		const accountPath = path.join(rootPath, account);
		if (!fs.statSync(accountPath).isDirectory()) continue;

		const saveDirs = fs.readdirSync(accountPath).filter((file) => fs.statSync(path.join(accountPath, file)).isDirectory());
		for (const saveDir of saveDirs) {
			const savePath = path.join(accountPath, saveDir);
			const gameFilePath = path.join(savePath, "Game.json");
			const moneyFilePath = path.join(savePath, "Money.json");
			if (fs.existsSync(gameFilePath)) {
				const gameFile = JSON.parse(fs.readFileSync(gameFilePath, "utf-8"));
				const moneyFile = JSON.parse(fs.readFileSync(moneyFilePath, "utf-8"));
				if (gameFile?.OrganisationName) {
					results.push({
						name: gameFile.OrganisationName,
						path: savePath,
						netWorth: moneyFile.Networth || 0,
					});
				}
			}
		}
	}
	return results;
}

type GameMix = {
	Product: string;
	Mixer: string;
	Output: string;
};

type Path = {
	ingredients: string[];
	base: string;
};

const bases = ["ogkush", "greencrack", "sourdiesel", "granddaddypurple", "meth", "cocaine"];

function createRecipeChains(allStrains: string[], mixes: GameMix[], PFD: any) {
	let allRecipes: Recipe[] = [];

	function traceChain(a: string, b: string) {
		let strain: string = allStrains.includes(a) ? a : b;
		let ingredient: string = !allStrains.includes(a) ? a : b;

		if (bases.includes(strain)) {
			return { ingredients: [ingredient], base: strain };
		}

		const recipeIndex = allRecipes.findIndex((i) => i.output === strain);
		if (recipeIndex != -1) {
			const pastStrain = allRecipes[recipeIndex];
			return { ingredients: [...(pastStrain.ingredients as string[]), ingredient], base: pastStrain.base };
		}

		const newMix = mixes.find((i) => i.Output === strain);

		if (!newMix) {
			throw "Previous Mix not found!";
		}

		const path: Path = traceChain(newMix.Mixer, newMix.Product);

		return { ingredients: [...path.ingredients, ingredient], base: path.base };
	}

	for (const mix of mixes) {
		const chain = traceChain(mix.Mixer, mix.Product);

		const DT = getDisplayNameAndType(mix.Output, PFD);

		let recipe: Recipe = {
			output: mix.Output,
			type: DT.type,
			displayName: DT.name,
			ingredients: chain.ingredients,
			base: chain.base,
			cost: [0],
			salePrice: 0,
			effects: [],
			addiction: 0,
		};

		allRecipes.push(recipe);
	}

	return processChains(allRecipes);
}

export function getProductData(savePath: string) {
	const productsFilePath = path.join(savePath, "Products.json");
	if (!fs.existsSync(productsFilePath)) return null;

	const PFD = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));
	const allStrains = PFD.DiscoveredProducts;

	const savedMixes = store.get("mixes", []) as GameMix[];

	const isExactMatch = (mix: GameMix, other: GameMix) =>
		mix.Product === other.Product && mix.Mixer === other.Mixer && mix.Output === other.Output;

	const mixes = PFD.MixRecipes.filter(
		(mix: GameMix) => !bases.includes(mix.Output) && !savedMixes.some((saved) => isExactMatch(mix, saved))
	);

	store.set("mixes", PFD.MixRecipes);

	return createRecipeChains(allStrains, mixes, PFD);
}
