namespace DDT.Backend.Common.Models;

public class Question
{
    public int QuestionId { get; set; }
    public int TopicId { get; set; }
    public string QuestionText { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}