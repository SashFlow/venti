"use client";

import { useCookieConsent } from "@shared/hooks/cookie-consent";
import { useEffect } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY as string;

export function AnalyticsScript() {
	const { preferences } = useCookieConsent();

	useEffect(() => {
		if (!posthogKey) {
			return;
		}

		import("posthog-js").then(({ default: posthog }) => {
			if (preferences.analytics) {
				posthog.init(posthogKey, {
					api_host: "https://i.posthog.com",
					person_profiles: "identified_only",
					// HIPAA: Redact IP by default unless BAA is in place
					ip: false,
				});
				posthog.opt_in_capturing();
			} else {
				posthog.opt_out_capturing();
			}
		});
	}, [preferences.analytics]);

	return null;
}

export function useAnalytics() {
	const { preferences } = useCookieConsent();

	const trackEvent = (event: string, data?: Record<string, unknown>) => {
		if (!posthogKey || !preferences.analytics) {
			return;
		}

		import("posthog-js").then(({ default: posthog }) => {
			posthog.capture(event, data);
		});
	};

	return {
		trackEvent,
	};
}
