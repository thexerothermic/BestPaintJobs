using backend.Data;
using backend.PaintJobCardModule.DTOs;
using backend.PaintJobCardModule.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.PaintJobCardModule.Services;

public class PaintJobCardService(AppDbContext context)
{
    private readonly AppDbContext _context = context;

    public async Task<List<PaintJobCard>> GetForUserAsync(string userId)
    {
        return await _context.PaintJobCards
            .Where(c => c.Profile!.UserId == userId)
            .OrderBy(c => c.Id)
            .ToListAsync();
    }

    public async Task<PaintJobCard?> CreateAsync(string userId)
    {
        var profile = await _context.Profiles.SingleOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
        {
            return null;
        }

        var card = new PaintJobCard { ProfileId = profile.Id };
        _context.PaintJobCards.Add(card);
        await _context.SaveChangesAsync();
        return card;
    }

    public async Task<PaintJobCard?> UpdateAsync(string userId, PaintJobCardUpdateDto dto)
    {
        var card = await _context.PaintJobCards
            .SingleOrDefaultAsync(c => c.Id == dto.Id && c.Profile!.UserId == userId);
        if (card == null)
        {
            return null;
        }

        card.ImageUrl = dto.ImageUrl;
        card.Blurb = dto.Blurb;
        await _context.SaveChangesAsync();
        return card;
    }
}
