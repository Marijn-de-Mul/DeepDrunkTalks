using DDT.Backend.ConversationService.DAL;
using DDT.Backend.ConversationService.Common.Interfaces;
using DDT.Backend.ConversationService.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace DDT.Backend.ConversationService.DAL.Repositories
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
                .FirstOrDefaultAsync(c => c.UserId == userId && c.StartTime == c.EndTime);
        }
        
        public async Task<bool> UpdateConversationAsync(Conversation conversation)
        {   
            Console.WriteLine($"ConversationRepository - UpdateConversationAsync: \n{conversation.ToString()}"); 
            
            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}