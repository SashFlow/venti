export default function ActivityPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Account Activity</h2>
				<p className="text-sm text-muted-foreground mt-1">
					View your recent account activity and login history
				</p>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg">
				<div className="p-6 border-b border-gray-200">
					<h3 className="text-lg font-medium">Recent Activity</h3>
				</div>
				<div className="divide-y divide-gray-200">
					{/* Sample activity items */}
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-green-400 rounded-full" />
								<div>
									<p className="text-sm font-medium">
										Logged in from Chrome
									</p>
									<p className="text-xs text-gray-500">
										IP: 192.168.1.100 • 2 hours ago
									</p>
								</div>
							</div>
							<span className="text-xs text-gray-400">
								Success
							</span>
						</div>
					</div>

					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-blue-400 rounded-full" />
								<div>
									<p className="text-sm font-medium">
										Updated profile settings
									</p>
									<p className="text-xs text-gray-500">
										1 day ago
									</p>
								</div>
							</div>
							<span className="text-xs text-gray-400">
								Update
							</span>
						</div>
					</div>

					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-green-400 rounded-full" />
								<div>
									<p className="text-sm font-medium">
										Logged in from Firefox
									</p>
									<p className="text-xs text-gray-500">
										IP: 192.168.1.100 • 3 days ago
									</p>
								</div>
							</div>
							<span className="text-xs text-gray-400">
								Success
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
