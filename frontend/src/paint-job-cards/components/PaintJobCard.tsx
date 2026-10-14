import { useRef } from 'react';
import { ALLOWED_UPLOAD_TYPES } from '../../files/services/file-service';

export interface PaintJobCardProps {
  imageUrl: string;
  blurb: string;
  isEdit: boolean;
  onAddImage?: (file: File) => void;
  onBlurbChange?: (blurb: string) => void;
  onSave?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'uploading';
  errorMessage?: string;
}

const PaintJobCard = ({
  imageUrl,
  blurb,
  isEdit,
  onAddImage,
  onBlurbChange,
  onSave,
  saveStatus = 'idle',
  errorMessage,
}: PaintJobCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploading = saveStatus === 'uploading';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onAddImage?.(file);
  };

  return (
  <article className="paint-job-card">
    {isEdit && (
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_UPLOAD_TYPES.join(',')}
        hidden
        onChange={handleFileChange}
      />
    )}
    {imageUrl ? (
      <img src={imageUrl} alt={blurb} className="paint-job-card-image" />
    ) : (
      isEdit && (
        <button
          type="button"
          className="paint-job-card-add-image"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <span className="paint-job-card-add-image-icon" aria-hidden="true">🖼</span>
          {uploading ? 'Uploading...' : 'Add Image'}
        </button>
      )
    )}
    <div className="paint-job-card-body">
      {isEdit ? (
        <>
          <textarea
            className="paint-job-card-blurb-input"
            value={blurb}
            placeholder="Describe this paint job"
            onChange={(e) => onBlurbChange?.(e.target.value)}
            rows={3}
          />
          <button
            type="button"
            className="paint-job-card-edit"
            onClick={onSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
          </button>
          {saveStatus === 'error' && (
            <span className="profile-status err">{errorMessage ?? 'Could not save.'}</span>
          )}
        </>
      ) : (
        <p className="paint-job-card-blurb">{blurb}</p>
      )}
    </div>
  </article>
  );
};

export default PaintJobCard;
