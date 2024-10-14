using DDT.Backend.UserService.Common;
using DDT.Backend.UserService.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace DDT.Backend.UserService.DAL.Repositories;

public class SettingsRepository
{
    private readonly ApplicationDbContext _context;

    public SettingsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddSettingAsync(Setting setting)
    {
        _context.Settings.Add(setting);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateSettingAsync(Setting setting)
    {
        _context.Settings.Update(setting);
        await _context.SaveChangesAsync();
    }

    public async Task<Setting> GetSettingAsync(int settingId)
    {
        return await _context.Settings.FindAsync(settingId);
    }

    public async Task<List<Setting>> GetUserSettingsAsync(int userId)
    {
        return await _context.Settings.Where(s => s.UserId == userId).ToListAsync();
    }
} 