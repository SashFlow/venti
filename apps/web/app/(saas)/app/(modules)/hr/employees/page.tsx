export default function EmployeesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Employees</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage employee profiles and organizational structure
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Employee Directory
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Browse and search employee database
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Directory
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Add Employee</h3>
					<p className="text-sm text-gray-600 mb-4">
						Onboard new employees to the system
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Add Employee
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Organization Chart
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View organizational structure and reporting lines
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Org Chart
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Employee Updates
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent employee profile updates and changes will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
