import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type {
  PaintJobCardFeedItemDto,
  PaintJobCardFeedPageDto,
} from '../dtos/PaintJobCardFeedPageDto';
import { getPaintJobCardFeed } from '../services/paint-job-card-service';

export function usePaintJobCardFeed() {
  const { getAccessTokenSilently } = useAuth0();
  const [cards, setCards] = useState<PaintJobCardFeedItemDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const cursor = useRef<number | null>(null);
  const inFlight = useRef(false);
  const hasMoreRef = useRef(true);
  const mounted = useRef(true);

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMoreRef.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(false);
    try {
      const accessToken = await getAccessTokenSilently();
      if (!accessToken) throw new Error('No access token');
      const res = await getPaintJobCardFeed(accessToken, cursor.current);
      if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
      const page: PaintJobCardFeedPageDto = await res.json();
      if (!mounted.current) return;
      cursor.current = page.nextBeforeId;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      setCards((prev) => [...prev, ...page.items]);
    } catch (e) {
      console.error('Failed to load paint job feed:', e);
      if (mounted.current) setError(true);
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    mounted.current = true;
    loadMore();
    return () => {
      mounted.current = false;
    };
  }, [loadMore]);

  return { cards, hasMore, loading, error, loadMore };
}
