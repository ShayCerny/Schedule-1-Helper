import { useEffect, useState } from "react";
import CloseIcon from "../../assets/x-solid.svg?react";
import "../styles/dashboard.scss";
import { useDataContext } from "../dataContext";
import { getAddictionColor } from "./utils";
import { EffectCode, EffectData } from "@schedule1-tools/mixer";

export const DashboardPage = () => {
	const [effects, setEffects] = useState<Record<EffectCode, EffectData>>({} as Record<EffectCode, EffectData>);
	const { settings, setSettings, recipes } = useDataContext();

	const bestProduct = () => {
		if (!recipes) return null;
		const r = recipes.slice().sort((a, b) => {
			const aMinCost = Math.min(...a.cost);
			const bMinCost = Math.min(...b.cost);

			const aProfit = a.salePrice * 8 - aMinCost;
			const bProfit = b.salePrice * 8 - bMinCost;

			// Create a score: profit minus a fraction of the cost
			const aScore = aProfit - aMinCost * 0.3; // 0.3 weight on cost
			const bScore = bProfit - bMinCost * 0.3;

			return bScore - aScore; // Sort higher scores first
		})[0];

		return (
			<div className="recipe" key={r.displayName}>
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
		);
	};

	const updateSettings = async (s: Settings) => {
		await window.electron.updateSettings(s);
	};

	const handleCloseDisclaimer = () => {
		let s = {
			...settings,
			displayDisclaimer: false,
			useCustomFont: settings?.useCustomFont ?? false,
			directoryPath: settings?.directoryPath ?? "",
		};

		setSettings(s);
		updateSettings(s);
	};

	useEffect(() => {
		const getData = async () => {
			const e = await window.electron.getEffects();

			setEffects(e);
		};

		getData();
	}, []);

	return (
		<div className="page" id="dashboard-page" style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}>
			<div className={(settings?.displayDisclaimer ?? false ? "" : "dis-closed ") + "main-content"}>
				<h1 className="title">Welcome to Schedule 1 Helper</h1>
				<div className="best-product">
					<h2 className="best-product-header">Your best strain: </h2>
					{bestProduct()}
				</div>
				<div className="info">
					<p className="paragraph">
						<b>Schedule 1 Helper</b> is a companion tool designed to assist players in tracking, organizing, and managing their discovered
						strains and recipes within the game Schedule 1. Our goal is to make your gameplay smoother by helping you keep track of which
						products you've found, what recipes you've unlocked, and how different ingredients combine.
					</p>
					<h2>With Schedule 1 Helper you can: </h2>
					<ul>
						<li>View all your discovered strains in one place.</li>
						<li>See detailed information about each strain.</li>
						<li>Create test mixes and see sale prices for new strains.</li>
						<li>Organize your gameplay strategy more efficiently.</li>
					</ul>
					<h2>Potential updates:</h2>
					<ul>
						<li>The ability to manage your favorites list.</li>
						<li>View your customers and manage your dealers.</li>
						<li>View automation chains for properties.</li>
					</ul>
				</div>
			</div>
			<div className={(settings?.displayDisclaimer ?? false ? "" : "closed ") + "disclaimer"}>
				<h2>Disclaimer</h2>
				<div className="close-button" onClick={() => handleCloseDisclaimer()}>
					<CloseIcon />
				</div>
				<p>
					Schedule 1 Helper is an unofficial companion app. It is not affiliated with, endorsed by, or connected to the creators or
					publishers of the game Schedule 1. Schedule 1 Helper does not condone, promote, or facilitate the use, sale, or production of
					real-world controlled substances. This tool is intended solely for entertainment purposes related to in-game activities.
				</p>
			</div>
		</div>
	);
};
