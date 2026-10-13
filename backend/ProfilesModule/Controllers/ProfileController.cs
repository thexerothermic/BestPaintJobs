using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using backend.ProfilesModule.DTOs;
using Microsoft.EntityFrameworkCore;
using backend.ProfilesModule.Models;
using backend.Data;
using backend.Authentication;

namespace backend.ProfilesModule.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController(AppDbContext context, AuthenticationService authenticationService) : ControllerBase
    {
        private readonly AppDbContext _context = context;
        private readonly AuthenticationService _authenticationService = authenticationService;

        [HttpGet]
        public IActionResult GetMyProfile()
        {
            var userId = _authenticationService.GetUserId();
            var profile = _context.Profiles.SingleOrDefault(p => p.UserId == userId);
            if (profile == null)
            {
                return NotFound();
            }
            return Ok(profile);
        }

        [HttpPost]
        public IActionResult CreateMyProfile()
        {
            var userId = _authenticationService.GetUserId();
            var profile = new Profile
            {
                UserId = userId
            };
            _context.Profiles.Add(profile);
            _context.SaveChanges();
            return Ok(profile);
        }

        [HttpPost("DisplayName")]
        public IActionResult UpdateDisplayName([FromBody] DisplayNameUpdateDto dto)
        {
            var userId = _authenticationService.GetUserId();
            var profile = _context.Profiles.SingleOrDefault(p => p.UserId == userId);
            if (profile != null)
            {
                profile.DisplayName = dto.DisplayName;
                _context.SaveChanges();
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            return Ok();
        }
    }
}
