export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Server is Working!
        </h1>
        <p className="text-gray-600 mb-8">
          The Next.js application is running successfully.
        </p>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
            <div className="space-y-2">
              <a href="/sign-in" className="block text-blue-600 hover:text-blue-800">
                → Go to Sign In
              </a>
              <a href="/api/auth/login" className="block text-blue-600 hover:text-blue-800">
                → Test API (should return 400)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}