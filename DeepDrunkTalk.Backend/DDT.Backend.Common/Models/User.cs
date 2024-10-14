namespace DDT.Backend.UserService.Common.Models;

public class User
{
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; 

    public ICollection<Conversation> Conversations { get; set; }
    public ICollection<Setting> Settings { get; set; }
}