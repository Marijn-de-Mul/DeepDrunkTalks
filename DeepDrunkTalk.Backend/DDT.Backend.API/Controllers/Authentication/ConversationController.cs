using DDT.Backend.UserService.BLL;
using DDT.Backend.UserService.BLL.Helpers;
using DDT.Backend.UserService.BLL.Services;
using DDT.Backend.UserService.Common.Models.Authentication;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class ConversationController : ControllerBase
{
    private readonly ConversationService _conversationService;
    
    public ConversationController(ConversationService conversationService)
    {
        _conversationService = conversationService;
    }
    
    [HttpPost("start")]
    public async Task<IActionResult> StartConversation([FromHeader] string Authorization)
    {
        var token = Authorization?.Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token is missing or invalid.");
        }

        var result = await _conversationService.StartConversation(token);

        if (result)
        {
            return Ok("Conversation started successfully.");
        }

        return BadRequest("Failed to start conversation.");
    }
    
    [HttpPost("stop")]
    public async Task<IActionResult> StopConversation([FromHeader] string Authorization)
    {
        var token = Authorization?.Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token is missing or invalid.");
        }
        
        Console.WriteLine("Connecting to DB");

        var result = await _conversationService.StopConversation(token);
        
        if (result)
        {
            return Ok("Conversation stopped successfully.");
        }

        return BadRequest("Failed to stop conversation.");
    }
}
