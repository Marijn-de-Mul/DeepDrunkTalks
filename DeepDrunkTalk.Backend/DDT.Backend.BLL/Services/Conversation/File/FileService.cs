using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Models.DTO;

namespace DDT.Backend.BLL.Services.File;

public class FileService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFileOperations _fileOperations;
    
    public FileService(IConversationRepository conversationRepository, IUserRepository userRepository, IFileOperations fileOperations)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _fileOperations = fileOperations;
    }
    
    public async Task<AudioFile> GetAudioFile(int userId, int conversationId)
    {
        var user = await _userRepository.GetUserById(userId);
    
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }
        
        var conversation = await _conversationRepository.GetConversationById(conversationId);
    
        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found.");
        }
    
        if (conversation.UserId != user.UserId)
        {
            throw new UnauthorizedAccessException("Unauthorized access.");
        }
        
        var fileName = conversationId.ToString() + ".mp3";
        
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", fileName);
    
        if (!_fileOperations.FileExists(filePath))
        {
            return null;
        }
    
        var fileStream = _fileOperations.OpenRead(filePath);
        var fileExtension = Path.GetExtension(filePath).ToLowerInvariant();
    
        AudioFile audioFile = new AudioFile
        {
            fileStream = fileStream,
            fileExtension = fileExtension
        };
    
        return (audioFile); 
    }
}