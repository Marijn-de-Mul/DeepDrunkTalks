using Microsoft.EntityFrameworkCore;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;

namespace DDT.Backend.DAL.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly ApplicationDbContext _context;

        public ConversationRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<int> CreateConversation(Conversation conversation)
        {
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
       
            return conversation.ConversationId;
        }
        
        public async Task<bool> UpdateConversation(Conversation conversation)
        {
            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> DeleteConversation(int conversationId)
        {
            var conversation = await _context.Conversations.FirstOrDefaultAsync(c => c.ConversationId == conversationId);
            if (conversation != null)
            {
                _context.Conversations.Remove(conversation);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }
        
        public async Task<Conversation> GetOngoingConversation(int userId)
        {
            return await _context.Conversations
                .Where(c => c.UserId == userId && c.EndTime == null)
                .OrderByDescending(c => c.CreatedAt) 
                .FirstOrDefaultAsync(); 
        }
        
        public async Task<Conversation> GetMostRecentNonOngoingConversation(int userId)
        {
            return await _context.Conversations
                .Where(c => c.UserId == userId && c.EndTime != null && c.EndTime != c.StartTime)
                .OrderByDescending(c => c.CreatedAt) 
                .FirstOrDefaultAsync();
        }
        
        public async Task<List<Conversation>> GetConversations(int userId)
        {
            return await _context.Conversations
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }
        
        public async Task<Conversation> GetConversationById(int conversationId)
        {
            return await _context.Conversations
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId); 
        }
    } 
}
