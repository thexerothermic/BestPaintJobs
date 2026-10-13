namespace backend.PaintJobCardModule.DTOs;

public class PaintJobCardFeedItemDto
{
    public required int Id { get; set; }
    public required string ImageUrl { get; set; }
    public required string Blurb { get; set; }
}
