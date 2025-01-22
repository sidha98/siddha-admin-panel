import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react';

// routes config
import routes from '../routes';
import PrivateRoute from '../privateRoute';

const AppContent = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    <PrivateRoute
                      element={<route.element />}
                      isAuthenticated={isAuthenticated}
                    />
                  }
                />
              )
            );
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route
            path="/login"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
