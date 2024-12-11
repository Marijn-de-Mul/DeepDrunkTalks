using System.ComponentModel.DataAnnotations;
using DDT.Backend.BLL.Exceptions;
using DDT.Backend.BLL.Services;
using DDT.Backend.Common.Models.Authentication;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations; 
using DDT.Backend.BLL.Services.Setting;
using DDT.Backend.Common.Exceptions;
using DDT.Backend.Common.Logger;
using Serilog;
using MissingFieldException = DDT.Backend.Common.Exceptions.MissingFieldException;

namespace DDT.Backend.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly Logger _logger;
        private readonly AuthService _authService;
        private readonly SettingService _settingService;

        public UserController(Logger logger, AuthService authService, SettingService settingService)
        {
            _logger = logger;
            _authService = authService;
            _settingService = settingService; 
        }

        #region User Authentication

        [HttpPost("register")]
        [SwaggerOperation(Summary = "Register a new user",
            Description = "This endpoint allows the creation of a new user and returns an authentication token.")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(400)] 
        [ProducesResponseType(500)] 
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                _logger.LogInformation($"Register method called with request: {request}");
                
                var result = await _authService.RegisterUser(request);
                return Ok(new { Token = result });
            }
            catch (UserAlreadyExistsException ex)
            {
                _logger.LogError($"Error in Register method: {ex.Message}, StackTrace: {ex.StackTrace}", ex);

                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidPasswordException ex)
            {
                _logger.LogError($"Error in Register method: {ex.Message}, StackTrace: {ex.StackTrace}", ex);

                return BadRequest(new { message = ex.Message });
            }
            catch (MissingFieldException ex)
            {
                _logger.LogError($"Validation error in Register method: {ex.Message}, StackTrace: {ex.StackTrace}", ex);

                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error in Register method: {ex.Message}, StackTrace: {ex.StackTrace}", ex);

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("login")]
        [SwaggerOperation(Summary = "Login an existing user", Description = "This endpoint authenticates a user and returns an authentication token.")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation($"Login attempt for email: {request.Email}");

                var result = await _authService.LoginUser(request);

                _logger.LogInformation($"User {request.Email} logged in successfully");

                return Ok(new { Token = result });
            }
            catch (InvalidCredentialsException ex)
            {
                _logger.LogError($"Authentication failed for email: {request.Email}. Exception: {ex.Message}", ex);
                return Unauthorized(new { Message = ex.Message });
            }
            catch (UserNotFoundException ex)
            {
                _logger.LogError($"User not found for email: {request.Email}. Exception: {ex.Message}", ex);
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error occurred while processing login for email: {request.Email}. Exception: {ex.Message}", ex);
                return StatusCode(500, new { Message = "An error occurred while processing your request." });
            }
        }

        #endregion

        #region User Settings

        [HttpGet("settings")]
        [SwaggerOperation(Summary = "Get user settings", Description = "This endpoint returns the settings of the user associated with the provided token.")]
        [ProducesResponseType(typeof(UserSettings), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetUserSettings()
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            var settings = await _settingService.GetUserSettings(userId);

            return Ok(settings);
        }

        [HttpPut("settings")]
        [SwaggerOperation(Summary = "Update user settings", Description = "This endpoint allows the user to update their settings using the provided token.")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> UpdateUserSettings([FromBody] UserSettings settings)
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            await _settingService.UpdateUserSettings(userId, settings);

            return Ok();
        }

        #endregion
    }
}
