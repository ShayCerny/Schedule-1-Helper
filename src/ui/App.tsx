import { Outlet } from "react-router";
import { Modal } from "./components/modal";
import Navbar from "./components/navbar";
import { useEffect, useState } from "react";
import { useDataContext } from "./dataContext";

interface SelectSaveProps {
	closeModal: () => void;
	saveSelected: (savePath: string) => void;
}

const SelectSave = ({ saveSelected, closeModal }: SelectSaveProps) => {
	const [saves, setSaves] = useState<SaveFile[]>([]);
	const handleSelectSave = (savePath: string) => {
		saveSelected(savePath);
		closeModal();
	};

	const getSaves = async () => {
		const tempSaves = await window.electron.getSaves();
		setSaves(tempSaves);
	};

	const formatNumber = (n: number): string => {
		if (n >= 1_000_000_000) {
			return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
		} else if (n >= 1_000_000) {
			return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
		} else if (n >= 1_000) {
			return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
		} else {
			return n.toString();
		}
	};

	useEffect(() => {
		getSaves();
	}, []);

	return (
		<div className="save-select">
			<h1>Select Your Save</h1>
			<div className="saves-list">
				{saves?.map((s) => (
					<div
						key={s.name}
						className="save"
						onClick={() => {
							handleSelectSave(s.path);
						}}
					>
						<h2>{s.name}</h2>
						<p>Net Worth: ${formatNumber(s.netWorth)}</p>
					</div>
				))}
				<div className="skip" onClick={() => closeModal()}></div>
			</div>
		</div>
	);
};

function App() {
	// 	const mix = await window.electron.testMix({ base: "OG Kush", ingredients: [substances.Banana] });
	// 	console.log(mix.effects.map((i) => effects[i as EffectCode]));

	const [modalOpen, setModalOpen] = useState(false);
	const [hasCheckedStore, setHasCheckedStore] = useState(false);
	const { setRecipes, setSettings } = useDataContext();

	const handleCloseModal = () => {
		setModalOpen(false);
	};

	const handleToggleModal = () => {
		setModalOpen(!modalOpen);
	};

	const saveSelected = async (savePath: string) => {
		window.electron.selectSave(savePath);
		const tempRecipes = await window.electron.getRecipes();
		setRecipes(tempRecipes);
	};

	const handleCheckSave = async () => {
		const savedPath = await window.electron.getSavedPath();
		if (!savedPath) {
			setModalOpen(true); // No save? Show modal.
		} else {
			const r = await window.electron.getRecipes();
			setRecipes(r);
		}
		setHasCheckedStore(true); // Now it's safe to render the rest of the app
	};

	const getSettings = async () => {
		const s = await window.electron.getSettings();

		setSettings(s);
	};

	useEffect(() => {
		handleCheckSave();
		getSettings();
	}, []);

	if (!hasCheckedStore) return null;

	return (
		<>
			{modalOpen ? (
				<Modal closable onClose={handleCloseModal}>
					<SelectSave saveSelected={saveSelected} closeModal={handleCloseModal} />
				</Modal>
			) : null}
			<Navbar modalOpen={modalOpen} />
			<Outlet context={{ handleToggleModal }} />
		</>
	);
}

export default App;
