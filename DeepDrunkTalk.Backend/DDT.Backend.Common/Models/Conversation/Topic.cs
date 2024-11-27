namespace DDT.Backend.Common.Models;

public class Topic
{
    public int TopicId { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    public string TopicName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}