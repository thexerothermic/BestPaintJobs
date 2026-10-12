using System;

namespace backend.Profile.Models;

public class Profile
{
    // The unique identifier for the profile in our database
    public int Id { get; set; }
    // The User ID that comes from Auth0
    public string UserId { get; set; }
    public string? DisplayName { get; set;}
}
