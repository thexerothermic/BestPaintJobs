export interface PaintJobCardFeedItemDto {
  id: number;
  imageUrl: string;
  blurb: string;
}

export interface PaintJobCardFeedPageDto {
  items: PaintJobCardFeedItemDto[];
  hasMore: boolean;
  nextBeforeId: number | null;
}
