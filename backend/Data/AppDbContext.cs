using System;
using Microsoft.EntityFrameworkCore;
namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ProfilesModule.Models.Profile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProfilesModule.Models.Profile>().HasKey(p => p.Id);
        modelBuilder.Entity<ProfilesModule.Models.Profile>().Property(p => p.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<ProfilesModule.Models.Profile>().HasIndex(p => p.UserId).IsUnique();
    }
}
