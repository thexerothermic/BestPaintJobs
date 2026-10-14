using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Authentication;
using backend.PaintJobCardModule.DTOs;
using backend.PaintJobCardModule.Services;
using backend.FilesModule.Services;

namespace backend.PaintJobCardModule.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaintJobCardController(
        PaintJobCardService paintJobCardService,
        AuthenticationService authenticationService,
        FileStorageService fileStorageService) : ControllerBase
    {
        private const int DefaultFeedPageSize = 10;
        private const int MaxFeedPageSize = 50;
        private readonly PaintJobCardService _paintJobCardService = paintJobCardService;
        private readonly AuthenticationService _authenticationService = authenticationService;
        private readonly FileStorageService _fileStorageService = fileStorageService;

        [HttpGet]
        public async Task<IActionResult> GetMyPaintJobCards()
        {
            var cards = await _paintJobCardService.GetForUserAsync(_authenticationService.GetUserId());
            return Ok(cards.Select(c => new { c.Id, c.ImageUrl, c.Blurb }));
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed([FromQuery] int? beforeId, [FromQuery] int pageSize = DefaultFeedPageSize)
        {
            pageSize = Math.Clamp(pageSize, 1, MaxFeedPageSize);
            return Ok(await _paintJobCardService.GetFeedPageAsync(beforeId, pageSize));
        }

        [HttpPost]
        public async Task<IActionResult> CreatePaintJobCard()
        {
            var card = await _paintJobCardService.CreateAsync(_authenticationService.GetUserId());
            if (card == null)
            {
                return NotFound();
            }
            return Ok(new { card.Id, card.ImageUrl, card.Blurb });
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePaintJobCard([FromBody] PaintJobCardUpdateDto dto)
        {
            if (!_fileStorageService.IsOwnedImageUrl(dto.Id, dto.ImageUrl))
            {
                return BadRequest("Invalid image URL.");
            }

            var card = await _paintJobCardService.UpdateAsync(_authenticationService.GetUserId(), dto);
            if (card == null)
            {
                return NotFound();
            }
            return Ok(new { card.Id, card.ImageUrl, card.Blurb });
        }
    }
}
