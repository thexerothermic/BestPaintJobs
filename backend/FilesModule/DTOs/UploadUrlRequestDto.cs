namespace backend.FilesModule.DTOs;

public class UploadUrlRequestDto
{
    public required int CardId { get; set; }
    public required string ContentType { get; set; }
    public required long FileSizeBytes { get; set; }
}
