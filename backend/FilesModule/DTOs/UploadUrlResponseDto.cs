namespace backend.FilesModule.DTOs;

public class UploadUrlResponseDto
{
    public required string UploadUrl { get; set; }
    public required string PublicUrl { get; set; }
    public required string ObjectKey { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public required Dictionary<string, string> RequiredHeaders { get; set; }
}
