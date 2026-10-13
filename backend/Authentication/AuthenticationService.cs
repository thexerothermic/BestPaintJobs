using System;

namespace backend.Authentication;

public class AuthenticationService(IHttpContextAccessor httpContextAccessor)
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public string GetUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
        {
            return "";
        }
        
        return user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ??
            user.FindFirst("sub")?.Value ??
            "";
    }

}
