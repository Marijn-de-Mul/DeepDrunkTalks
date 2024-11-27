namespace DDT.Backend.Common.Models;

public class ConversationRequest
{
    public int Id { get; set; }
    public string Topic { get; set; } 
    public string Question { get; set; } 
    public string StartTime { get; set; } 
    public string EndTime { get; set; } 
    public string Audio { get; set; } 
}
