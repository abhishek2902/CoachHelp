import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
        <p className="text-xl mt-4 text-gray-600">Page Not Found</p>
        <p className="mt-2 text-gray-500">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 transition duration-300"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
