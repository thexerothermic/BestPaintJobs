using Amazon.S3;
using Amazon.S3.Model;
using backend.FilesModule.DTOs;
using Microsoft.Extensions.Options;

namespace backend.FilesModule.Services;

public class FileStorageService(IAmazonS3 s3, IOptions<S3Options> options)
{
    private static readonly Dictionary<string, string> AllowedContentTypes = new()
    {
        ["image/jpeg"] = "jpg",
        ["image/png"] = "png",
        ["image/webp"] = "webp",
    };

    private readonly IAmazonS3 _s3 = s3;
    private readonly S3Options _options = options.Value;

    public static string CardKeyPrefix(int cardId) => $"paint-job-cards/{cardId}/";

    public bool IsAllowedContentType(string contentType) => AllowedContentTypes.ContainsKey(contentType);

    public bool IsAllowedSize(long sizeBytes) => sizeBytes > 0 && sizeBytes <= _options.MaxFileSizeBytes;

    // True for an empty URL, or a URL under this card's key prefix in our bucket.
    public bool IsOwnedImageUrl(int cardId, string imageUrl)
    {
        if (imageUrl == "")
        {
            return true;
        }
        var prefix = $"{_options.PublicBaseUrl.TrimEnd('/')}/{CardKeyPrefix(cardId)}";
        return imageUrl.StartsWith(prefix, StringComparison.Ordinal);
    }

    public UploadUrlResponseDto GenerateUploadUrl(int cardId, string contentType)
    {
        var extension = AllowedContentTypes[contentType];
        var key = $"{CardKeyPrefix(cardId)}{Guid.NewGuid():N}.{extension}";
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.UploadUrlExpiryMinutes);

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = expiresAt,
            ContentType = contentType,
        };

        return new UploadUrlResponseDto
        {
            UploadUrl = _s3.GetPreSignedURL(request),
            PublicUrl = $"{_options.PublicBaseUrl.TrimEnd('/')}/{key}",
            ObjectKey = key,
            ExpiresAt = expiresAt,
            RequiredHeaders = new Dictionary<string, string> { ["Content-Type"] = contentType },
        };
    }
}
