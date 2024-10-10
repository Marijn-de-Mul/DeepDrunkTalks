using DDT.Backend.UserService.Common.Models; 
using DDT.Backend.UserService.BLL.Services;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using LoginRequest = DDT.Backend.UserService.Common.Models.Authentication.LoginRequest;

namespace DDT.Backend.UserService.API.Authentication;

[Route("api/[controller]")]
[ApiController]
public class AuthController : Controller
{
    private readonly AuthService _authService;
    
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }  

    [HttpPost("register")]
    public IActionResult Register([FromBody] Common.Models.Authentication.RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Conflict(new { message = "No data received" });
        }

        var token = _authService.RegisterUser(request);

        if (token == null)
        {
            return Conflict(new { message = "User already exists or password mismatch" });
        }

        Console.WriteLine($"User {request.Email} registered successfully.");
    
        return Ok(new { token });
    }
    
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var token = _authService.LoginUser(request);

        if (token != null)
        {
            Console.WriteLine("Login successful");
            return Ok(new { token });
        }

        Console.WriteLine("Unauthorized login attempt");
        return Unauthorized(new { message = "Invalid credentials" });
    } 
}