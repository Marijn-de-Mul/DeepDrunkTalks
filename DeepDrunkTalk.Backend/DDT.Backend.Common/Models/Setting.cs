namespace DDT.Backend.UserService.Common.Models;

public class Setting
{
    public int SettingId { get; set; }
    public int UserId { get; set; }
    public string SettingName { get; set; }
    public string SettingValue { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; 

    public User User { get; set; }
}

