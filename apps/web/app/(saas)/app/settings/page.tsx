"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/accordion";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { CopyIcon } from "lucide-react";
import { useState } from "react";

type NotificationRule = {
	id: string;
	warehouse: string;
	period: string;
};

type ApiToken = {
	id: string;
	name: string;
	expiresIn: string;
	scope: string;
};

type WebhookEndpoint = {
	id: string;
	name: string;
	url: string;
	topic: string;
};

const WAREHOUSE_OPTIONS = [
	{ value: "bengaluru-bengaluru-ka", label: "Bengaluru | Bengaluru, KA" },
	{ value: "chennai-chennai-tn", label: "Chennai | Chennai, TN" },
];

const PERIOD_OPTIONS = [
	{ value: "1-week", label: "1 week" },
	{ value: "2-weeks", label: "2 weeks" },
	{ value: "4-weeks", label: "4 weeks" },
];

const TOKEN_EXPIRY_OPTIONS = [
	{ value: "30-days", label: "30 days" },
	{ value: "90-days", label: "90 days" },
	{ value: "no-expiry", label: "No expiry" },
];

const WEBHOOK_TOPIC_OPTIONS = [
	{ value: "inventory.lot.expiring", label: "inventory.lot.expiring" },
	{ value: "inventory.lot.expired", label: "inventory.lot.expired" },
	{ value: "order.created", label: "order.created" },
];

function getOptionLabel(
	options: { value: string; label: string }[],
	value: string,
) {
	return options.find((option) => option.value === value)?.label ?? value;
}

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("account");
	const [fullName, setFullName] = useState("Sahil");
	const [email, setEmail] = useState("sahil@company.com");
	const [theme, setTheme] = useState("system");
	const [mfaEmailEnabled, setMfaEmailEnabled] = useState(true);
	const [mfaAppEnabled, setMfaAppEnabled] = useState(false);

	const [notificationScope, setNotificationScope] = useState(
		"bengaluru-bengaluru-ka",
	);
	const [notificationPeriod, setNotificationPeriod] = useState("2-weeks");
	const [notificationRules, setNotificationRules] = useState<
		NotificationRule[]
	>([]);
	const [notificationModalOpen, setNotificationModalOpen] = useState(false);
	const [editingNotificationId, setEditingNotificationId] = useState<
		string | null
	>(null);

	const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
	const [tokenModalOpen, setTokenModalOpen] = useState(false);
	const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
	const [tokenName, setTokenName] = useState("");
	const [tokenExpiry, setTokenExpiry] = useState("90-days");
	const [tokenScope, setTokenScope] = useState("read-write");

	const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
	const [webhookModalOpen, setWebhookModalOpen] = useState(false);
	const [editingWebhookId, setEditingWebhookId] = useState<string | null>(
		null,
	);
	const [webhookName, setWebhookName] = useState("");
	const [webhookUrl, setWebhookUrl] = useState("");
	const [webhookTopic, setWebhookTopic] = useState("inventory.lot.expiring");

	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleAccountSave = () => {
		// TODO: Integrate with account settings update API.
	};

	const handleChangePassword = () => {
		setPasswordModalOpen(true);
	};

	const handleCreateNotification = () => {
		setEditingNotificationId(null);
		setNotificationModalOpen(true);
	};

	const handleEditNotification = (rule: NotificationRule) => {
		setEditingNotificationId(rule.id);
		setNotificationScope(rule.warehouse);
		setNotificationPeriod(rule.period);
		setNotificationModalOpen(true);
	};

	const handleSaveNotificationRule = () => {
		if (editingNotificationId) {
			setNotificationRules((rules) =>
				rules.map((rule) => {
					if (rule.id !== editingNotificationId) {
						return rule;
					}

					return {
						...rule,
						warehouse: notificationScope,
						period: notificationPeriod,
					};
				}),
			);
		} else {
			setNotificationRules((rules) => [
				...rules,
				{
					id: String(Date.now()),
					warehouse: notificationScope,
					period: notificationPeriod,
				},
			]);
		}

		// TODO: Integrate notification settings create/update APIs.
		setNotificationModalOpen(false);
	};

	const handleCreateApiToken = () => {
		setEditingTokenId(null);
		setTokenName("");
		setTokenExpiry("90-days");
		setTokenScope("read-write");
		setTokenModalOpen(true);
	};

	const handleEditApiToken = (token: ApiToken) => {
		setEditingTokenId(token.id);
		setTokenName(token.name);
		setTokenExpiry(token.expiresIn);
		setTokenScope(token.scope);
		setTokenModalOpen(true);
	};

	const handleSaveApiToken = () => {
		if (!tokenName.trim()) {
			return;
		}

		if (editingTokenId) {
			setApiTokens((tokens) =>
				tokens.map((token) => {
					if (token.id !== editingTokenId) {
						return token;
					}

					return {
						...token,
						name: tokenName.trim(),
						expiresIn: tokenExpiry,
						scope: tokenScope,
					};
				}),
			);
		} else {
			setApiTokens((tokens) => [
				...tokens,
				{
					id: String(Date.now()),
					name: tokenName.trim(),
					expiresIn: tokenExpiry,
					scope: tokenScope,
				},
			]);
		}

		// TODO: Integrate API token create/update endpoints.
		setTokenModalOpen(false);
	};

	const handleCreateWebhook = () => {
		setEditingWebhookId(null);
		setWebhookName("");
		setWebhookUrl("");
		setWebhookTopic("inventory.lot.expiring");
		setWebhookModalOpen(true);
	};

	const handleEditWebhook = (webhook: WebhookEndpoint) => {
		setEditingWebhookId(webhook.id);
		setWebhookName(webhook.name);
		setWebhookUrl(webhook.url);
		setWebhookTopic(webhook.topic);
		setWebhookModalOpen(true);
	};

	const handleSaveWebhook = () => {
		if (!webhookName.trim() || !webhookUrl.trim()) {
			return;
		}

		if (editingWebhookId) {
			setWebhooks((items) =>
				items.map((item) => {
					if (item.id !== editingWebhookId) {
						return item;
					}

					return {
						...item,
						name: webhookName.trim(),
						url: webhookUrl.trim(),
						topic: webhookTopic,
					};
				}),
			);
		} else {
			setWebhooks((items) => [
				...items,
				{
					id: String(Date.now()),
					name: webhookName.trim(),
					url: webhookUrl.trim(),
					topic: webhookTopic,
				},
			]);
		}

		// TODO: Integrate webhook create/update endpoints.
		setWebhookModalOpen(false);
	};

	const handleSavePassword = () => {
		if (
			!currentPassword ||
			!newPassword ||
			newPassword !== confirmPassword
		) {
			return;
		}

		// TODO: Integrate change-password endpoint.
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setPasswordModalOpen(false);
	};

	return (
		<>
			<div className="container mx-auto max-w-7xl py-8">
				<div className="mb-8">
					<h1 className="font-semibold text-2xl tracking-tight">
						Settings
					</h1>
					<p className="mt-2 text-muted-foreground">
						Manage account preferences, notifications, tokens, and
						webhooks.
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList
						variant="line"
						className="mb-6 w-full justify-start gap-2 overflow-x-auto p-0"
					>
						<TabsTrigger
							value="account"
							className="h-10 rounded-md px-4"
						>
							Account
						</TabsTrigger>
						<TabsTrigger
							value="notification-settings"
							className="h-10 rounded-md px-4"
						>
							Notification Settings
						</TabsTrigger>
						<TabsTrigger
							value="api-token"
							className="h-10 rounded-md px-4"
						>
							API Token
						</TabsTrigger>
						<TabsTrigger
							value="webhook"
							className="h-10 rounded-md px-4"
						>
							Webhook
						</TabsTrigger>
					</TabsList>

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
												setFullName(event.target.value)
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
												setEmail(event.target.value)
											}
										/>
									</div>
								</div>

								<div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
									<div>
										<h3 className="font-medium">
											Change Password
										</h3>
										<p className="text-muted-foreground text-sm">
											Update your account password
											regularly to keep your account
											secure.
										</p>
									</div>
									<Button onClick={handleChangePassword}>
										Change Password
									</Button>
								</div>

								<div className="space-y-3">
									<h3 className="font-medium">Theme</h3>
									<div className="grid gap-2 md:grid-cols-3">
										<Button
											variant={
												theme === "light"
													? "default"
													: "outline"
											}
											onClick={() => setTheme("light")}
										>
											Light
										</Button>
										<Button
											variant={
												theme === "dark"
													? "default"
													: "outline"
											}
											onClick={() => setTheme("dark")}
										>
											Dark
										</Button>
										<Button
											variant={
												theme === "system"
													? "default"
													: "outline"
											}
											onClick={() => setTheme("system")}
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
												<p className="font-medium text-sm">
													Email
												</p>
												<p className="text-muted-foreground text-xs">
													Receive one-time
													verification codes by email.
												</p>
											</div>
											<Switch
												checked={mfaEmailEnabled}
												onCheckedChange={(checked) =>
													setMfaEmailEnabled(checked)
												}
											/>
										</div>
										<div className="flex items-center justify-between gap-4">
											<div>
												<p className="font-medium text-sm">
													Authentication App
												</p>
												<p className="text-muted-foreground text-xs">
													Use an authenticator app for
													time-based verification
													codes.
												</p>
											</div>
											<Switch
												checked={mfaAppEnabled}
												onCheckedChange={(checked) =>
													setMfaAppEnabled(checked)
												}
											/>
										</div>
									</div>
								</div>

								<div className="flex justify-end">
									<Button onClick={handleAccountSave}>
										Save Changes
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value="notification-settings"
						className="space-y-4"
					>
						<h2 className="font-semibold text-3xl">
							Lot Notifications
						</h2>

						<Card className="rounded-2xl border">
							<CardHeader className="border-b">
								<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
									<CardTitle className="text-base tracking-wide uppercase">
										Add Notification
									</CardTitle>
									<Button onClick={handleCreateNotification}>
										Create
									</Button>
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
													setNotificationScope(value);
												}
											}}
										>
											<SelectTrigger className="h-11 w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="bengaluru-bengaluru-ka">
													Bengaluru | Bengaluru, KA
												</SelectItem>
												<SelectItem value="chennai-chennai-tn">
													Chennai | Chennai, TN
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label>Time period</Label>
										<Select
											value={notificationPeriod}
											onValueChange={(value) => {
												if (value) {
													setNotificationPeriod(
														value,
													);
												}
											}}
										>
											<SelectTrigger className="h-11 w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1-week">
													1 week
												</SelectItem>
												<SelectItem value="2-weeks">
													2 weeks
												</SelectItem>
												<SelectItem value="4-weeks">
													4 weeks
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-1.5">
									<p className="font-semibold text-sm">
										Explanation:
									</p>
									<p className="text-muted-foreground">
										You would be notified today if the lot
										was set to expire on 19/05/2026 for
										inventory in Bengaluru. Lots with
										expirations shorter than the selected
										time period will be excluded.
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
															WAREHOUSE_OPTIONS,
															rule.warehouse,
														)}
													</TableCell>
													<TableCell>
														{getOptionLabel(
															PERIOD_OPTIONS,
															rule.period,
														)}
													</TableCell>
													<TableCell>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleEditNotification(
																	rule,
																)
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
													No lot notification rules
													yet.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="api-token" className="space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<h2 className="font-semibold text-3xl">Tokens</h2>
							<Button onClick={handleCreateApiToken}>
								Create Token
							</Button>
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
													<TableCell>
														{token.name}
													</TableCell>
													<TableCell>
														{token.scope}
													</TableCell>
													<TableCell>
														{getOptionLabel(
															TOKEN_EXPIRY_OPTIONS,
															token.expiresIn,
														)}
													</TableCell>
													<TableCell>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleEditApiToken(
																	token,
																)
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
											You do not have any api tokens yet.
											API tokens allow api users to make
											requests on behalf of your account
											from an external source such as
											another server or webpage.
										</p>
										<div className="flex flex-wrap gap-3">
											<Button variant="default">
												Token Usage
											</Button>
											<Button variant="outline">
												API Documentation
											</Button>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="webhook" className="space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<h2 className="font-semibold text-3xl">Webhooks</h2>
							<Button onClick={handleCreateWebhook}>
								Create
							</Button>
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
													<TableCell>
														{webhook.name}
													</TableCell>
													<TableCell>
														{webhook.url}
													</TableCell>
													<TableCell>
														{getOptionLabel(
															WEBHOOK_TOPIC_OPTIONS,
															webhook.topic,
														)}
													</TableCell>
													<TableCell>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleEditWebhook(
																	webhook,
																)
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
										You do not have any webhooks yet. They
										will appear here when added.
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
											Webhooks let us send event payloads
											to your endpoint whenever selected
											events occur in your account.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="service-unavailable">
										<AccordionTrigger className="font-semibold uppercase">
											What happens if my service is
											unavailable?
										</AccordionTrigger>
										<AccordionContent>
											Delivery attempts are retried with
											backoff and failed events can be
											replayed after recovery.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="handle-webhook">
										<AccordionTrigger className="font-semibold uppercase">
											How do I handle a webhook on my
											server?
										</AccordionTrigger>
										<AccordionContent>
											Verify signatures, return a 2xx
											response quickly, and process
											payloads asynchronously to avoid
											timeout retries.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="topics-and-payloads">
										<AccordionTrigger className="font-semibold uppercase">
											What topics are available and what
											do their payloads look like?
										</AccordionTrigger>
										<AccordionContent>
											Topic catalog and payload schemas
											are documented in API documentation
											and can be tested from the webhook
											setup flow.
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			<Dialog
				open={passwordModalOpen}
				onOpenChange={setPasswordModalOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change Password</DialogTitle>
						<DialogDescription>
							Update your password for better account security.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="current-password">
								Current password
							</Label>
							<Input
								id="current-password"
								type="password"
								value={currentPassword}
								onChange={(event) =>
									setCurrentPassword(event.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-password">New password</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(event) =>
									setNewPassword(event.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">
								Confirm password
							</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(event) =>
									setConfirmPassword(event.target.value)
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setPasswordModalOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSavePassword}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={notificationModalOpen}
				onOpenChange={setNotificationModalOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingNotificationId
								? "Edit Notification Rule"
								: "Create Notification Rule"}
						</DialogTitle>
						<DialogDescription>
							Configure lot notification scope and expiration
							window.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Scope</Label>
							<Select
								value={notificationScope}
								onValueChange={(value) => {
									if (value) {
										setNotificationScope(value);
									}
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{WAREHOUSE_OPTIONS.map((option) => (
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
										setNotificationPeriod(value);
									}
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PERIOD_OPTIONS.map((option) => (
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
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setNotificationModalOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveNotificationRule}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingTokenId
								? "Edit API Token"
								: "Create API Token"}
						</DialogTitle>
						<DialogDescription>
							Create a token for external API clients and control
							its scope.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="token-name">Token name</Label>
							<Input
								id="token-name"
								value={tokenName}
								onChange={(event) =>
									setTokenName(event.target.value)
								}
								placeholder="Warehouse Sync"
							/>
						</div>
						<div className="space-y-2">
							<Label>Scope</Label>
							<Select
								value={tokenScope}
								onValueChange={(value) => {
									if (value) {
										setTokenScope(value);
									}
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="read-only">
										read-only
									</SelectItem>
									<SelectItem value="read-write">
										read-write
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Expiry</Label>
							<Select
								value={tokenExpiry}
								onValueChange={(value) => {
									if (value) {
										setTokenExpiry(value);
									}
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TOKEN_EXPIRY_OPTIONS.map((option) => (
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
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setTokenModalOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveApiToken}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={webhookModalOpen} onOpenChange={setWebhookModalOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{editingWebhookId
								? "Edit Webhook"
								: "Create Webhook"}
						</DialogTitle>
						<DialogDescription>
							Configure endpoint and topic for outgoing event
							delivery.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="webhook-name">Name</Label>
							<Input
								id="webhook-name"
								value={webhookName}
								onChange={(event) =>
									setWebhookName(event.target.value)
								}
								placeholder="Warehouse Alerts"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="webhook-url">Endpoint URL</Label>
							<Input
								id="webhook-url"
								value={webhookUrl}
								onChange={(event) =>
									setWebhookUrl(event.target.value)
								}
								placeholder="https://api.example.com/webhooks"
							/>
						</div>
						<div className="space-y-2">
							<Label>Topic</Label>
							<Select
								value={webhookTopic}
								onValueChange={(value) => {
									if (value) {
										setWebhookTopic(value);
									}
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{WEBHOOK_TOPIC_OPTIONS.map((option) => (
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
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setWebhookModalOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveWebhook}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
