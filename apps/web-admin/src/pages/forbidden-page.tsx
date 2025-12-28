export default function ForbiddenPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this resource.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Dashboard
                </a>
            </div>
        </div>
    );
}
