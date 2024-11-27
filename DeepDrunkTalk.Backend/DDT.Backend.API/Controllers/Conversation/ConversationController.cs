using DDT.Backend.BLL;
using DDT.Backend.BLL.Helpers;
using DDT.Backend.BLL.Services;
using DDT.Backend.Common.Models.Authentication;
using DDT.Backend.Common.Models.DTO;
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
    
    [HttpPost("audio")]
    public async Task<IActionResult> Audio(
        [FromServices] IHttpContextAccessor httpContextAccessor,
        [FromHeader] string Authorization)
    {
        var token = Authorization?.Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token is missing or invalid.");
        }
        
        if (!Request.HasFormContentType || !Request.Form.Files.Any())
        {
            return BadRequest(new { message = "No audio file provided." });
        }
    
        var audioFile = Request.Form.Files["audio"];
        if (audioFile == null || audioFile.Length == 0)
        {
            return BadRequest(new { message = "Invalid audio file." });
        }
    
        try
        {
            var baseUrl = $"{httpContextAccessor.HttpContext?.Request.Scheme}://{httpContextAccessor.HttpContext?.Request.Host}";
    
            var webAccessibleUrl = await _conversationService.ProcessAndStoreAudioAsync(audioFile, baseUrl, token);
    
            return Ok(new { message = "Audio file uploaded successfully.", url = webAccessibleUrl });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error processing audio: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while processing the audio file." });
        }
    }
    
    [HttpGet("files/{fileName}")]
    public async Task<IActionResult> GetFile(string fileName, [FromHeader] string Authorization)
    {
        var token = Authorization?.Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token is missing or invalid.");
        }

        AudioFile audioFile = await _conversationService.GetAudioFileAsync(fileName, token);

        if (audioFile.fileStream == null || audioFile.fileExtension == null)
        {
            return NotFound(new { message = "File not found." });
        }

        return File(audioFile.fileStream, GetContentType(audioFile.fileExtension), fileName);
    }
    
    private string GetContentType(string fileExtension)
    {
        return fileExtension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".webm" => "audio/webm",
            _ => "application/octet-stream"
        };
    }
}
