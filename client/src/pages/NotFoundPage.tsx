import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white px-4">
      <div className="text-7xl mb-4">🔗</div>
      <h1 className="text-3xl font-bold mb-2">URL Not Found</h1>
      <p className="mb-6 text-zinc-400">Sorry, the link you are looking for does not exist or has expired.</p>
      <Link to="/" className="px-6 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-colors">
        Go Home
      </Link>
    </div>
  );
} 