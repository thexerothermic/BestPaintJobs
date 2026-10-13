import { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { clearCachedProfile } from './profiles/services/profile-service';

const UserMenu = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const showProfile = () => {
    setOpen(false);
    navigate('/profile');
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
        </svg>
        <svg className={`user-menu-caret${open ? ' open' : ''}`} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          {isAuthenticated ? (
            <>
              <button role="menuitem" onClick={showProfile}>Profile</button>
              <button
                role="menuitem"
                onClick={() => {
                  clearCachedProfile();
                  logout({ logoutParams: { returnTo: window.location.origin } });
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button role="menuitem" onClick={() => loginWithRedirect()}>Sign in</button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
