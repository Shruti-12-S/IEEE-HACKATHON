import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
    <div>
      <h1 className="text-5xl font-bold text-slate-900">404</h1>
      <p className="mt-3 text-slate-600">That page is not available.</p>
      <Link className="btn-primary mt-6" to="/">Go home</Link>
    </div>
  </div>
);

export default NotFound;
