export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to RentFlow
        </h1>
        <p className="text-center text-gray-600">
          Modern rental property management application
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Properties</h2>
            <p className="text-gray-600">Manage your rental properties</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Tenants</h2>
            <p className="text-gray-600">Track tenant information</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Payments</h2>
            <p className="text-gray-600">Monitor rent payments</p>
          </div>
        </div>
      </div>
    </main>
  );
}
