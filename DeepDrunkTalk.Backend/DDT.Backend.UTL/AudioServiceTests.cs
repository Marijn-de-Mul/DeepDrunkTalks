using Moq;
using Microsoft.AspNetCore.Http;
using Xunit;
using DDT.Backend.BLL.Services.Audio;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using Assert = Xunit.Assert;

public class AudioServiceTests
{
    private Mock<IUserRepository> _mockUserRepository;
    private Mock<IConversationRepository> _mockConversationRepository;
    private Mock<IFileHandler> _mockFileHandler;
    private AudioService _audioService;

    public AudioServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockConversationRepository = new Mock<IConversationRepository>();
        _mockFileHandler = new Mock<IFileHandler>();
        _audioService = new AudioService(_mockUserRepository.Object, _mockConversationRepository.Object,
            _mockFileHandler.Object);
    }

    [Fact]
    public async Task ProcessAndStoreAudio_SuccessfulAudioProcessing_ReturnsWebAccessibleUrl()
    {
        var userId = 1;
        var conversationId = 1;
        var audioFileMock = new Mock<IFormFile>();
        var baseUrl = "http://localhost";
        var user = new User { UserId = userId };
        var conversation = new Conversation { UserId = userId, AudioFilePath = "" };

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _mockConversationRepository.Setup(repo => repo.GetConversationById(conversationId))
            .ReturnsAsync(conversation);

        _mockConversationRepository.Setup(repo => repo.UpdateConversation(It.IsAny<Conversation>()))
            .ReturnsAsync(true);

        var filePath = "path/to/audio/file";
        _mockFileHandler.Setup(fileHandler => fileHandler.SaveAudioFile(conversationId, audioFileMock.Object))
            .ReturnsAsync(filePath);

        var result =
            await _audioService.ProcessAndStoreAudio(userId, conversationId, audioFileMock.Object, baseUrl);

        Assert.Equal($"{baseUrl}/api/conversations/{conversationId}/audio", result);
        _mockConversationRepository.Verify(repo => repo.UpdateConversation(It.IsAny<Conversation>()), Times.Once);
    }

    [Fact]
    public async Task ProcessAndStoreAudio_UserNotFound_ThrowsUnauthorizedAccessException()
    {
        var userId = 1;
        var conversationId = 1;
        var audioFileMock = new Mock<IFormFile>();
        var baseUrl = "http://localhost";

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync((User)null);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _audioService.ProcessAndStoreAudio(userId, conversationId, audioFileMock.Object, baseUrl));
    }

    [Fact]
    public async Task ProcessAndStoreAudio_ConversationNotFound_ThrowsInvalidOperationException()
    {
        var userId = 1;
        var conversationId = 1;
        var audioFileMock = new Mock<IFormFile>();
        var baseUrl = "http://localhost";
        var user = new User { UserId = userId };

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _mockConversationRepository.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync((Conversation)null); // Conversation not found

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _audioService.ProcessAndStoreAudio(userId, conversationId, audioFileMock.Object, baseUrl));
    }

    [Fact]
    public async Task ProcessAndStoreAudio_UnauthorizedAccessToConversation_ThrowsUnauthorizedAccessException()
    {
        var userId = 1;
        var conversationId = 1;
        var audioFileMock = new Mock<IFormFile>();
        var baseUrl = "http://localhost";
        var user = new User { UserId = userId };
        var conversation = new Conversation { UserId = 2, AudioFilePath = "" }; 

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _mockConversationRepository.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync(conversation);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _audioService.ProcessAndStoreAudio(userId, conversationId, audioFileMock.Object, baseUrl));
    }

    [Fact]
    public async Task ProcessAndStoreAudio_FileSaveFails_ThrowsIOException()
    {
        var userId = 1;
        var conversationId = 1;
        var audioFileMock = new Mock<IFormFile>();
        var baseUrl = "http://localhost";
        var user = new User { UserId = userId };
        var conversation = new Conversation { UserId = userId, AudioFilePath = "" };

        _mockUserRepository.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _mockConversationRepository.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync(conversation);
        _mockConversationRepository.Setup(repo => repo.UpdateConversation(It.IsAny<Conversation>())).ReturnsAsync(true);

        _mockFileHandler.Setup(fileHandler => fileHandler.SaveAudioFile(conversationId, audioFileMock.Object))
            .ThrowsAsync(new IOException("File save failed.")); 

        await Assert.ThrowsAsync<IOException>(
            () => _audioService.ProcessAndStoreAudio(userId, conversationId, audioFileMock.Object, baseUrl));
    }
}
