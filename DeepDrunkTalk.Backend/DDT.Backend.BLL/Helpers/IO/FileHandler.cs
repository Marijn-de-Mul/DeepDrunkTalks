using DDT.Backend.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace DDT.Backend.BLL.Helpers;

public class FileHandler : IFileHandler
{
    private static readonly string _uploadsPath;
    
    static FileHandler()
    {
        _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public async Task<string> SaveAudioFile(int conversationId, IFormFile file)
    {
        var filePath = Path.Combine(_uploadsPath, conversationId + Path.GetExtension(file.FileName));

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return filePath;
    }
    
    public string GetUploadsPath() => _uploadsPath;
}