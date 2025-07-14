import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/Register';
import Verify2FA from './pages/auth/Verify2FA';
import Enable2FA from './pages/auth/Enable2FA';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import SubjectsPage from './pages/SubjectsPage';
import ServicesPage from './pages/ServicesPage';
import WorksPage from './pages/WorksPage';
import PaymentsPage from './pages/PaymentsPage';
import PropertiesPage from './pages/PropertiesPage';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify2FA" element={<Verify2FA />} />
          <Route path="/enable2FA" element={<Enable2FA />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/properties" element={<PropertiesPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;