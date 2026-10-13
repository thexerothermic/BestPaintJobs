namespace backend.PaintJobCardModule.DTOs;

public class PaintJobCardUpdateDto
{
    public required int Id { get; set; }
    public required string ImageUrl { get; set; }
    public required string Blurb { get; set; }
}
