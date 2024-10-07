using DDT.Backend.UserService.API.Models.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.UserService.API.Authentication;

[Route("api/[controller]")]
[ApiController]
public class AuthController : Controller
{
    private static readonly List<RegisterRequest> RegisteredUsers = new List<RegisterRequest>();

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (RegisteredUsers.Any(u => u.Email.Trim().ToLower() == request.Email.Trim().ToLower()))
        {
            return Conflict(new { message = "User already exists" });
        }

        if (request.Email == "")
        {
            return Conflict(new { message = "No data recieved" }); 
        }
        
        if (request.Password == "")
        {
            return Conflict(new { message = "No data recieved" }); 
        }

        RegisteredUsers.Add(request);
        Console.WriteLine($"User {request.Email} registered successfully.");

        var loginRequest = new LoginRequest 
        { 
            Email = request.Email, 
            Password = request.Password 
        };
        
        return Login(loginRequest);
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = RegisteredUsers.FirstOrDefault(u => 
            u.Email.Trim().ToLower() == request.Email.Trim().ToLower() &&
            u.Password.Trim() == request.Password.Trim());

        if (user != null)
        {
            Console.WriteLine("Login successful");
            return Ok(new { token = "mock-token" });
        }

        Console.WriteLine("Unauthorized login attempt");
        return Unauthorized(new { message = "Invalid credentials" });
    }
}