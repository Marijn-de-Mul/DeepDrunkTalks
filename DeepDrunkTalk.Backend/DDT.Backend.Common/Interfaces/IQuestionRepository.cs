using DDT.Backend.Common.Models;

namespace DDT.Backend.Common.Interfaces;

public interface IQuestionRepository
{
    Task<Question> GetRandomQuestion();
    Task<Question> GetQuestionByIdAsync(int questionId);
    Task<Topic> GetTopicByIdAsync(int topicId); 
}