using DDT.Backend.BLL;
using DDT.Backend.BLL.Helpers;
using DDT.Backend.BLL.Services;
using DDT.Backend.Common.Models.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.API.Controllers;

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
    
        if (result.IsSuccess)
        {
            return Ok(new 
            {
                message = "Conversation started successfully.",
                question = result.QuestionText 
            });
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
        
        var result = await _conversationService.StopConversation(token);
        
        if (result)
        {
            return Ok("Conversation stopped successfully.");
        }

        return BadRequest("Failed to stop conversation.");
    }

    [HttpPost("get-conversations")]
    public async Task<IActionResult> GetConversations([FromHeader] string Authorization)
    {
        var token = Authorization?.Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token is missing or invalid.");
        }

        var result = await _conversationService.GetConversations(token);

        if (result == null)
        {
            return NotFound("No conversations found.");
        }

        return Ok(result);
    } 
    
    // Still under construction
    [HttpPost("audio")]
    public async Task<IActionResult> UploadAudioChunk([FromHeader] string Authorization, IFormFile audio)
    {
        var token = Authorization?.Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token is missing or invalid.");
        }

        return Ok();
    }
}
