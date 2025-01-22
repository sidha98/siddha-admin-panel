import React, { Suspense } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { CSpinner } from '@coreui/react';
import './scss/style.scss';
import './scss/examples.scss';
import AdminLogin from './components/login';
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
// const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
// const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

const App = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };
  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" name="Login Page" element={<AdminLogin />} />
          <Route path="/register" name="Register Page" element={<Register />} />
          {/* <Route path="/404" name="Page 404" element={<Page404 />} />
          <Route path="/500" name="Page 500" element={<Page500 />} /> */}
          {/* Private Routes */}
          <Route
            path="*"
            name="Default Layout"
            element={<PrivateRoute element={<DefaultLayout />} />}
          />

          {/* Redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
