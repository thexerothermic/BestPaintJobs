using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Authentication;
using backend.PaintJobCardModule.DTOs;
using backend.PaintJobCardModule.Services;

namespace backend.PaintJobCardModule.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaintJobCardController(PaintJobCardService paintJobCardService, AuthenticationService authenticationService) : ControllerBase
    {
        private readonly PaintJobCardService _paintJobCardService = paintJobCardService;
        private readonly AuthenticationService _authenticationService = authenticationService;

        [HttpGet]
        public async Task<IActionResult> GetMyPaintJobCards()
        {
            var cards = await _paintJobCardService.GetForUserAsync(_authenticationService.GetUserId());
            return Ok(cards.Select(c => new { c.Id, c.ImageUrl, c.Blurb }));
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
            var card = await _paintJobCardService.UpdateAsync(_authenticationService.GetUserId(), dto);
            if (card == null)
            {
                return NotFound();
            }
            return Ok(new { card.Id, card.ImageUrl, card.Blurb });
        }
    }
}
