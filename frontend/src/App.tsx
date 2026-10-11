import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import Carousel from './Carousel';
import NavBar from './NavBar';
import ProfilePage from './ProfilePage';
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">Something went wrong</div>
          <div className="error-sub-message">{error.message}</div>
        </div>
      </div>
    );
  }

  const home = (
    <div className="main-card-wrapper">
      <h1 className="main-title">{isAuthenticated ? "The latest hot paint jobs" : "Welcome to Best Paint Jobs"}</h1>
      <p className="main-subtitle">The best place to find, share, and enjoy custom vehicle paint jobs.</p>

      {isAuthenticated ? (
        <div className="logged-in-section">
          <Carousel />
        </div>
      ) : (
        <>
          <Carousel />
          <div className="action-card">
            <p className="action-text">Get started by signing in to your account</p>
            <LoginButton />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <NavBar />
      <Routes>
        <Route path="/" element={home} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
