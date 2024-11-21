using Microsoft.EntityFrameworkCore;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using DDT.Backend.DAL;

namespace DDT.Backend.DAL.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly ApplicationDbContext _context;

        public ConversationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateConversationAsync(Conversation conversation)
        {
            Console.WriteLine($"ConversationRepository - CreateConversationAsync: \n{conversation.ToString()}");

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Conversation> GetOngoingConversationAsync(int userId)
        {
            return await _context.Conversations
                .FirstOrDefaultAsync(c =>
                    c.UserId == userId &&
                    c.StartTime.Year == c.EndTime.Year &&
                    c.StartTime.Month == c.EndTime.Month &&
                    c.StartTime.Day == c.EndTime.Day &&
                    c.StartTime.Hour == c.EndTime.Hour &&
                    c.StartTime.Minute == c.EndTime.Minute &&
                    c.StartTime.Second == c.EndTime.Second);
        }

        public async Task<bool> UpdateConversationAsync(Conversation conversation)
        {
            Console.WriteLine($"ConversationRepository - UpdateConversationAsync: \n{conversation.ToString()}");

            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Conversation>> GetConversationsAsync(int userId)
        {
            return await _context.Conversations
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }
        
        public async Task<Conversation> GetLastConversationByUserIdAsync(int userId)
        {
            return await _context.Conversations
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();
        }
    } 
}