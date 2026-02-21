import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SeasonsPage from './pages/SeasonsPage';
import QuestionsPage from './pages/QuestionsPage';
import MatchesPage from './pages/MatchesPage';
import CreateMatchPage from './pages/CreateMatchPage';
import StageRedirectPage from './pages/StageRedirectPage';
import StagePage from './pages/StagePage';
import StageVisualPrototype from './pages/StageVisualPrototype';
import ProjectGuidePage from './pages/ProjectGuidePage';
import PublicJoinPage from './pages/PublicJoinPage';
import TournamentPage from './pages/TournamentPage';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#1f1f1f',
        color: '#eee'
      }}>
        <div style={{ fontSize: 24 }}>جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root - Public Join Page */}
      <Route path="/" element={<PublicJoinPage />} />

      {/* Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/seasons" replace /> : <LoginPage />}
      />

      {/* Protected Admin Routes */}
      <Route
        path="/seasons"
        element={
          <ProtectedRoute>
            <SeasonsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/questions"
        element={
          <ProtectedRoute>
            <QuestionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <MatchesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches/create"
        element={
          <ProtectedRoute>
            <CreateMatchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/project-guide"
        element={
          <ProtectedRoute>
            <ProjectGuidePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Redirect */}
      <Route path="/admin" element={<Navigate to="/seasons" replace />} />

      {/* Public Join Page */}
      <Route path="/join" element={<PublicJoinPage />} />

      {/* Short Stage Code Route */}
      <Route path="/s/:code" element={<StageRedirectPage />} />

      {/* Stage Game Page */}
      <Route path="/stage/:matchId" element={<StagePage />} />

      {/* Visual Prototype (Temp) */}
      <Route path="/prototype" element={<StageVisualPrototype />} />

      {/* Tournament Page */}
      <Route path="/tournament" element={<TournamentPage />} />

      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
