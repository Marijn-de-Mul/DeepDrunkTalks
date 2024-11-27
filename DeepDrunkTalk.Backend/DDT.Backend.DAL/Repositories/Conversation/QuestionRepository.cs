using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace DDT.Backend.DAL.Repositories;

public class QuestionRepository : IQuestionRepository
{
    private readonly ApplicationDbContext _context;

    public QuestionRepository(ApplicationDbContext dbContext)
    {
        _context = dbContext;
    }
    
    public async Task<Question> GetRandomQuestion()
    {
        return await _context.Questions
            .OrderBy(q => Guid.NewGuid()) 
            .FirstOrDefaultAsync();
    }
    
    public async Task<Question> GetQuestionByIdAsync(int questionId)
    {
        var question = await _context.Questions
            .Where(q => q.QuestionId == questionId)
            .FirstOrDefaultAsync();
        if (question == null)
        {
            throw new KeyNotFoundException("Question not found.");
        } 
        
        return question;
    }
    
    public async Task<Topic> GetTopicByIdAsync(int topicId)
    {
        var topic = await _context.Topics
            .Where(t => t.TopicId == topicId)
            .FirstOrDefaultAsync();
        if (topic == null)
        {
            throw new KeyNotFoundException("Topic not found.");
        }

        return topic;
    }
}