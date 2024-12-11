using DDT.Backend.BLL.Services.Setting;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using DDT.Backend.Common.Models.Authentication;
using Moq;
using Xunit;
using Assert = Xunit.Assert;

namespace DDT.Backend.UTL;

public class SettingServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly SettingService _settingService;

    public SettingServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _settingService = new SettingService(_mockUserRepository.Object);
    }

    [Fact]
    public async Task GetUserSettings_UserNotFound_ThrowsUnauthorizedAccessException()
    {
        int userId = 1;

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync((User)null);

        var exception =
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _settingService.GetUserSettings(userId));
        Assert.Equal("User not found.", exception.Message);
    }

    [Fact]
    public async Task GetUserSettings_UserFound_ReturnsUserSettings()
    {
        int userId = 1;
        var user = new User
        {
            UserId = userId,
            VolumeLevel = 5,
            RefreshFrequency = 10
        };
        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);

        var result = await _settingService.GetUserSettings(userId);

        Assert.NotNull(result);
        Assert.Equal(5, result.VolumeLevel);
        Assert.Equal(10, result.RefreshFrequency);
    }

    [Fact]
    public async Task UpdateUserSettings_UserNotFound_ThrowsUnauthorizedAccessException()
    {
        int userId = 1;
        var settings = new UserSettings
        {
            VolumeLevel = 5,
            RefreshFrequency = 10
        };

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync((User)null);

        var exception =
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _settingService.UpdateUserSettings(userId, settings));
        Assert.Equal("User not found.", exception.Message);
    }

    [Fact]
    public async Task UpdateUserSettings_UserFound_UpdatesSettings()
    {
        int userId = 1;
        var user = new User
        {
            UserId = userId,
            VolumeLevel = 2,
            RefreshFrequency = 5
        };

        var updatedSettings = new UserSettings
        {
            VolumeLevel = 8,
            RefreshFrequency = 15
        };

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);

        await _settingService.UpdateUserSettings(userId, updatedSettings);

        _mockUserRepository.Verify(repo => repo.UpdateUser(It.Is<User>(u =>
            u.VolumeLevel == updatedSettings.VolumeLevel &&
            u.RefreshFrequency == updatedSettings.RefreshFrequency
        )), Times.Once);
    }
}