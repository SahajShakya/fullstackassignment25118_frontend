import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginComponent } from './components/LoginComponent';
import { RegisterComponent } from './components/RegisterComponent';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { StorePage } from './pages/StorePage';
import { WidgetPage } from './pages/WidgetPage';
import { WidgetsListPage } from './pages/WidgetsListPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Only accessible if NOT authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginComponent />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterComponent />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Only accessible if authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <StoresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/:storeId"
          element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/widget"
          element={
            <ProtectedRoute>
              <WidgetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/widgets"
          element={
            <ProtectedRoute>
              <WidgetsListPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
