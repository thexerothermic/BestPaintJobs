namespace backend.PaintJobCardModule.Models;

public class PaintJobCard
{
    public int Id { get; set; }
    public int ProfileId { get; set; }
    public ProfilesModule.Models.Profile? Profile { get; set; }
    public string ImageUrl { get; set; } = "";
    public string Blurb { get; set; } = "";
}
