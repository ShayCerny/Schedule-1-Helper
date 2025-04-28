import { EffectCode, EffectData, Product, ProductData } from "@schedule1-tools/mixer";
import { useEffect, useState } from "react";

import "../styles/products.scss";
import { getProductTypeCost } from "./utils";
import { useDataContext } from "../dataContext";

export const ProductsPage = () => {
	const [products, setProducts] = useState<Record<Product, ProductData>>({} as Record<Product, ProductData>);
	const [effects, setEffects] = useState<Record<EffectCode, EffectData>>({} as Record<EffectCode, EffectData>);

	const {settings} = useDataContext();

	const handleGetProducts = async () => {
		const eff = (await window.electron.getEffects()) as Record<EffectCode, EffectData>;
		const prod = (await window.electron.getProducts()) as Record<Product, ProductData>;

		setProducts(prod);
		setEffects(eff);
	};

	const renderTypeCategories = (wantedType: string) => {
		return Object.entries(products).map(([name, data]) => {
			const e = data.effects?.[0] ? effects[data.effects[0]] : undefined;

			const { type, cost } = getProductTypeCost(name) as { type: string; cost: number[] };

			if (!type || type !== wantedType) return null;

			return (
				<div key={name} className="product">
					<h2>{name}</h2>
					<p>
						{type == "weed" ? "Seed " : "Material "}Cost:{" "}
						{cost.map((c, index) => (
							<span key={index}>
								<span className="price">
									{type !== "weed" ? <span>&tilde;</span> : ""}${c}
								</span>
								{index < cost.length - 1 && " to "}
							</span>
						))}
					</p>
					{e ? (
						<p>
							Base Effect: <span style={{ color: e.color }}>{e.name}</span>
						</p>
					) : (
						<p>No Base Effect</p>
					)}
				</div>
			);
		});
	};

	useEffect(() => {
		handleGetProducts();
	}, []);

	return (
		<div className="page" id="products-page" style={{fontFamily: settings?.useCustomFont ? 'Barriecito' : "sans-serif"}}>
			<div className="product-category" id="weed">
				<h1>Weed</h1>
				<div className="product-list">{renderTypeCategories("weed")}</div>
			</div>
			<div className="product-category" id="meth">
				<h1>Meth</h1>
				<div className="product-list">{renderTypeCategories("meth")}</div>
			</div>
			<div className="product-category" id="coke">
				<h1>Cocaine</h1>
				<div className="product-list">{renderTypeCategories("coke")}</div>
			</div>
		</div>
	);
};
