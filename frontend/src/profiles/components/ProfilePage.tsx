import { useEffect, useState, type SubmitEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  getCachedProfile,
  ensureProfile,
  setCachedProfile,
  updateDisplayName,
} from '../services/profile-service';

import PaintJobCard from '../../paint-job-cards/components/PaintJobCard';
import type { PaintJobCardUpdateDto } from '../../paint-job-cards/dtos/PaintJobCardUpdateDto';
import {
  createPaintJobCard,
  getMyPaintJobCards,
  updatePaintJobCard,
} from '../../paint-job-cards/services/paint-job-card-service';

type PaintJobState = PaintJobCardUpdateDto & {
  status: 'idle' | 'saving' | 'saved' | 'error';
};

const ProfilePage = () => {
  const [paintJobs, setPaintJobs] = useState<PaintJobState[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile(){
      try {
        const accessToken = await getAccessTokenSilently();
        if (!accessToken) return;
        const profileData = await ensureProfile(accessToken);
        if (isMounted && profileData?.displayName) {
          setDisplayName(profileData.displayName);
        }
        const cardsRes = await getMyPaintJobCards(accessToken);
        if (cardsRes.ok) {
          const cards: PaintJobCardUpdateDto[] = await cardsRes.json();
          if (isMounted) {
            setPaintJobs(cards.map((c) => ({ ...c, status: 'idle' as const })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [getAccessTokenSilently]);

  const saveDisplayName = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const accessToken = await getAccessTokenSilently();
      if (!accessToken) {
        setStatus('error');
        return;
      }
      const res = await updateDisplayName({ displayName }, accessToken);
      if (res.ok) {
        const cached = getCachedProfile();
        if (cached) setCachedProfile({ ...cached, displayName });
      }
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const updateJob = (id: number, changes: Partial<PaintJobState>) =>
    setPaintJobs((jobs) => jobs.map((j) => (j.id === id ? { ...j, ...changes } : j)));

  const addPaintJob = async () => {
    try {
      const accessToken = await getAccessTokenSilently();
      if (!accessToken) return;
      const res = await createPaintJobCard(accessToken);
      if (res.ok) {
        const card = await res.json();
        setPaintJobs((jobs) => [...jobs, { ...card, status: 'idle' }]);
      }
    } catch (error) {
      console.error('Failed to create paint job card:', error);
    }
  };

  // TODO: let the user pick an image, request an upload URL from the backend,
  // upload the file to the file service, then set the card's imageUrl.
  const handleAddImage = () => {};

  const savePaintJob = async (job: PaintJobState) => {
    updateJob(job.id, { status: 'saving' });
    try {
      const accessToken = await getAccessTokenSilently();
      if (!accessToken) {
        updateJob(job.id, { status: 'error' });
        return;
      }
      const res = await updatePaintJobCard(
        { id: job.id, imageUrl: job.imageUrl, blurb: job.blurb },
        accessToken
      );
      updateJob(job.id, { status: res.ok ? 'saved' : 'error' });
    } catch {
      updateJob(job.id, { status: 'error' });
    }
  };

  return (
    <div className="main-card-wrapper profile-page">
      <h1 className="main-title">Profile</h1>
      {loadingProfile && <p>Loading profile...</p>}
      {!loadingProfile && <form className="profile-form" onSubmit={saveDisplayName}>
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
      </form>}
      {!loadingProfile && (
        <>
          <button type="button" className="add-content-item" onClick={addPaintJob}>
            <span className="add-content-item-icon" aria-hidden="true">+</span>
            Add a paint job
          </button>
          <div className="profile-paint-jobs">
            {paintJobs.map((job) => (
              <PaintJobCard
                key={job.id}
                isEdit
                imageUrl={job.imageUrl}
                blurb={job.blurb}
                saveStatus={job.status}
                onAddImage={handleAddImage}
                onBlurbChange={(blurb) => updateJob(job.id, { blurb, status: 'idle' })}
                onSave={() => savePaintJob(job)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
