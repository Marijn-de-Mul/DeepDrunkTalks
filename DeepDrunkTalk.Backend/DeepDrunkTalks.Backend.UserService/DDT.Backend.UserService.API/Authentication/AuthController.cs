using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.UserService.API.Authentication;

[Route("api/[controller]")]
[ApiController]
public class AuthController : Controller
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] object login)
    {
        return Ok(new { message = "Login successful", token = "mocked-jwt-token" });
    }
}
