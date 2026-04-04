export default function AuthenticationPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">
					Authentication & Security
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage your security settings and authentication methods
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div className="bg-white p-6 border border-gray-200 rounded-lg">
						<h3 className="text-lg font-medium mb-4">
							Password & Security
						</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">Password</span>
								<button className="text-sm text-blue-600 hover:text-blue-700">
									Change
								</button>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">
									Two-Factor Authentication
								</span>
								<button className="text-sm text-blue-600 hover:text-blue-700">
									Enable
								</button>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Recovery Codes</span>
								<button className="text-sm text-blue-600 hover:text-blue-700">
									Generate
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="bg-white p-6 border border-gray-200 rounded-lg">
						<h3 className="text-lg font-medium mb-4">
							Login Methods
						</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">Email/Password</span>
								<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
									Active
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">
									Single Sign-On (SSO)
								</span>
								<button className="text-sm text-blue-600 hover:text-blue-700">
									Configure
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
