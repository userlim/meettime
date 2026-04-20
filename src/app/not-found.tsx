import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold mb-4" style={{ color: '#14B8A6' }}>404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#14B8A6' }}
      >
        Go Back Home
      </Link>
    </div>
  )
}
