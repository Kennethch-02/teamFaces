import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">No Autorizado</h1>
        <p className="mb-8">No tienes permisos para acceder a esta página.</p>
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;