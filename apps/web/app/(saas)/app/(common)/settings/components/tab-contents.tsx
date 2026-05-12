import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/accordion";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { TabsContent } from "@repo/ui/tabs";
import { CopyIcon } from "lucide-react";

export type NotificationRule = {
	id: string;
	warehouse: string;
	period: string;
};

export type ApiToken = {
	id: string;
	name: string;
	expiresIn: string;
	scope: string;
};

export type WebhookEndpoint = {
	id: string;
	name: string;
	url: string;
	topic: string;
};

export type Option = {
	value: string;
	label: string;
};

type AccountTabContentProps = {
	fullName?: string;
	email?: string;
	theme?: string;
	mfaEmailEnabled: boolean;
	mfaAppEnabled: boolean;
	saving?: boolean;
	onFullNameChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	onThemeChange: (value: string) => void;
	onMfaEmailChange: (checked: boolean) => void;
	onMfaAppChange: (checked: boolean) => void;
	onChangePassword: () => void;
	onSave: () => void;
};

export function AccountTabContent({
	fullName,
	email,
	theme,
	mfaEmailEnabled,
	mfaAppEnabled,
	saving,
	onFullNameChange,
	onEmailChange,
	onThemeChange,
	onMfaEmailChange,
	onMfaAppChange,
	onChangePassword,
	onSave,
}: AccountTabContentProps) {
	return (
		<TabsContent value="account" className="space-y-4">
			<Card className="rounded-2xl border">
				<CardHeader>
					<CardTitle>Account</CardTitle>
				</CardHeader>
				<CardContent className="space-y-8">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="full-name">Name</Label>
							<Input
								id="full-name"
								value={fullName}
								onChange={(event) =>
									onFullNameChange(event.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(event) =>
									onEmailChange(event.target.value)
								}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h3 className="font-medium">Change Password</h3>
							<p className="text-muted-foreground text-sm">
								Update your account password regularly to keep
								your account secure.
							</p>
						</div>
						<Button onClick={onChangePassword}>
							Change Password
						</Button>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">Theme</h3>
						<div className="grid gap-2 md:grid-cols-3">
							<Button
								variant={
									theme === "light" ? "default" : "outline"
								}
								onClick={() => onThemeChange("light")}
							>
								Light
							</Button>
							<Button
								variant={
									theme === "dark" ? "default" : "outline"
								}
								onClick={() => onThemeChange("dark")}
							>
								Dark
							</Button>
							<Button
								variant={
									theme === "system" ? "default" : "outline"
								}
								onClick={() => onThemeChange("system")}
							>
								System
							</Button>
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">Enable MFA</h3>
						<div className="space-y-3 rounded-lg border p-4">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="font-medium text-sm">Email</p>
									<p className="text-muted-foreground text-xs">
										Receive one-time verification codes by
										email.
									</p>
								</div>
								<Switch
									checked={mfaEmailEnabled}
									onCheckedChange={onMfaEmailChange}
								/>
							</div>
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="font-medium text-sm">
										Authentication App
									</p>
									<p className="text-muted-foreground text-xs">
										Use an authenticator app for time-based
										verification codes.
									</p>
								</div>
								<Switch
									checked={mfaAppEnabled}
									onCheckedChange={onMfaAppChange}
								/>
							</div>
						</div>
					</div>

					<div className="flex justify-end">
						<Button onClick={onSave} disabled={saving}>
							{saving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type NotificationSettingsTabContentProps = {
	notificationScope: string;
	notificationPeriod: string;
	notificationRules: NotificationRule[];
	warehouseOptions: Option[];
	periodOptions: Option[];
	onNotificationScopeChange: (value: string) => void;
	onNotificationPeriodChange: (value: string) => void;
	onCreateNotification: () => void;
	onEditNotification: (rule: NotificationRule) => void;
	getOptionLabel: (options: Option[], value: string) => string;
};

export function NotificationSettingsTabContent({
	notificationScope,
	notificationPeriod,
	notificationRules,
	warehouseOptions,
	periodOptions,
	onNotificationScopeChange,
	onNotificationPeriodChange,
	onCreateNotification,
	onEditNotification,
	getOptionLabel,
}: NotificationSettingsTabContentProps) {
	return (
		<TabsContent value="notification-settings" className="space-y-4">
			<Card className="rounded-2xl border">
				<CardHeader className="border-b">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<CardTitle className="text-base tracking-wide uppercase">
							Add Notification
						</CardTitle>
						<Button onClick={onCreateNotification}>Create</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6 pt-6">
					<div className="grid gap-4 lg:grid-cols-2">
						<div className="space-y-2">
							<Label>Scope</Label>
							<Select
								value={notificationScope}
								onValueChange={(value) => {
									if (value) {
										onNotificationScopeChange(value);
									}
								}}
							>
								<SelectTrigger className="h-11 w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{warehouseOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Time period</Label>
							<Select
								value={notificationPeriod}
								onValueChange={(value) => {
									if (value) {
										onNotificationPeriodChange(value);
									}
								}}
							>
								<SelectTrigger className="h-11 w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{periodOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-1.5">
						<p className="font-semibold text-sm">Explanation:</p>
						<p className="text-muted-foreground">
							You would be notified today if the lot was set to
							expire on 19/05/2026 for inventory in Bengaluru.
							Lots with expirations shorter than the selected time
							period will be excluded.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="rounded-2xl border">
				<CardContent className="pt-3">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="font-semibold uppercase">
									Warehouse
								</TableHead>
								<TableHead className="font-semibold uppercase">
									Time period
								</TableHead>
								<TableHead className="font-semibold uppercase">
									Action
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{notificationRules.length ? (
								notificationRules.map((rule) => (
									<TableRow key={rule.id}>
										<TableCell>
											{getOptionLabel(
												warehouseOptions,
												rule.warehouse,
											)}
										</TableCell>
										<TableCell>
											{getOptionLabel(
												periodOptions,
												rule.period,
											)}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onEditNotification(rule)
												}
											>
												Edit
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										className="py-6 text-muted-foreground"
										colSpan={3}
									>
										No lot notification rules yet.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type ApiTokenTabContentProps = {
	apiTokens: ApiToken[];
	tokenExpiryOptions: Option[];
	onCreateApiToken: () => void;
	onEditApiToken: (token: ApiToken) => void;
	getOptionLabel: (options: Option[], value: string) => string;
};

export function ApiTokenTabContent({
	apiTokens,
	tokenExpiryOptions,
	onCreateApiToken,
	onEditApiToken,
	getOptionLabel,
}: ApiTokenTabContentProps) {
	return (
		<TabsContent value="api-token" className="space-y-4">
			<div className="flex flex-wrap items-center justify-end gap-3">
				<Button onClick={onCreateApiToken}>Create Token</Button>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="space-y-6 pt-6">
					{apiTokens.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="font-semibold uppercase">
										Name
									</TableHead>
									<TableHead className="font-semibold uppercase">
										Scope
									</TableHead>
									<TableHead className="font-semibold uppercase">
										Expiry
									</TableHead>
									<TableHead className="font-semibold uppercase">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{apiTokens.map((token) => (
									<TableRow key={token.id}>
										<TableCell>{token.name}</TableCell>
										<TableCell>{token.scope}</TableCell>
										<TableCell>
											{getOptionLabel(
												tokenExpiryOptions,
												token.expiresIn,
											)}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onEditApiToken(token)
												}
											>
												Edit
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<>
							<p className="text-lg text-foreground/90">
								You do not have any api tokens yet. API tokens
								allow api users to make requests on behalf of
								your account from an external source such as
								another server or webpage.
							</p>
							<div className="flex flex-wrap gap-3">
								<Button variant="default">Token Usage</Button>
								<Button variant="outline">
									API Documentation
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type WebhookTabContentProps = {
	webhooks: WebhookEndpoint[];
	webhookTopicOptions: Option[];
	onCreateWebhook: () => void;
	onEditWebhook: (webhook: WebhookEndpoint) => void;
	getOptionLabel: (options: Option[], value: string) => string;
};

export function WebhookTabContent({
	webhooks,
	webhookTopicOptions,
	onCreateWebhook,
	onEditWebhook,
	getOptionLabel,
}: WebhookTabContentProps) {
	return (
		<TabsContent value="webhook" className="space-y-4">
			<div className="flex flex-wrap items-center justify-end gap-3">
				<Button onClick={onCreateWebhook}>Create</Button>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="pt-6">
					{webhooks.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="font-semibold uppercase">
										Name
									</TableHead>
									<TableHead className="font-semibold uppercase">
										Endpoint
									</TableHead>
									<TableHead className="font-semibold uppercase">
										Topic
									</TableHead>
									<TableHead className="font-semibold uppercase">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{webhooks.map((webhook) => (
									<TableRow key={webhook.id}>
										<TableCell>{webhook.name}</TableCell>
										<TableCell>{webhook.url}</TableCell>
										<TableCell>
											{getOptionLabel(
												webhookTopicOptions,
												webhook.topic,
											)}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onEditWebhook(webhook)
												}
											>
												Edit
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-lg text-foreground/90">
							You do not have any webhooks yet. They will appear
							here when added.
						</p>
					)}
				</CardContent>
			</Card>

			<Card className="rounded-2xl border">
				<CardHeader className="border-b">
					<CardTitle className="text-base tracking-wide uppercase">
						FAQ
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 pt-4">
					<div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
						<p className="font-semibold uppercase">
							What is my webhook secret?
						</p>
						<div className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 md:max-w-[420px]">
							<CopyIcon className="size-4 text-muted-foreground" />
							<Input
								readOnly
								value="Hqic0C1wI4ogr3KGhyCA676eB/QSCl4BEGmu5WD+830="
								className="h-auto border-0 p-0 focus-visible:ring-0"
							/>
						</div>
					</div>

					<Accordion>
						<AccordionItem value="what-are-webhooks">
							<AccordionTrigger className="font-semibold uppercase">
								What are webhooks?
							</AccordionTrigger>
							<AccordionContent>
								Webhooks let us send event payloads to your
								endpoint whenever selected events occur in your
								account.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="service-unavailable">
							<AccordionTrigger className="font-semibold uppercase">
								What happens if my service is unavailable?
							</AccordionTrigger>
							<AccordionContent>
								Delivery attempts are retried with backoff and
								failed events can be replayed after recovery.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="handle-webhook">
							<AccordionTrigger className="font-semibold uppercase">
								How do I handle a webhook on my server?
							</AccordionTrigger>
							<AccordionContent>
								Verify signatures, return a 2xx response
								quickly, and process payloads asynchronously to
								avoid timeout retries.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="topics-and-payloads">
							<AccordionTrigger className="font-semibold uppercase">
								What topics are available and what do their
								payloads look like?
							</AccordionTrigger>
							<AccordionContent>
								Topic catalog and payload schemas are documented
								in API documentation and can be tested from the
								webhook setup flow.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
