"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AccountTabContent,
	type ApiToken,
	ApiTokenTabContent,
	type NotificationRule,
	NotificationSettingsTabContent,
	type Option,
	type WebhookEndpoint,
	WebhookTabContent,
} from "./components/tab-contents";

const WAREHOUSE_OPTIONS: Option[] = [
	{ value: "bengaluru-bengaluru-ka", label: "Bengaluru | Bengaluru, KA" },
	{ value: "chennai-chennai-tn", label: "Chennai | Chennai, TN" },
];

const PERIOD_OPTIONS: Option[] = [
	{ value: "1-week", label: "1 week" },
	{ value: "2-weeks", label: "2 weeks" },
	{ value: "4-weeks", label: "4 weeks" },
];

const TOKEN_EXPIRY_OPTIONS: Option[] = [
	{ value: "30-days", label: "30 days" },
	{ value: "90-days", label: "90 days" },
	{ value: "no-expiry", label: "No expiry" },
];

const WEBHOOK_TOPIC_OPTIONS: Option[] = [
	{ value: "inventory.lot.expiring", label: "inventory.lot.expiring" },
	{ value: "inventory.lot.expired", label: "inventory.lot.expired" },
	{ value: "order.created", label: "order.created" },
];

const SETTINGS_STORAGE_KEY = "venti.settings.staged";

type StagedSettings = {
	mfaEmailEnabled: boolean;
	mfaAppEnabled: boolean;
	notificationRules: NotificationRule[];
	apiTokens: ApiToken[];
	webhooks: WebhookEndpoint[];
};

function getOptionLabel(options: Option[], value: string) {
	return options.find((option) => option.value === value)?.label ?? value;
}

export default function SettingsPage() {
	const { user, reloadSession } = useSession();
	const [activeTab, setActiveTab] = useState("account");
	const [fullName, setFullName] = useState(user?.name ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const { theme, setTheme } = useTheme();
	const [mfaEmailEnabled, setMfaEmailEnabled] = useState(true);
	const [mfaAppEnabled, setMfaAppEnabled] = useState(false);
	const [accountSaving, setAccountSaving] = useState(false);
	const [passwordSaving, setPasswordSaving] = useState(false);

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

	useEffect(() => {
		setFullName(user?.name ?? "");
		setEmail(user?.email ?? "");
	}, [user?.email, user?.name]);

	useEffect(() => {
		const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
		if (!stored) {
			return;
		}

		try {
			const parsed = JSON.parse(stored) as Partial<StagedSettings>;
			setMfaEmailEnabled(parsed.mfaEmailEnabled ?? true);
			setMfaAppEnabled(parsed.mfaAppEnabled ?? false);
			setNotificationRules(parsed.notificationRules ?? []);
			setApiTokens(parsed.apiTokens ?? []);
			setWebhooks(parsed.webhooks ?? []);
		} catch {
			window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
		}
	}, []);

	useEffect(() => {
		const stagedSettings: StagedSettings = {
			mfaEmailEnabled,
			mfaAppEnabled,
			notificationRules,
			apiTokens,
			webhooks,
		};

		window.localStorage.setItem(
			SETTINGS_STORAGE_KEY,
			JSON.stringify(stagedSettings),
		);
	}, [
		apiTokens,
		mfaAppEnabled,
		mfaEmailEnabled,
		notificationRules,
		webhooks,
	]);

	const handleAccountSave = async () => {
		if (!fullName.trim()) {
			toast.error("Name is required.");
			return;
		}

		setAccountSaving(true);

		try {
			if (fullName.trim() !== (user?.name ?? "")) {
				const { error } = await authClient.updateUser({
					name: fullName.trim(),
				});

				if (error) {
					toast.error("Failed to update your name.");
					return;
				}
			}

			if (email.trim() && email.trim() !== (user?.email ?? "")) {
				const { error } = await authClient.changeEmail({
					newEmail: email.trim(),
				});

				if (error) {
					toast.error("Failed to update your email.");
					return;
				}
			}

			await reloadSession();
			toast.success(
				"Account updated. Local security preferences are staged in this browser.",
			);
		} finally {
			setAccountSaving(false);
		}
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

		setNotificationModalOpen(false);
		toast.success("Notification rule saved locally.");
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
			toast.error("Token name is required.");
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

		setTokenModalOpen(false);
		toast.success("API token saved locally.");
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
			toast.error("Webhook name and endpoint URL are required.");
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

		setWebhookModalOpen(false);
		toast.success("Webhook saved locally.");
	};

	const handleSavePassword = async () => {
		if (
			!currentPassword ||
			!newPassword ||
			newPassword !== confirmPassword
		) {
			toast.error("Confirm the new password to continue.");
			return;
		}

		setPasswordSaving(true);

		const { error } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		});

		setPasswordSaving(false);

		if (error) {
			toast.error("Failed to update password.");
			return;
		}

		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setPasswordModalOpen(false);
		toast.success("Password updated.");
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

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex flex-col"
				>
					<TabsList
						variant="default"
						className="h-auto w-full justify-start overflow-x-auto"
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

					<AccountTabContent
						fullName={fullName}
						email={email}
						theme={theme}
						mfaEmailEnabled={mfaEmailEnabled}
						mfaAppEnabled={mfaAppEnabled}
						onFullNameChange={setFullName}
						onEmailChange={setEmail}
						onThemeChange={setTheme}
						onMfaEmailChange={setMfaEmailEnabled}
						onMfaAppChange={setMfaAppEnabled}
						onChangePassword={handleChangePassword}
						onSave={handleAccountSave}
						saving={accountSaving}
					/>

					<NotificationSettingsTabContent
						notificationScope={notificationScope}
						notificationPeriod={notificationPeriod}
						notificationRules={notificationRules}
						warehouseOptions={WAREHOUSE_OPTIONS}
						periodOptions={PERIOD_OPTIONS}
						onNotificationScopeChange={setNotificationScope}
						onNotificationPeriodChange={setNotificationPeriod}
						onCreateNotification={handleCreateNotification}
						onEditNotification={handleEditNotification}
						getOptionLabel={getOptionLabel}
					/>

					<ApiTokenTabContent
						apiTokens={apiTokens}
						tokenExpiryOptions={TOKEN_EXPIRY_OPTIONS}
						onCreateApiToken={handleCreateApiToken}
						onEditApiToken={handleEditApiToken}
						getOptionLabel={getOptionLabel}
					/>

					<WebhookTabContent
						webhooks={webhooks}
						webhookTopicOptions={WEBHOOK_TOPIC_OPTIONS}
						onCreateWebhook={handleCreateWebhook}
						onEditWebhook={handleEditWebhook}
						getOptionLabel={getOptionLabel}
					/>
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
							disabled={passwordSaving}
						>
							Cancel
						</Button>
						<Button
							onClick={() => void handleSavePassword()}
							disabled={passwordSaving}
						>
							{passwordSaving ? "Saving..." : "Save"}
						</Button>
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
