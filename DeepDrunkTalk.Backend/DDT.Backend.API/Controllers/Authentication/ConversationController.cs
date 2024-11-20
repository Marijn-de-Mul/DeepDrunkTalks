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
        
        var result = await _conversationService.StopConversation(token);
        
        if (result)
        {
            return Ok("Conversation stopped successfully.");
        }

        return BadRequest("Failed to stop conversation.");
    }
    
    [HttpPost("random-question")]
    public async Task<IActionResult> GetRandomQuestion([FromBody] QuestionRequest request)
    {
        string newQuestion;

        if (string.IsNullOrEmpty(request.CurrentQuestion))
        {
            newQuestion = await _conversationService.GetRandomQuestionAsync(null); 
        }
        else
        {
            newQuestion = await _conversationService.GetRandomQuestionAsync(request.CurrentQuestion);
        }

        return Ok(new { question = newQuestion });
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
