namespace DDT.Backend.UserService.Common.Models;

public class Conversation
{
    public int ConversationId { get; set; }
    public int UserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string AudioFilePath { get; set; }
    public string OnTopicAnalysis { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; 

    public User User { get; set; } 
}