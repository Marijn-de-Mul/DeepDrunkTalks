using Moq;
using Xunit;
using DDT.Backend.BLL.Services;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using Assert = Xunit.Assert;

public class ConversationServiceTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IQuestionRepository> _questionRepositoryMock;
    private readonly ConversationService _conversationService;

    public ConversationServiceTests()
    {
        _conversationRepositoryMock = new Mock<IConversationRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _questionRepositoryMock = new Mock<IQuestionRepository>();

        _conversationService = new ConversationService(
            _conversationRepositoryMock.Object,
            _userRepositoryMock.Object,
            _questionRepositoryMock.Object);
    }

    [Fact]
    public async Task StartConversation_ShouldReturnValidData_WhenUserExists()
    {
        var userId = 1;
        var question = new Question { QuestionId = 1, QuestionText = "Test Question", TopicId = 1 };
        var user = new User { UserId = userId, Name = "Test User" };

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _conversationRepositoryMock.Setup(repo => repo.GetMostRecentNonOngoingConversation(userId)).ReturnsAsync((Conversation)null);
        _questionRepositoryMock.Setup(repo => repo.GetRandomQuestion()).ReturnsAsync(question);
        _conversationRepositoryMock
            .Setup(repo => repo.CreateConversation(It.IsAny<Conversation>()))
            .ReturnsAsync(123); 

        var result = await _conversationService.StartConversation(userId);

        Assert.True(result.IsSuccess);
        Assert.Equal(123, result.ConversationId);
        Assert.Equal("Test Question", result.QuestionText);
        _userRepositoryMock.Verify(repo => repo.GetUserById(userId), Times.Once);
        _conversationRepositoryMock.Verify(repo => repo.CreateConversation(It.IsAny<Conversation>()), Times.Once);
    }

    [Fact]
    public async Task StartConversation_ShouldThrowException_WhenUserNotFound()
    {
        var userId = 1;
        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync((User)null);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _conversationService.StartConversation(userId));
        _userRepositoryMock.Verify(repo => repo.GetUserById(userId), Times.Once);
    }

    [Fact]
    public async Task StopConversation_ShouldReturnTrue_WhenValidRequest()
    {
        var userId = 1;
        var conversationId = 123;
        var user = new User { UserId = userId };
        var conversation = new Conversation { ConversationId = conversationId, UserId = userId };

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _conversationRepositoryMock.Setup(repo => repo.GetOngoingConversation(userId)).ReturnsAsync(conversation);
        _conversationRepositoryMock
            .Setup(repo => repo.UpdateConversation(It.IsAny<Conversation>()))
            .ReturnsAsync(true); 

        var result = await _conversationService.StopConversation(userId, conversationId);

        Assert.True(result);
        _userRepositoryMock.Verify(repo => repo.GetUserById(userId), Times.Once);
        _conversationRepositoryMock.Verify(repo => repo.GetOngoingConversation(userId), Times.Once);
        _conversationRepositoryMock.Verify(repo => repo.UpdateConversation(It.IsAny<Conversation>()), Times.Once);
    }

    [Fact]
    public async Task GetConversations_ShouldReturnList_WhenUserExists()
    {
        var userId = 1;
        var user = new User { UserId = userId };
        var conversations = new List<Conversation>
        {
            new Conversation { ConversationId = 1, TopicId = 1, QuestionId = 1, StartTime = DateTime.UtcNow }
        };
        var topic = new Topic { TopicId = 1, TopicName = "Test Topic" };
        var question = new Question { QuestionId = 1, QuestionText = "Test Question" };

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _conversationRepositoryMock.Setup(repo => repo.GetConversations(userId)).ReturnsAsync(conversations);
        _questionRepositoryMock.Setup(repo => repo.GetTopicByIdAsync(1)).ReturnsAsync(topic);
        _questionRepositoryMock.Setup(repo => repo.GetQuestionByIdAsync(1)).ReturnsAsync(question);

        var result = await _conversationService.GetConversations(userId);

        Assert.Single(result);
        Assert.Equal("Test Topic", result[0].Topic);
        Assert.Equal("Test Question", result[0].Question);
    }

    [Fact]
    public async Task DeleteConversation_ShouldReturnTrue_WhenValidRequest()
    {
        var userId = 1;
        var conversationId = 123;
        var user = new User { UserId = userId };
        var conversation = new Conversation { ConversationId = conversationId, UserId = userId };

        _userRepositoryMock.Setup(repo => repo.GetUserById(userId)).ReturnsAsync(user);
        _conversationRepositoryMock.Setup(repo => repo.GetConversationById(conversationId)).ReturnsAsync(conversation);
        _conversationRepositoryMock.Setup(repo => repo.DeleteConversation(conversationId)).ReturnsAsync(true);

        var result = await _conversationService.DeleteConversation(userId, conversationId);

        Assert.True(result);
    }
}
