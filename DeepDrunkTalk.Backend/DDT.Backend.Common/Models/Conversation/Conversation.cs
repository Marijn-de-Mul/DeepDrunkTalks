namespace DDT.Backend.Common.Models;

public class Conversation
{
    public int ConversationId { get; set; }
    public int UserId { get; set; }
    public int TopicId { get; set; }
    public int QuestionId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? AudioFilePath { get; set; }
    public string? OnTopicAnalysis { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}