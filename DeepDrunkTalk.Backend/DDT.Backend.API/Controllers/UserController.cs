using DDT.Backend.BLL.Services;
using DDT.Backend.Common.Models.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var result = await _userService.RegisterUserAsync(request);
                return Ok(new { Token = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An error occurred while processing your request." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _userService.LoginUserAsync(request);
                return Ok(new { Token = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An error occurred while processing your request." });
            }
        }
        
        [HttpGet("settings")]
        public async Task<IActionResult> GetUserSettings([FromHeader] string Authorization)
        {
            var token = Authorization?.Replace("Bearer ", string.Empty);
        
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is missing or invalid.");
            }
        
            var settings = await _userService.GetUserSettingsAsync(token);
        
            return Ok(settings);
        }
        
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateUserSettings([FromHeader] string Authorization, [FromBody] UserSettings settings)
        {
            var token = Authorization?.Replace("Bearer ", string.Empty);
        
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is missing or invalid.");
            }
        
            await _userService.UpdateUserSettingsAsync(token, settings);
        
            return Ok();
        }
    }
} 