"use client";

import { Button } from "@repo/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import { Switch } from "@repo/ui/switch";
import { useCookieConsent } from "@shared/hooks/cookie-consent";
import { CookieIcon, Settings2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export function ConsentBanner() {
	const {
		userHasConsented,
		preferences,
		allowAll,
		declineAll,
		updatePreferences,
	} = useCookieConsent();
	const [mounted, setMounted] = useState(false);
	const [showCustomizer, setShowCustomizer] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	if (userHasConsented && !showCustomizer) {
		return null;
	}

	return (
		<>
			{!userHasConsented && (
				<div className="fixed left-4 bottom-4 max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="flex gap-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-xl">
						<CookieIcon className="block size-6 shrink-0 text-5xl text-primary/60 mt-1" />
						<div>
							<p className="text-sm leading-normal">
								We use cookies to improve your experience and
								analyze traffic. By clicking "Accept All", you
								consent to our use of all cookies. You can also
								decline non-essential cookies or customize your
								settings.
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 min-w-[100px]"
									onClick={() => declineAll()}
								>
									Decline
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="flex-1 min-w-[100px]"
									onClick={() => setShowCustomizer(true)}
								>
									<Settings2Icon className="size-4 mr-2" />
									Customize
								</Button>
								<Button
									size="sm"
									className="flex-1 min-w-[100px]"
									onClick={() => allowAll()}
								>
									Accept All
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			<Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Cookie Preferences</DialogTitle>
						<DialogDescription>
							Manage how cookies and similar technologies are used
							on our site.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="flex items-center justify-between space-x-4">
							<div className="flex-1 space-y-0.5">
								<div className="text-sm font-medium">
									Essential Cookies
								</div>
								<div className="text-xs text-muted-foreground">
									Required for the site to function. Cannot be
									disabled.
								</div>
							</div>
							<Switch checked disabled />
						</div>
						<div className="flex items-center justify-between space-x-4">
							<div className="flex-1 space-y-0.5">
								<div className="text-sm font-medium">
									Analytics Cookies
								</div>
								<div className="text-xs text-muted-foreground">
									Help us understand how visitors interact
									with the site.
								</div>
							</div>
							<Switch
								checked={preferences.analytics}
								onCheckedChange={(checked) =>
									updatePreferences({ analytics: checked })
								}
							/>
						</div>
						<div className="flex items-center justify-between space-x-4">
							<div className="flex-1 space-y-0.5">
								<div className="text-sm font-medium">
									Marketing Cookies
								</div>
								<div className="text-xs text-muted-foreground">
									Used to deliver personalized advertisements.
								</div>
							</div>
							<Switch
								checked={preferences.marketing}
								onCheckedChange={(checked) =>
									updatePreferences({ marketing: checked })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowCustomizer(false)}>
							Save & Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
