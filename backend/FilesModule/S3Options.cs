namespace backend.FilesModule;

public class S3Options
{
    public const string SectionName = "S3";

    public string BucketName { get; set; } = "";
    public string Region { get; set; } = "";
    public string PublicBaseUrl { get; set; } = "";
    // Optional. When both are blank, the default AWS credential chain is used.
    public string AccessKeyId { get; set; } = "";
    public string SecretAccessKey { get; set; } = "";
    public int UploadUrlExpiryMinutes { get; set; } = 5;
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
}
