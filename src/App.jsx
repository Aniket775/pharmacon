import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Specification Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProjectPage from './pages/ProjectPage';
import ProblemUsersPage from './pages/ProblemUsersPage';
import ProposedSystemPage from './pages/ProposedSystemPage';
import PrototypePage from './pages/PrototypePage';
import ValidationPage from './pages/ValidationPage';
import FeasibilityPage from './pages/FeasibilityPage';
import EvaluationPage from './pages/EvaluationPage';
import RoadmapPage from './pages/RoadmapPage';
import TeamPage from './pages/TeamPage';
import PresentationsPage from './pages/PresentationsPage';
import PlanningPresentationV1Page from './pages/PlanningPresentationV1Page';
import PlanningPresentationV2Page from './pages/PlanningPresentationV2Page';
import VersionsPage from './pages/VersionsPage';
import DeliverablesPage from './pages/DeliverablesPage';
import SoftwareGridPage from './pages/SoftwareGridPage';
import DoctorAdaptationPage from './pages/DoctorAdaptationPage';
import CorrectionsPage from './pages/CorrectionsPage';
import AuditPage from './pages/AuditPage';
import InventoryPage from './pages/InventoryPage';
import PrescriptionDetailPage from './pages/PrescriptionDetailPage';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ClinicDashboard from './pages/dashboards/ClinicDashboard';
import PharmacyDashboard from './pages/dashboards/PharmacyDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-brand-dark">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public & Presentation Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/problem-users" element={<ProblemUsersPage />} />
          <Route path="/proposed-system" element={<ProposedSystemPage />} />
          <Route path="/prototype" element={<PrototypePage />} />
          <Route path="/prescriptions/:id" element={<PrescriptionDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/feasibility" element={<FeasibilityPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/presentations" element={<PresentationsPage />} />
          <Route path="/presentation/v1" element={<PlanningPresentationV1Page />} />
          <Route path="/presentation/v2" element={<PlanningPresentationV2Page />} />
          <Route path="/versions" element={<VersionsPage />} />
          <Route path="/deliverables" element={<DeliverablesPage />} />
          <Route path="/software-grid" element={<SoftwareGridPage />} />
          <Route path="/doctor-adaptation" element={<DoctorAdaptationPage />} />
          <Route path="/corrections" element={<CorrectionsPage />} />
          <Route path="/audit" element={<AuditPage />} />

          {/* Role Protected Dashboards */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'instructor']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin', 'instructor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/clinic"
            element={
              <ProtectedRoute allowedRoles={['clinic-staff', 'admin', 'instructor']}>
                <ClinicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy"
            element={
              <ProtectedRoute allowedRoles={['pharmacist', 'admin', 'instructor']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRoles={['patient', 'admin', 'instructor']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
