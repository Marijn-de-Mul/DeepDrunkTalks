using DDT.Backend.ConversationService.Common.Interfaces;
using DDT.Backend.ConversationService.Common.Models;
using DDT.Backend.UserService.BLL.Helpers;
using DDT.Backend.UserService.Common.Interfaces;
using Newtonsoft.Json;

namespace DDT.Backend.UserService.BLL.Services;

public class ConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository; 
    private readonly string _jwtSecret;
    
    private readonly string questionsFilePath = Path.Combine(Directory.GetCurrentDirectory(), "questions.json");
    private Random _random = new Random();

    public ConversationService(IConversationRepository conversationRepository, IUserRepository userRepository)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
    }
    
    public async Task<bool> StartConversation(string token)
    {
        var userEmail = JwtHelper.GetUserEmailFromToken(token, _jwtSecret);

        if (string.IsNullOrEmpty(userEmail))
        {
            throw new UnauthorizedAccessException("Invalid or missing email in the token.");
        }

        Console.WriteLine(userEmail); 
        
        var user = await _userRepository.GetUserByEmailAsync(userEmail);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }
        
        var conversation = new Conversation
        {
            UserId = user.UserId, 
            TopicId = 1,                 
            StartTime = DateTime.UtcNow, 
            EndTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow, 
            UpdatedAt = DateTime.UtcNow  
        };
        
        Console.WriteLine($"ConversationService - StartConversation: \n{conversation.ToString()}"); 
        
        var result = await _conversationRepository.CreateConversationAsync(conversation);
        
        return result;
    }
    
    public async Task<bool> StopConversation(string token)
    {
        var userEmail = JwtHelper.GetUserEmailFromToken(token, _jwtSecret);

        if (string.IsNullOrEmpty(userEmail))
        {
            throw new UnauthorizedAccessException("Invalid or missing email in the token.");
        }

        Console.WriteLine(userEmail); 
        
        var user = await _userRepository.GetUserByEmailAsync(userEmail);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }
        
        var conversation = await _conversationRepository.GetOngoingConversationAsync(user.UserId);

        if (conversation == null)
        {
            Console.WriteLine($"No ongoing conversation found for the user. User ID: {user.UserId}");
            return false;  
        }
        
        Console.WriteLine($"ConversationService - StopConversation: \n{conversation.ToString()}"); 
        
        conversation.EndTime = DateTime.UtcNow;
        conversation.UpdatedAt = DateTime.UtcNow;  
        
        Console.WriteLine($"ConversationService - StopConversation: \n{conversation.ToString()}"); 
        
        await _conversationRepository.UpdateConversationAsync(conversation); 

        return true;
    }

    public async Task<string> GetRandomQuestionAsync(string currentQuestion)
    {
        var questions = await ReadQuestionsFromFileAsync();
        
        string newQuestion;
        do
        {
            newQuestion = questions[_random.Next(questions.Count)];
        } while (newQuestion == currentQuestion); 

        return newQuestion;
    }

    private async Task<List<string>> ReadQuestionsFromFileAsync()
    {
        var json = await File.ReadAllTextAsync(questionsFilePath);
        return JsonConvert.DeserializeObject<List<string>>(json);
    }

    public async Task<List<Conversation>> GetConversations(string token)
    {
        var userEmail = JwtHelper.GetUserEmailFromToken(token, _jwtSecret);

        if (string.IsNullOrEmpty(userEmail))
        {
            throw new UnauthorizedAccessException("Invalid or missing email in the token.");
        }

        var user = await _userRepository.GetUserByEmailAsync(userEmail);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        var conversations = await _conversationRepository.GetConversationsAsync(user.UserId);

        return conversations;
    }
}