using DDT.Backend.BLL.Helpers;
using DDT.Backend.BLL.Services;
using DDT.Backend.Common;
using DDT.Backend.Common.Exceptions;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using DDT.Backend.Common.Models.Authentication;
using Moq;
using Xunit;
using Assert = Xunit.Assert;

namespace DDT.Backend.UTL;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ILogger> _loggerMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        Environment.SetEnvironmentVariable("JWT_SECRET", "d349e3a2f3b7cafa3737752ef9a1da8271ff6ff54666ceabe18033a0721daca882c490ac264cd867d6c6ff5ac64e06889be2aa342f912186b749ff7d18ef5824c8f770c5eefee1e4b7f386c598d9939d3cfce32c6ae51a022367862ce98ebd9caa7659092e8200061a27c680a21f74920dd0d64c345cbfc5fe86e7db2ba1d7b22a497354cd9bc06247f9bcfa6b2966ab5587453967f9018d69327c1ef5664ef4c18f4caa6173c030f3492fa9bfb45a91dc636cde1a7eaab2b7dcd782bfc28d818dc86c49dcc0ee2e8a86f87106c7e32327ca94dee546356135882ed2dcbd0158b1022dc0f40d927f311ad49f399754c4a5d5eeed07181349b87bc1b408886da1583f8883fe51d07f792bb2026b40d03f94328e83196e0d8680e4fcfb2febb37cbe45588110a65c7bfd3b1f4ca9e30a88b03d193bb9467bc1d40f8c974cf14bae43eaa9281ff47c7fc8c978daf22e1e973f65daa0993013cb6c053fce88fab67f9e447562f408885d4a8e16c189c8d9b4b1df4de2e00ace3ca2c5d885972e597714076b777320a0e21bc357ff7f4b9204fa307b654a306a1a5da26789cdaf7cf33c7fc64e45e4f22521914e7b3141c6454aebb85b39a4388e6308950990fb3dba37488c96e1d180ff170c8852e560fa6a0752369e861e99a29db23ea6e3e255528b990d1b2e8a1588edce881903759f20e18546323d9cbbac0699ebf131b019f3");
        _userRepositoryMock = new Mock<IUserRepository>();
        _loggerMock = new Mock<ILogger>();
        _authService = new AuthService(_userRepositoryMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task RegisterUser_ShouldRegisterUser_WhenValidRequest()
    {
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john.doe@example.com",
            Password = "password123",
            ConfirmPassword = "password123"
        };

        _userRepositoryMock.Setup(repo => repo.GetUserByEmail(It.IsAny<string>())).ReturnsAsync((User)null);
        _userRepositoryMock.Setup(repo => repo.UserExists(It.IsAny<int>())).ReturnsAsync(false);
        _userRepositoryMock.Setup(repo => repo.AddUser(It.IsAny<User>())).Returns(Task.CompletedTask);

        var token = await _authService.RegisterUser(request);

        Assert.NotNull(token);
        _userRepositoryMock.Verify(repo => repo.GetUserByEmail(request.Email), Times.Once);
        _userRepositoryMock.Verify(repo => repo.AddUser(It.IsAny<User>()), Times.Once);
        _loggerMock.Verify(logger => logger.LogInformation(It.IsAny<string>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task RegisterUser_ShouldThrowException_WhenUserAlreadyExists()
    {
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john.doe@example.com",
            Password = "password123",
            ConfirmPassword = "password123"
        };

        _userRepositoryMock.Setup(repo => repo.GetUserByEmail(request.Email)).ReturnsAsync(new User());
        _userRepositoryMock.Setup(repo => repo.UserExists(It.IsAny<int>())).ReturnsAsync(true);

        await Assert.ThrowsAsync<UserAlreadyExistsException>(() => _authService.RegisterUser(request));
        _userRepositoryMock.Verify(repo => repo.GetUserByEmail(request.Email), Times.Once);
    }

    [Fact]
    public async Task LoginUser_ShouldReturnToken_WhenValidCredentials()
    {
        var request = new LoginRequest
        {
            Email = "john.doe@example.com",
            Password = "password123"
        };

        var user = new User
        {
            UserId = 1,
            Name = "John Doe",
            Email = request.Email,
            Password = EncryptionHelper.Encrypt(request.Password)
        };

        _userRepositoryMock.Setup(repo => repo.GetUserByEmail(request.Email)).ReturnsAsync(user);

        var token = await _authService.LoginUser(request);

        Assert.NotNull(token);
        _userRepositoryMock.Verify(repo => repo.GetUserByEmail(request.Email), Times.Once);
        _loggerMock.Verify(logger => logger.LogInformation(It.IsAny<string>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task LoginUser_ShouldThrowException_WhenInvalidCredentials()
    {
        var request = new LoginRequest
        {
            Email = "john.doe@example.com",
            Password = "wrongpassword"
        };

        var user = new User
        {
            UserId = 1,
            Name = "John Doe",
            Email = request.Email,
            Password = EncryptionHelper.Encrypt("password123")
        };

        _userRepositoryMock.Setup(repo => repo.GetUserByEmail(request.Email)).ReturnsAsync(user);
        
        await Assert.ThrowsAsync<InvalidCredentialsException>(() => _authService.LoginUser(request));
        _userRepositoryMock.Verify(repo => repo.GetUserByEmail(request.Email), Times.Once);
    }
}