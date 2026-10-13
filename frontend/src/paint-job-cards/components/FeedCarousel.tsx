import Carousel from '../../Carousel';
import { usePaintJobCardFeed } from '../hooks/usePaintJobCardFeed';

const FeedCarousel = () => {
  const { cards, hasMore, loading, error, loadMore } = usePaintJobCardFeed();

  if (cards.length === 0) {
    if (loading) return <p>Loading...</p>;
    if (error) {
      return (
        <div>
          <p className="profile-status err">Could not load paint jobs.</p>
          <button type="button" className="profile-save" onClick={loadMore}>Retry</button>
        </div>
      );
    }
    return <p>No paint jobs yet — be the first to add one!</p>;
  }

  const slides = cards.map((c) => ({ imageUrl: c.imageUrl, blurb: c.blurb, isEdit: false }));

  return (
    <>
      <Carousel slides={slides} onReachEnd={loadMore} hasMore={hasMore} />
      {error && (
        <div>
          <p className="profile-status err">Could not load more paint jobs.</p>
          <button type="button" className="profile-save" onClick={loadMore}>Retry</button>
        </div>
      )}
    </>
  );
};

export default FeedCarousel;
