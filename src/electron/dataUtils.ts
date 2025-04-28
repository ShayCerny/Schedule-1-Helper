import { substances, products, mixSubstances, SubstanceData, ProductData, Product } from "@schedule1-tools/mixer";

function getItemByName(raw: string): { name: string; data: ProductData } | { name: string; data: SubstanceData } | null {
	if (raw === "viagor") return { name: "Viagra", data: substances.Viagra };
	if (raw === "granddaddypurple") return { name: "Grandaddy Purple", data: products["Grandaddy Purple"] };

	const key = raw.toLowerCase().replace(/\s+/g, "");

	// Check substances
	for (const [name, data] of Object.entries(substances)) {
		const normalized = name.toLowerCase().replace(/\s+/g, "");
		if (normalized === key) return { name, data: data as SubstanceData }; // Return name and substance data
	}

	// Check products
	for (const [name, data] of Object.entries(products)) {
		const normalized = name.toLowerCase().replace(/\s+/g, "");
		if (normalized === key) return { name, data: data as ProductData }; // Return name and product data
	}

	return null;
}

export function getDisplayNameAndType(id: string, PFD: any): { type: string; name: string } {
	const createdWeed = PFD.CreatedWeed;
	const createdMeth = PFD.CreatedMeth;
	const createdCocaine = PFD.CreatedCocaine;

	const weed = createdWeed.find((i: any) => i.ID === id);
	if (weed) return { type: "Weed", name: weed.Name };
	const meth = createdMeth.find((i: any) => i.ID === id);
	if (meth) return { type: "Meth", name: meth.Name };
	const cocaine = createdCocaine.find((i: any) => i.ID === id);
	if (cocaine) return { type: "Cocaine", name: cocaine.Name };

	return { type: "Unkown", name: "Unkown Product" };
}

export function getSeedCost(strain: string): number[] {
	switch (strain) {
		case "Sour Diesel":
			return [35];

		case "OG Kush":
			return [30];

		case "Grandaddy Purple":
			return [45];

		case "Meth":
			return [140, 190];

		case "Green Crack":
			return [40];

		case "Cocaine":
			return [455];

		default:
			return [0];
	}
}

export function processChains(allChains: Recipe[]) {
	for (const chain of allChains) {
		chain.base = getItemByName(chain.base);
		chain.ingredients = chain.ingredients.map((id: string) => getItemByName(id));

		const mixed = mixSubstances(
			chain.base.name,
			chain.ingredients.map((i) => i.name)
		);

		const computed = {
			cost: [mixed.cost],
			effects: mixed.effects,
			sellPrice: mixed.sellPrice,
			addiction: mixed.addiction,
		} as ComputedMix;

		chain.effects = computed.effects;
		chain.addiction = computed.addiction;
		chain.salePrice = computed.sellPrice;

		chain.cost = getSeedCost(chain.base.name).map((costItem, index) => costItem + computed.cost[0]);
	}
	return allChains;
}
