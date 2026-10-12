using System;
using Microsoft.EntityFrameworkCore;
namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Profile.Models.Profile> Profiles { get; set; }
}
