using backend.Authentication;
using backend.FilesModule.DTOs;
using backend.FilesModule.Services;
using backend.PaintJobCardModule.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.FilesModule.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController(
        FileStorageService fileStorageService,
        PaintJobCardService paintJobCardService,
        AuthenticationService authenticationService) : ControllerBase
    {
        private readonly FileStorageService _fileStorageService = fileStorageService;
        private readonly PaintJobCardService _paintJobCardService = paintJobCardService;
        private readonly AuthenticationService _authenticationService = authenticationService;

        [HttpPost("upload-url")]
        public async Task<IActionResult> CreateUploadUrl([FromBody] UploadUrlRequestDto dto)
        {
            if (!_fileStorageService.IsAllowedContentType(dto.ContentType))
            {
                return BadRequest("Unsupported file type.");
            }
            if (!_fileStorageService.IsAllowedSize(dto.FileSizeBytes))
            {
                return BadRequest("File size is not allowed.");
            }

            var card = await _paintJobCardService.GetOwnedAsync(_authenticationService.GetUserId(), dto.CardId);
            if (card == null)
            {
                return NotFound();
            }

            return Ok(_fileStorageService.GenerateUploadUrl(card.Id, dto.ContentType));
        }
    }
}
