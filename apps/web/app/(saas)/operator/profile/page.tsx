import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export default function OperatorProfilePage() {
	return (
		<div className="mx-auto max-w-lg">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Profile</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Operator profile and device settings (label printers, scan
					preferences) — Week 4.
				</CardContent>
			</Card>
		</div>
	);
}
