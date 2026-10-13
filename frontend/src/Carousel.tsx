import { useEffect, useState } from 'react';
import PaintJobCard, { type PaintJobCardProps } from './paint-job-cards/components/PaintJobCard';

// Placeholders. Need to fetch a few examples not associated with any specific user.
const placeholderSlides: PaintJobCardProps[] = [
  { imageUrl: "https://bestpaintjobs-elijah-dev-bucket.s3.us-east-2.amazonaws.com/ryan-waldman-JEJlsw73cuI-unsplash.jpg", blurb: 'Photo by Ryan Waldman on Unsplash', isEdit: false },
  { imageUrl: 'https://bestpaintjobs-elijah-dev-bucket.s3.us-east-2.amazonaws.com/chandler-cruttenden-l1hGIrEAsj0-unsplash.jpg', blurb: 'Photo by Chandler Cruttenden on Unsplash', isEdit: false },
  { imageUrl: 'https://bestpaintjobs-elijah-dev-bucket.s3.us-east-2.amazonaws.com/martin-fenton-B-T5NyeApOU-unsplash.jpg', blurb: 'Photo by martin fenton on Unsplash', isEdit: false },
];

interface CarouselProps {
  slides?: PaintJobCardProps[];
  onReachEnd?: () => void;
  hasMore?: boolean;
}

const Carousel = ({ slides = placeholderSlides, onReachEnd, hasMore = false }: CarouselProps) => {
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;
  // At the end of a paginated feed, hold position instead of wrapping so new cards can load in.
  const waitingForMore = isLast && hasMore;

  useEffect(() => {
    if (isLast && hasMore) onReachEnd?.();
  }, [isLast, hasMore, slides.length, onReachEnd]);

  useEffect(() => {
    if (slides.length === 0 || waitingForMore) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [index, slides.length, waitingForMore]);

  const go = (delta: number) => {
    if (slides.length === 0 || (delta > 0 && waitingForMore)) return;
    setIndex((i) => (i + delta + slides.length) % slides.length);
  };

  return (
    <div className="carousel" aria-roledescription="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="carousel-slide">
            <PaintJobCard {...s} />
          </div>
        ))}
      </div>
      <button className="carousel-arrow prev" onClick={() => go(-1)} aria-label="Previous image">‹</button>
      <button className="carousel-arrow next" onClick={() => go(1)} aria-label="Next image">›</button>
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === index ? ' active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
