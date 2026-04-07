"use client";

import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";

export type ConsentPreferences = {
	essential: boolean;
	analytics: boolean;
	marketing: boolean;
};

const DEFAULT_CONSENT: ConsentPreferences = {
	essential: true,
	analytics: false,
	marketing: false,
};

export const ConsentContext = createContext<{
	userHasConsented: boolean;
	preferences: ConsentPreferences;
	allowAll: () => void;
	declineAll: () => void;
	updatePreferences: (prefs: Partial<ConsentPreferences>) => void;
	resetConsent: () => void;
}>({
	userHasConsented: false,
	preferences: DEFAULT_CONSENT,
	allowAll: () => {},
	declineAll: () => {},
	updatePreferences: () => {},
	resetConsent: () => {},
});

export function ConsentProvider({ children }: { children: React.ReactNode }) {
	const [userHasConsented, setUserHasConsented] = useState(false);
	const [preferences, setPreferences] =
		useState<ConsentPreferences>(DEFAULT_CONSENT);

	useEffect(() => {
		const storedConsent = Cookies.get("consent_prefs");
		if (storedConsent) {
			try {
				setPreferences(JSON.parse(storedConsent));
				setUserHasConsented(true);
			} catch (e) {
				console.error("Failed to parse consent cookies", e);
			}
		}
	}, []);

	const savePreferences = (newPrefs: ConsentPreferences) => {
		setPreferences(newPrefs);
		setUserHasConsented(true);
		Cookies.set("consent_prefs", JSON.stringify(newPrefs), {
			expires: 365,
		});
	};

	const allowAll = () => {
		savePreferences({
			essential: true,
			analytics: true,
			marketing: true,
		});
	};

	const declineAll = () => {
		savePreferences({
			essential: true,
			analytics: false,
			marketing: false,
		});
	};

	const updatePreferences = (partialPrefs: Partial<ConsentPreferences>) => {
		savePreferences({ ...preferences, ...partialPrefs });
	};

	const resetConsent = () => {
		setUserHasConsented(false);
	};

	return (
		<ConsentContext.Provider
			value={{
				userHasConsented,
				preferences,
				allowAll,
				declineAll,
				updatePreferences,
				resetConsent,
			}}
		>
			{children}
		</ConsentContext.Provider>
	);
}
