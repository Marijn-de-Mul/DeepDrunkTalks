namespace DDT.Backend.UserService.API.Models.Authentication;

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}