import { useEffect, useState } from 'react';
import PaintJobCard, { type PaintJobCardProps } from './PaintJobCard';

const placeholder = (a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='800' height='450' fill='url(#g)'/></svg>`
  )}`;

// Placeholder data until real paint jobs are available.
const slides: PaintJobCardProps[] = [
  { imageUrl: placeholder('#f6d365', '#fda085'), blurb: 'Placeholder blurb: a candy orange custom paint job.', isEdit: false },
  { imageUrl: placeholder('#4facfe', '#00f2fe'), blurb: 'Placeholder blurb: an electric blue custom paint job.', isEdit: false },
  { imageUrl: placeholder('#a18cd1', '#fbc2eb'), blurb: 'Placeholder blurb: a pearl purple custom paint job.', isEdit: false },
];

const Carousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [index]);

  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

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
