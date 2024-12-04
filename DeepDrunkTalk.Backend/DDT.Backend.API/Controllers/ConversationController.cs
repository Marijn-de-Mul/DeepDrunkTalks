using DDT.Backend.BLL;
using DDT.Backend.BLL.Services;
using DDT.Backend.BLL.Services.Audio;
using DDT.Backend.BLL.Services.File;
using DDT.Backend.Common.Models;
using DDT.Backend.Common.Models.Authentication;
using DDT.Backend.Common.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace DDT.Backend.API.Controllers
{
    [Route("api/conversations")]
    [ApiController]
    public class ConversationController : ControllerBase
    {
        private readonly ConversationService _conversationService;
        private readonly AudioService _audioService;
        private readonly FileService _fileService;

        public ConversationController(ConversationService conversationService, AudioService audioService, FileService fileService)
        {
            _conversationService = conversationService;
            _audioService = audioService;
            _fileService = fileService; 
        }

        #region Conversation Management

        [HttpPost]
        [SwaggerOperation(Summary = "Starts a new conversation", Description = "Starts a new conversation for the authenticated user.")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> StartConversation()
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            var result = await _conversationService.StartConversation(userId);

            if (result.IsSuccess)
            {
                return Ok(new
                {
                    conversationId = result.ConversationId,
                    message = "Conversation started successfully.",
                    question = result.QuestionText
                });
            }

            return BadRequest("Failed to start conversation.");
        }

        [HttpPut("{conversationId}/stop")]
        [SwaggerOperation(Summary = "Stops an ongoing conversation", Description = "Stops an ongoing conversation for the specified conversation ID.")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> StopConversation([FromRoute] int conversationId)
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            var result = await _conversationService.StopConversation(userId, conversationId);

            if (result)
            {
                return Ok("Conversation stopped successfully.");
            }

            return BadRequest("Failed to stop conversation.");
        }

        [HttpDelete("{conversationId}")]
        [SwaggerOperation(Summary = "Deletes a specific conversation", Description = "Deletes the conversation with the provided ID.")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> DeleteConversation([FromRoute] int conversationId)
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            var result = await _conversationService.DeleteConversation(userId, conversationId);
       
            if (result)
            {
                return NoContent();
            }
       
            return NotFound(new { message = "Conversation not found." });
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Retrieves all conversations", Description = "Gets all conversations for the authenticated user.")]
        [ProducesResponseType(typeof(IEnumerable<ConversationRequest>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetConversations()
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            var result = await _conversationService.GetConversations(userId);

            if (result == null || result.Count == 0)
            {
                return NotFound("No conversations found.");
            }

            return Ok(result);
        }

        #endregion

        #region Audio File Management

        [HttpGet("{conversationId}/audio")]
        [SwaggerOperation(Summary = "Retrieves the audio file for a specific conversation", Description = "Fetches the audio file associated with the provided conversation ID.")]
        [ProducesResponseType(typeof(FileStreamResult), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetAudioFile([FromRoute] int conversationId)
        {
            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            AudioFile audioFile = await _fileService.GetAudioFile(userId, conversationId);

            if (audioFile?.fileStream == null || audioFile.fileExtension == null)
            {
                return NotFound(new { message = "Audio file not found." });
            }

            return File(audioFile.fileStream, GetContentType(audioFile.fileExtension), $"{conversationId}{audioFile.fileExtension}");
        }

        [HttpPost("{conversationId}/audio")]
        [SwaggerOperation(Summary = "Uploads an audio file for a conversation", Description = "Processes and uploads an audio file associated with a conversation.")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UploadAudio(
            [FromServices] IHttpContextAccessor httpContextAccessor,
            [FromRoute] int conversationId)
        {
            if (!Request.HasFormContentType || !Request.Form.Files.Any())
            {
                return BadRequest(new { message = "No audio file provided." });
            }

            var audioFile = Request.Form.Files["audio"];
            if (audioFile == null || audioFile.Length == 0)
            {
                return BadRequest(new { message = "Invalid audio file." });
            }

            var baseUrl = $"{httpContextAccessor.HttpContext?.Request.Scheme}://{httpContextAccessor.HttpContext?.Request.Host}";

            var userId = (int)(HttpContext.Items["UserId"] ?? throw new InvalidOperationException("UserId is not set in the context."));
            var webAccessibleUrl = await _audioService.ProcessAndStoreAudio(userId, conversationId, audioFile, baseUrl);

            return Ok(new { message = "Audio file uploaded successfully.", url = webAccessibleUrl });
        }

        #endregion

        #region Helper Methods

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

        #endregion
    }
}
