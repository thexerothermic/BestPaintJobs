export interface PaintJobCardProps {
  imageUrl: string;
  blurb: string;
  isEdit: boolean;
  onAddImage?: () => void;
  onBlurbChange?: (blurb: string) => void;
  onSave?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

const PaintJobCard = ({
  imageUrl,
  blurb,
  isEdit,
  onAddImage,
  onBlurbChange,
  onSave,
  saveStatus = 'idle',
}: PaintJobCardProps) => (
  <article className="paint-job-card">
    {imageUrl ? (
      <img src={imageUrl} alt={blurb} className="paint-job-card-image" />
    ) : (
      isEdit && (
        <button type="button" className="paint-job-card-add-image" onClick={onAddImage}>
          <span className="paint-job-card-add-image-icon" aria-hidden="true">🖼</span>
          Add Image
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
          {saveStatus === 'error' && <span className="profile-status err">Could not save.</span>}
        </>
      ) : (
        <p className="paint-job-card-blurb">{blurb}</p>
      )}
    </div>
  </article>
);

export default PaintJobCard;
