using DDT.Backend.BLL.Services.File;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using Moq;
using Xunit;
using Assert = Xunit.Assert;

namespace DDT.Backend.UTL;

public class FileServiceTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IFileOperations> _fileOperationsMock;
    private readonly Mock<DDT.Backend.Common.ILogger> _loggerMock;
    private readonly FileService _fileService;

    public FileServiceTests()
    {
        
        _conversationRepositoryMock = new Mock<IConversationRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _fileOperationsMock = new Mock<IFileOperations>();
        _loggerMock = new Mock<DDT.Backend.Common.ILogger>();
    }

    [Fact]
    public async Task GetAudioFile_UserNotFound_ThrowsUnauthorizedAccessException()
    {
        var userId = 1;
        var conversationId = 1;

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync((User)null);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _fileService.GetAudioFile(userId, conversationId));
    }

    [Fact]
    public async Task GetAudioFile_ConversationNotFound_ThrowsInvalidOperationException()
    {
        var userId = 1;
        var conversationId = 1;
        var user = new User { UserId = userId };

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);

        _conversationRepositoryMock.Setup(repo => repo.GetConversationById(conversationId))
            .ReturnsAsync((Conversation)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _fileService.GetAudioFile(userId, conversationId));
    }

    [Fact]
    public async Task GetAudioFile_UnauthorizedAccessToConversation_ThrowsUnauthorizedAccessException()
    {
        var userId = 1;
        var conversationId = 1;
        var user = new User { UserId = userId };
        var conversation = new Conversation { UserId = 2 };  

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _conversationRepositoryMock.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync(conversation);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _fileService.GetAudioFile(userId, conversationId));
    }

    [Fact]
    public async Task GetAudioFile_FileNotFound_ReturnsNull()
    {
        var userId = 1;
        var conversationId = 1;
        var user = new User { UserId = userId };
        var conversation = new Conversation { UserId = userId };

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _conversationRepositoryMock.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync(conversation);

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", conversationId.ToString() + ".mp3");
        _fileOperationsMock.Setup(fo => fo.FileExists(filePath)).Returns(false);

        var result = await _fileService.GetAudioFile(userId, conversationId);

        Assert.Null(result);
    }

    // [Fact]
    // public async Task GetAudioFile_FileExists_ReturnsAudioFile()
    // {
    //     var userId = 1;
    //     var conversationId = 7;
    //     var user = new User { UserId = userId };
    //     var conversation = new Conversation { UserId = userId };
    //
    //     _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
    //     _mockConversationRepository.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync(conversation);
    //
    //     var tempDirectory = Path.Combine(Directory.GetCurrentDirectory(), "TestFiles");
    //     Directory.CreateDirectory(tempDirectory);
    //
    //     var filePath = Path.Combine(tempDirectory, conversationId + ".webm");
    //
    //     if (File.Exists(filePath)) 
    //         File.Delete(filePath);
    //     using (var fileStream = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write))
    //     using (var writer = new StreamWriter(fileStream))
    //     {
    //         writer.Write("Dummy file content for testing.");
    //     }
    //
    //     _mockFileOperations.Setup(fo => fo.FileExists(filePath)).Returns(true);
    //
    //     _mockFileOperations.Setup(fo => fo.OpenRead(filePath)).Returns(new FileStream(filePath, FileMode.Open, FileAccess.Read));
    //
    //     var result = await _fileService.GetAudioFile(userId, conversationId);
    //
    //     Assert.NotNull(result); 
    //
    //     Assert.NotNull(result.fileStream);  
    //
    //     Assert.Equal(".webm", result.fileExtension);  
    //
    //     File.Delete(filePath);
    // }
}