import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/Register';
import Verify2FA from './pages/auth/Verify2FA';
import Enable2FA from './pages/auth/Enable2FA';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import SubjectsPage from './pages/SubjectsPage';
import ServicesPage from './pages/ServicesPage';
import ServicesDetailPage from './pages/ServicesDetailPage';
import WorksPage from './pages/WorksPage';
import WorkDetailPage from './pages/WorkDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import PropertiesPage from './pages/PropertiesPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import PropertyDetailPage from './pages/PropertyDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify2FA" element={<Verify2FA />} />
          <Route path="/enable2FA" element={<Enable2FA />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/subjects/:id" element={<SubjectDetailPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/services/:id" element={<ServicesDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/works/:id" element={<WorkDetailPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/payments/:id" element={<PaymentDetailPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
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