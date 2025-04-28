import { Link, NavLink } from "react-router";
import BarsIcon from "../../assets/bars-solid.svg?react";
import MinimizeIcon from "../../assets/window-minimize-solid.svg?react";
import CloseIcon from "../../assets/x-solid.svg?react";
import GearIcon from "../../assets/gear-solid.svg?react";
import logo from "../../assets/logo.png";

import "../styles/navbar.scss";
import { useEffect, useState } from "react";
import { useDataContext } from "../dataContext";

interface NavbarProps {
	modalOpen: Boolean;
}

const Navbar = ({ modalOpen }: NavbarProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [saveFile, setSaveFile] = useState("");

	const { settings } = useDataContext();

	const handleSidebarToggle = () => {
		if (!modalOpen) {
			setSidebarOpen(!sidebarOpen);
		}
	};

	const handleCloseWindow = () => {
		window.electron.close();
	};

	const handleMinimizeWindow = () => {
		window.electron.minimize();
	};

	const getSaveFile = async () => {
		const save = await window.electron.getSavedPath();
		setSaveFile(save);
	};

	const isSaveSelected = () => {
		getSaveFile();
		return saveFile !== "";
	};

	useEffect(() => {
		getSaveFile();
	}, [settings]);

	return (
		<div className="navbar" style={{ fontFamily: settings?.useCustomFont ? "Barriecito" : "sans-serif" }}>
			<div id="sidebar-toggle" className={modalOpen ? "deactivate" : ""} onClick={() => handleSidebarToggle()}>
				<BarsIcon />
			</div>
			<div className="title">
				<h1>Schedule 1 Helper</h1>
				<img src={logo} alt="logo" />
			</div>
			<div id="window-controls">
				<div id="minimize" className="control" onClick={() => handleMinimizeWindow()}>
					<MinimizeIcon />
				</div>
				<div id="close" className="control" onClick={() => handleCloseWindow()}>
					<CloseIcon />
				</div>
			</div>
			<div className={"side-bar " + (sidebarOpen ? "" : "closed")}>
				<div
					className="nav"
					onClick={() => {
						handleSidebarToggle();
					}}
				>
					<NavLink className={({ isActive }) => (isActive ? "active" : "")} to={"/"}>
						Dashboard
					</NavLink>
					{isSaveSelected() ? (
						<NavLink className={({ isActive }) => (isActive ? "active" : "")} to={"/discovered"}>
							Discovered Products
						</NavLink>
					) : null}
					<NavLink className={({ isActive }) => (isActive ? "active" : "")} to={"/mixer"}>
						Mixer
					</NavLink>
					<NavLink className={({ isActive }) => (isActive ? "active" : "")} to={"/products"}>
						Products
					</NavLink>
					<NavLink className={({ isActive }) => (isActive ? "active" : "")} to={"/substances"}>
						Substances
					</NavLink>
					<NavLink className={({ isActive }) => (isActive ? "active" : "")} to={"/guide"}>
						How Mixing Works
					</NavLink>
				</div>
				<Link
					to={"/settings"}
					className="settings"
					onClick={() => {
						handleSidebarToggle();
					}}
				>
					<GearIcon />
					<h2>Settings</h2>
				</Link>
			</div>
		</div>
	);
};

export default Navbar;
