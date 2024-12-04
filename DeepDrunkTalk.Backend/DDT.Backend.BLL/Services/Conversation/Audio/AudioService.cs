using DDT.Backend.BLL.Helpers;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models;
using Microsoft.AspNetCore.Http;

namespace DDT.Backend.BLL.Services.Audio;

public class AudioService
{
    
    private readonly IUserRepository _authRepository;
    private readonly IConversationRepository _conversationRepository;
    
    public AudioService(IUserRepository authRepository, IConversationRepository conversationRepository)
    {
        _authRepository = authRepository;
        _conversationRepository = conversationRepository;
    }
    
    public async Task<string> ProcessAndStoreAudio(int userId, int conversationId, IFormFile audioFile, string baseUrl)
   {
       var user = await _authRepository.GetUserById(userId);
  
       if (user == null)
       {
           throw new UnauthorizedAccessException("User not found.");
       }
       
       var filePath = await FileHandler.SaveAudioFile(conversationId, audioFile);
       
       var fileName = Path.GetFileName(filePath);
       var webAccessibleUrl = $"{baseUrl}/api/conversations/{conversationId}/audio";
       
       Conversation conversation = await _conversationRepository.GetConversationById(conversationId);
       
       if (conversation == null)
       {
           throw new InvalidOperationException("No ongoing conversation found for the user.");
       }
  
       if (conversation.UserId != user.UserId)
       {
           throw new UnauthorizedAccessException("Unauthorized access.");
       }
       
       conversation.AudioFilePath = webAccessibleUrl; 
       
       await _conversationRepository.UpdateConversation(conversation);
  
       return webAccessibleUrl;
   }
}