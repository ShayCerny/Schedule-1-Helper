import { EffectCode, EffectData, SubstanceData } from "@schedule1-tools/mixer";
import { useEffect, useState } from "react";

import "../styles/substances.scss";
import { useDataContext } from "../dataContext";

export const SubstancesPage = () => {
	const [substances, setSubstances] = useState([] as SubstanceData[]);
	const [effects, setEffects] = useState<Record<EffectCode, EffectData>>({} as Record<EffectCode, EffectData>);

	const { settings } = useDataContext();

	const handleGetSubstances = async () => {
		const subs = (await window.electron.getSubstances()) as SubstanceData[];
		const eff = (await window.electron.getEffects()) as Record<EffectCode, EffectData>;

		setSubstances(subs);
		setEffects(eff);
	};

	const formatEffect = (abbr: EffectCode[]) => {
		const e = abbr.map((key) => (effects as Record<EffectCode, EffectData>)[key] ?? key);
		return e;
	};

	useEffect(() => {
		handleGetSubstances();
	}, []);

	return (
		<div className="page" id="substances" style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}>
			<h1>Substances</h1>
			<p>Here is a list of all the mixing substances in the game along with their prices and base effects.</p>
			<div className="substance-list">
				{Object.entries(substances).map(([name, data]: [string, SubstanceData]) => (
					<div className="sub" key={name}>
						<h2>{name == "Viagra" ? "Viagor" : name}</h2>
						<div className="info">
							<p>
								cost: <span className="price">${data.price}</span>
							</p>
							<p className="effect">
								effect:{" "}
								{formatEffect(data.effect).map((e) => (
									<span key={e.name} style={{ color: e.color }}>
										{e.name}
									</span>
								))}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
