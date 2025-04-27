export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4 text-red-600">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-2">Sorry, the page you are looking for does not exist.</p>
      <p className="text-md text-gray-500 mb-6">More pages coming soon.</p>
      <a href="/" className="text-accent underline">Go back to Home</a>
    </div>
  )
}