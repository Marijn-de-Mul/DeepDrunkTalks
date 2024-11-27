using DDT.Backend.Common.Models;

namespace DDT.Backend.Common.Interfaces;

public interface IConversationRepository
{
    Task<bool> CreateConversation(Conversation conversation);
    Task<Conversation> GetOngoingConversation(int userId);
    Task<Conversation> GetMostRecentNonOngoingConversation(int userId);
    Task<bool> UpdateConversation(Conversation conversation);
    Task<List<Conversation>> GetConversations(int userId);
}