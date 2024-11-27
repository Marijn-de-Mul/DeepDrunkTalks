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
        
        public async Task<bool> CreateConversation(Conversation conversation)
        {
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<Conversation> GetOngoingConversation(int userId)
        {
            var tolerance = TimeSpan.FromMilliseconds(50); 

            var ongoingConversation = await _context.Conversations
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            ongoingConversation = ongoingConversation
                .Where(c => c.EndTime > c.StartTime.Add(tolerance) || c.EndTime == c.StartTime)
                .ToList();

            return ongoingConversation.FirstOrDefault();
        }
        
        public async Task<Conversation> GetMostRecentNonOngoingConversation(int userId)
        {
            var tolerance = TimeSpan.FromMilliseconds(50);

            var conversations = await _context.Conversations
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var mostRecentNonOngoingConversation = conversations
                .FirstOrDefault(c => c.EndTime <= c.StartTime.Add(tolerance) && c.EndTime != c.StartTime);

            return mostRecentNonOngoingConversation;
        }
        
        public async Task<bool> UpdateConversation(Conversation conversation)
        {
            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<List<Conversation>> GetConversations(int userId)
        {
            return await _context.Conversations
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }
    } 
}
