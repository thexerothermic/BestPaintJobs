import { useState, type SubmitEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

const ProfilePage = () => {
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { getAccessTokenSilently } = useAuth0();

  const save = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const accessToken = await getAccessTokenSilently();
      const res = await fetch(`${apiUrl}/profile/displayname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ displayName }),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="main-card-wrapper profile-page">
      <h1 className="main-title">Profile</h1>
      <form className="profile-form" onSubmit={save}>
        <label htmlFor="displayName">Display Name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setStatus('idle');
          }}
        />
        <button type="submit" className="profile-save" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        {status === 'saved' && <span className="profile-status ok">Saved</span>}
        {status === 'error' && <span className="profile-status err">Could not save. Please try again.</span>}
      </form>
    </div>
  );
};

export default ProfilePage;
