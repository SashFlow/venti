import { cn } from "@repo/ui/utils";
import { useCookieConsent } from "@shared/hooks/cookie-consent";
import { LocaleLink } from "../../../../i18n/routing";

export function Footer() {
	const { resetConsent } = useCookieConsent();

	return (
		<footer
			className={cn(
				"container max-w-6xl py-6 text-center text-foreground/60 text-xs",
			)}
		>
			<LocaleLink href="/legal/privacy-policy">Privacy policy</LocaleLink>
			<span className="opacity-50"> | </span>
			<LocaleLink href="/legal/terms">Terms and conditions</LocaleLink>
			<span className="opacity-50"> | </span>
			<button
				type="button"
				onClick={() => resetConsent()}
				className="hover:underline"
			>
				Do Not Sell My Personal Information
			</button>
		</footer>
	);
}
