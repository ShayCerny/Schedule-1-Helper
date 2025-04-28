import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import App from "./App.tsx";
import { createHashRouter, RouterProvider } from "react-router";
import { Guide } from "./components/guide.tsx";
import { DataProvider } from "./dataContext.tsx";
import { SubstancesPage } from "./components/substances.tsx";
import { ProductsPage } from "./components/products.tsx";
import { MixerPage } from "./components/mixer.tsx";
import { DiscoveredPage } from "./components/discovered.tsx";
import { DashboardPage } from "./components/dashboard.tsx";
import { SettingsPage } from "./components/settings.tsx";

const router = createHashRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{
				path: "",
				element: <DashboardPage />, // Dashboard: shows top products and favorites (allows you to edit your favorites, tells you to reload game)?
			},
			{
				path: "/discovered",
				element: <DiscoveredPage />, // Discovered: shows all your discovered strains paginated by type (weed, meth, cocaine) and ordered by profit
			},
			{
				path: "/mixer",
				element: <MixerPage />, // Mixer: allows you to create mixes and see their sale price
			},
			{
				path: "/products",
				element: <ProductsPage />, // Products: shows you the product types: (OGKush, GreenCrack, etc.. ) and their seed or material cost
			},
			{
				path: "/substances",
				element: <SubstancesPage />, // Substances: shows you the substances available to mix with in game and their price and their rules
			},
			{
				path: "/guide",
				element: <Guide />, // explains how the mixing process works and how price is calculated, also shows you the effects and their multipliers
			},
			{
				path: "/settings",
				element: <SettingsPage />,
			},
		],
	},
	{
		path: "/saveselect",
		element: <h1>Save Select</h1>,
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<DataProvider>
			<RouterProvider router={router} />
		</DataProvider>
	</StrictMode>
);
