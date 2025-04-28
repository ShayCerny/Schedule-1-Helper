import { useEffect, useState } from "react";
import { useDataContext } from "../dataContext";

import "../styles/discovered.scss";
import { EffectCode, EffectData } from "@schedule1-tools/mixer";
import { getAddictionColor } from "./utils";
import { useOutletContext } from "react-router";

export const DiscoveredPage = () => {
	const [effects, setEffects] = useState<Record<EffectCode, EffectData>>({} as Record<EffectCode, EffectData>);
	const [selectedPage, setSelectedPage] = useState<"Weed" | "Meth" | "Coke">("Weed");
	const [search, setSearch] = useState("");

	const { settings, recipes } = useDataContext();

	const { handleToggleModal } = useOutletContext<{ handleToggleModal: () => void }>();

	useEffect(() => {
		const handleGetData = async () => {
			const rec = await window.electron.getEffects();
			setEffects(rec);
		};

		handleGetData();
	}, []);

	const getCurrentPage = () => {
		const filteredRecipes = recipes?.filter((r) => r.type === selectedPage) || [];

		if (filteredRecipes.length === 0) {
			return (
				<div className="pagination-page" id={`${selectedPage.toLowerCase()}-pagination`}>
					<p className="not-found">No recipes found</p>
				</div>
			);
		}

		const handleSearch = (e: string) => {
			setSearch(e);
		};

		return (
			<div
				className="pagination-page"
				id={`${selectedPage.toLowerCase()}-pagination`}
				style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}
			>
				<div className="search">
					<input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search Strains" />
				</div>

				{filteredRecipes
					.slice()
					.filter((r) => r.displayName.toLowerCase().includes(search.toLowerCase())) // Filter based on search value // copy so we don't mutate the original array
					.sort((a, b) => {
						const aMinCost = Math.min(...a.cost);
						const bMinCost = Math.min(...b.cost);

						const aProfit = a.salePrice * 8 - aMinCost;
						const bProfit = b.salePrice * 8 - bMinCost;

						// Create a score: profit minus a fraction of the cost
						const aScore = aProfit - aMinCost * 0.3; // 0.3 weight on cost
						const bScore = bProfit - bMinCost * 0.3;

						return bScore - aScore; // Sort higher scores first
					})
					.map((r, u) => (
						<div className="recipe" key={u}>
							<div className="name-base">
								<h2>{r.displayName}</h2>
								<p>- {r.base.name}</p>
							</div>
							<div className="prices">
								<p>
									Cost:{" "}
									{r.cost.map((c, index) => (
										<span key={index}>
											<span className="price">
												{r.cost.length > 1 ? <span>&tilde;</span> : ""}${c}
											</span>
											{index < r.cost.length - 1 && " to "}
										</span>
									))}
								</p>
								<p>
									Sale Price: <span className="price">${r.salePrice}</span>
								</p>
								<p>
									Batch Profit:{" "}
									<span>
										{r.cost.map((c, index) => (
											<span key={index}>
												<span className="price">
													{r.cost.length > 1 ? <span>&tilde;</span> : ""}${r.salePrice * 8 - c}
												</span>
												{index < r.cost.length - 1 && " to "}
											</span>
										))}
									</span>
								</p>
								<p>
									Addiction:{" "}
									<span className="addiction" style={{ color: getAddictionColor(r.addiction) }}>
										{r.addiction}
									</span>
								</p>
							</div>
							<p className="ingredients">
								Ingredients:{" "}
								{r.ingredients.map((i: any, index: number) => (
									<span key={index}>
										{i.name}
										{index < r.ingredients.length - 1 ? " -> " : ""}
									</span>
								))}
							</p>
							<p>
								Effects:{" "}
								{r.effects.map((e, i) => {
									const effect = effects?.[e as EffectCode];
									return (
										<span key={i}>
											<span style={{ color: effect?.color || "#ccc" }}>{effect?.name || "Unknown Effect"}</span>
											{i !== r.effects.length - 1 && ", "}
										</span>
									);
								})}
							</p>
						</div>
					))}
			</div>
		);
	};

	return (
		<div className="page" id="discovered-page">
			<div className="info">
				<h1>Discovered Strains</h1>
				<p> sorted by cost and batch profit</p>
				<div className="save-select-button" onClick={() => handleToggleModal()}>
					<p>Change Save</p>
				</div>
			</div>
			<div className="pages">
				<div className="tabs">
					<h2 id="weed" className={selectedPage === "Weed" ? "selected" : ""} onClick={() => setSelectedPage("Weed")}>
						Weed
					</h2>
					<h2 id="meth" className={selectedPage === "Meth" ? "selected" : ""} onClick={() => setSelectedPage("Meth")}>
						Meth
					</h2>
					<h2 id="coke" className={selectedPage === "Coke" ? "selected" : ""} onClick={() => setSelectedPage("Coke")}>
						Cocaine
					</h2>
				</div>
				{getCurrentPage()}
			</div>
		</div>
	);
};
