export interface PaintJobCardProps {
  imageUrl: string;
  blurb: string;
  isEdit: boolean;
}

const PaintJobCard = ({ imageUrl, blurb, isEdit }: PaintJobCardProps) => (
  <article className="paint-job-card">
    <img src={imageUrl} alt={blurb} className="paint-job-card-image" />
    <div className="paint-job-card-body">
      <p className="paint-job-card-blurb">{blurb}</p>
      {isEdit && <button className="paint-job-card-edit">Edit</button>}
    </div>
  </article>
);

export default PaintJobCard;
