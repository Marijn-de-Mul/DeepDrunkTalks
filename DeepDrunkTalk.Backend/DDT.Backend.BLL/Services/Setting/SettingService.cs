using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models.Authentication;

namespace DDT.Backend.BLL.Services.Setting;

public class SettingService
{
    private readonly IUserRepository _userRepository;
    
    public SettingService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<UserSettings> GetUserSettings(int userId)
    {
        var user = await _userRepository.GetUserById(userId);
    
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }
    
        return new UserSettings
        {
            VolumeLevel = user.VolumeLevel,
            RefreshFrequency = user.RefreshFrequency
        };
    }
    
    
    public async Task UpdateUserSettings(int userId, UserSettings settings)
    {
        var user = await _userRepository.GetUserById(userId);
    
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }
    
        user.VolumeLevel = settings.VolumeLevel;
        user.RefreshFrequency = settings.RefreshFrequency;
    
        await _userRepository.UpdateUser(user);
    }
}