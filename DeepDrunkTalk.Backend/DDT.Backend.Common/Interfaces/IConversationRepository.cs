using DDT.Backend.Common.Models;

namespace DDT.Backend.Common.Interfaces;

public interface IConversationRepository
{
    Task<int> CreateConversation(Conversation conversation);
    Task<bool> UpdateConversation(Conversation conversation);
    Task<bool> DeleteConversation(int conversationId);
    Task<Conversation> GetOngoingConversation(int userId);
    Task<Conversation> GetMostRecentNonOngoingConversation(int userId);
    Task<List<Conversation>> GetConversations(int userId);
    Task<Conversation> GetConversationById(int conversationId);
}