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

    public ConversationService(IConversationRepository conversationRepository, IUserRepository userRepository, IQuestionRepository questionRepository)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _questionRepository = questionRepository;
    }
    
    public async Task<(int ConversationId, bool IsSuccess, string QuestionText)> StartConversation(int userId)
    {
        var user = await _userRepository.GetUserById(userId);
    
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
            EndTime = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        int conversationId = await _conversationRepository.CreateConversation(conversation);
    
        if (conversationId > 0)
        {
            return (conversationId, true, question.QuestionText);
        }
    
        return (0, false, string.Empty);
    }
    
    public async Task<bool> StopConversation(int userId, int conversationId)
    {
        var user = await _userRepository.GetUserById(userId);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        var conversation = await _conversationRepository.GetOngoingConversation(user.UserId);

        if (conversation == null)
        {
            return false;
        }

        if (conversation.ConversationId != conversationId)
        {
            return false; 
        }
        
        conversation.EndTime = DateTime.UtcNow;
        conversation.UpdatedAt = DateTime.UtcNow;
        
        await _conversationRepository.UpdateConversation(conversation);

        return true;
    }

    public async Task<List<ConversationRequest>> GetConversations(int userId)
    {
        var user = await _userRepository.GetUserById(userId);

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

            var conversationRequest = new ConversationRequest
            {
                Id = conversation.ConversationId,
                Topic = topic.TopicName ?? "Untitled Topic",
                Question = question.QuestionText ?? "No question available.",
                StartTime = conversation.StartTime.ToString("yyyy-MM-dd HH:mm"),
                EndTime = conversation.EndTime?.ToString("yyyy-MM-dd HH:mm"),
                Audio = string.IsNullOrEmpty(conversation.AudioFilePath) 
                    ? "No audio available" 
                    : conversation.AudioFilePath
            };

            result.Add(conversationRequest);
        }

        return result;
    }
    
    public async Task<bool> DeleteConversation(int userId, int conversationId)
    {
        var user = await _userRepository.GetUserById(userId);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }
        
        var conversation = await _conversationRepository.GetConversationById(conversationId);

        if (conversation == null)
        {
            return false;
        }
        
        if (conversation.UserId != user.UserId)
        {
            return false;
        }
        
        return await _conversationRepository.DeleteConversation(conversationId);
    }
}