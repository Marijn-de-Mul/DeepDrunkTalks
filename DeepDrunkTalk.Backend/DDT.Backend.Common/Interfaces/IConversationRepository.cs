using DDT.Backend.Common.Models;

namespace DDT.Backend.Common.Interfaces
{
    public interface IConversationRepository
    {
        Task<bool> CreateConversationAsync(Conversation conversation);
        Task<Conversation> GetOngoingConversationAsync(int userId);
        Task<bool> UpdateConversationAsync(Conversation conversation);
        Task<List<Conversation>> GetConversationsAsync(int userId); 
        Task<Conversation> GetLastConversationByUserIdAsync(int userId); 
    }
}