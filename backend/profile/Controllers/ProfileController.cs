using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.profile.DTOs;

namespace backend.profile.controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        [HttpPost("DisplayName")]
        public IActionResult UpdateDisplayName([FromBody] DisplayNameUpdateDto dto)
        {
            // Next step here is to persist the display name to a profile table in a database
            return Ok();
        }
    }
}
