using DDT.Backend.ConversationService.Common.Models;

namespace DDT.Backend.ConversationService.Common.Interfaces
{
    public interface IConversationRepository
    {
        Task<bool> CreateConversationAsync(Conversation conversation);
        Task<Conversation> GetOngoingConversationAsync(int userId);
        Task<bool> UpdateConversationAsync(Conversation conversation);
        Task<List<Conversation>> GetConversationsAsync(int userId); 
    }
}