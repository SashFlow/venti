"use client";

import { Toggle } from "@repo/ui/toggle";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsClient } from "usehooks-ts";

export function ColorModeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isClient = useIsClient();

	const toggleTheme = () => {
		if (resolvedTheme === "light") {
			setTheme("dark");
		} else {
			setTheme("light");
		}
	};

	if (!isClient) {
		return null;
	}

	return (
		<Toggle onClick={toggleTheme} aria-label="Toggle color mode">
			{resolvedTheme === "light" ? (
				<SunIcon className="size-4" />
			) : (
				<MoonIcon className="size-4" />
			)}
		</Toggle>
	);
}
