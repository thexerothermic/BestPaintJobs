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

    public async Task<PaintJobCardFeedPageDto> GetFeedPageAsync(int? beforeId, int pageSize)
    {
        var query = _context.PaintJobCards.AsNoTracking().Where(c => c.ImageUrl != "");
        if (beforeId.HasValue)
        {
            query = query.Where(c => c.Id < beforeId.Value);
        }

        var rows = await query
            .OrderByDescending(c => c.Id)
            .Take(pageSize + 1)
            .Select(c => new PaintJobCardFeedItemDto { Id = c.Id, ImageUrl = c.ImageUrl, Blurb = c.Blurb })
            .ToListAsync();

        var hasMore = rows.Count > pageSize;
        var items = rows.Take(pageSize).ToList();
        return new PaintJobCardFeedPageDto
        {
            Items = items,
            HasMore = hasMore,
            NextBeforeId = hasMore ? items[^1].Id : null
        };
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
