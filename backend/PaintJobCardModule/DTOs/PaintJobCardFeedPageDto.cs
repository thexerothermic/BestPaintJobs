namespace backend.PaintJobCardModule.DTOs;

public class PaintJobCardFeedPageDto
{
    public required List<PaintJobCardFeedItemDto> Items { get; set; }
    public required bool HasMore { get; set; }
    public int? NextBeforeId { get; set; }
}
