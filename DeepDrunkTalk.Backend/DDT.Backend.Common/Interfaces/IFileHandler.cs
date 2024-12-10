using Microsoft.AspNetCore.Http;

namespace DDT.Backend.Common.Interfaces;

public interface IFileHandler
{
    Task<string> SaveAudioFile(int conversationId, IFormFile file);
}
