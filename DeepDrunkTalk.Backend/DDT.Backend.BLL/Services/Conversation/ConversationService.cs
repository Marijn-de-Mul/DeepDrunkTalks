using DDT.Backend.Common.Interfaces;
using DDT.Backend.BLL.Helpers;
using DDT.Backend.Common.Models;
using DDT.Backend.Common.Models.DTO;
using Microsoft.AspNetCore.Http;
using NAudio.Wave;
using Newtonsoft.Json;

namespace DDT.Backend.BLL.Services;

public class ConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository; 
    private readonly IQuestionRepository _questionRepository;
    private readonly string _jwtSecret;
    
    private static string audioChunksDirectory = @"C:\temp\audio_chunks";  
    private static string combinedAudioFilePath = @"C:\temp\combined_audio.webm"; 

    public ConversationService(IConversationRepository conversationRepository, IUserRepository userRepository, IQuestionRepository questionRepository)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _questionRepository = questionRepository;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
    }
    
    public async Task<(bool IsSuccess, string QuestionText)> StartConversation(string token)
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
    
        var lastConversation = await _conversationRepository.GetMostRecentNonOngoingConversation(user.UserId);
    
        Question question;
        do
        {
            question = await _questionRepository.GetRandomQuestion();
        }
        while (lastConversation != null && lastConversation.QuestionId == question.QuestionId);
    
        if (question == null)
        {
            throw new Exception("No available questions to start the conversation.");
        }

        var conversation = new Conversation
        {
            UserId = user.UserId,
            TopicId = question.TopicId, 
            QuestionId = question.QuestionId, 
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    
        Console.WriteLine($"ConversationService - StartConversation: \n{conversation.ToString()}");
    
        var result = await _conversationRepository.CreateConversation(conversation);
    
        if (result)
        {
            return (true, question.QuestionText);
        }
    
        return (false, string.Empty);
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

        var conversation = await _conversationRepository.GetOngoingConversation(user.UserId);

        if (conversation == null)
        {
            Console.WriteLine($"No ongoing conversation found for the user. User ID: {user.UserId}");
            return false;
        }

        Console.WriteLine($"ConversationService - StopConversation: \n{conversation.ToString()}"); 
        
        conversation.EndTime = DateTime.UtcNow;
        conversation.UpdatedAt = DateTime.UtcNow;

        Console.WriteLine($"ConversationService - StopConversation: \n{conversation.ToString()}");

        await _conversationRepository.UpdateConversation(conversation);

        return true;
    }

    public async Task<List<ConversationRequest>> GetConversations(string token)
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

        var conversations = await _conversationRepository.GetConversations(user.UserId);

        var result = new List<ConversationRequest>();

        foreach (var conversation in conversations)
        {
            var topic = await _questionRepository.GetTopicByIdAsync(conversation.TopicId);
            var question = await _questionRepository.GetQuestionByIdAsync(conversation.QuestionId);

            var conversationDto = new ConversationRequest
            {
                Id = conversation.ConversationId,
                Topic = topic.TopicName ?? "Untitled Topic",  
                Question = question.QuestionText ?? "No question available.",  
                StartTime = conversation.StartTime.ToString("yyyy-MM-dd HH:mm"),  
                EndTime = conversation.EndTime.ToString("yyyy-MM-dd HH:mm"),     
                Audio = string.IsNullOrEmpty(conversation.AudioFilePath) ? "No audio available" : conversation.AudioFilePath  
            };

            result.Add(conversationDto);
        }

        return result;
    }
    
    public async Task<string> ProcessAndStoreAudioAsync(IFormFile audioFile, string baseUrl, string token)
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
        
        var filePath = await FileHandler.SaveAudioFileAsync(audioFile);
        
        var fileName = Path.GetFileName(filePath);
        var webAccessibleUrl = $"{baseUrl}/api/Conversation/files/{fileName}";

        Conversation conversation = await _conversationRepository.GetMostRecentNonOngoingConversation(user.UserId); 
        
        
        if (conversation == null)
        {
            throw new InvalidOperationException("No ongoing conversation found for the user.");
        }
        
        conversation.AudioFilePath = webAccessibleUrl; 
        
        await _conversationRepository.UpdateConversation(conversation);

        return webAccessibleUrl;
    }

    public async Task<AudioFile> GetAudioFileAsync(string fileName, string token)
    {
        
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", fileName);

        if (!System.IO.File.Exists(filePath))
        {
            return null;
        }

        var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        var fileExtension = Path.GetExtension(filePath).ToLowerInvariant();

        AudioFile audioFile = new AudioFile
        {
            fileStream = fileStream,
            fileExtension = fileExtension
        };

        return (audioFile); 
    }
}