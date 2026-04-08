import SideBarHeader from "@saas/shared/components/sidebar/home-header";
import React from "react";
import HomeClient from "./HomeClient";

const HomePage = () => {
	return (
		<>
			<SideBarHeader />
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div className="container py-8 max-w-7xl mx-auto">
					<HomeClient />
				</div>
			</div>
		</>
	);
};

export default HomePage;
