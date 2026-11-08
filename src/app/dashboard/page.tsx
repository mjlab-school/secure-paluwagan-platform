export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Paluwagan Group Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome to your savings dashboard. Manage your contribution cycles and view your turn schedule below.
      </p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800">Total Contribution</h3>
          <p className="text-2xl font-bold text-blue-900 mt-1">₱5,000</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-semibold text-green-800">Next Payout Turn</h3>
          <p className="text-2xl font-bold text-green-900 mt-1">Turn #3</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
          <h3 className="text-sm font-semibold text-purple-800">KYC Status</h3>
          <p className="text-2xl font-bold text-purple-900 mt-1">Submitted</p>
        </div>
      </div>
    </div>
  );
}