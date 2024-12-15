using DDT.Backend.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace DDT.Backend.BLL.Helpers;

public class FileHandler : IFileHandler
{
    private static readonly string _uploadsPath;
    private readonly ILogger<FileHandler> _logger;

    static FileHandler()
    {
        _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public FileHandler(ILogger<FileHandler> logger)
    {
        _logger = logger;
    }

    public async Task<string> SaveAudioFile(int conversationId, IFormFile file)
    {
        var filePath = Path.Combine(_uploadsPath, conversationId + Path.GetExtension(file.FileName));

        _logger.LogInformation($"Saving file to path: {filePath}");

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return filePath;
    }

    public string GetUploadsPath()
    {
        _logger.LogInformation($"Uploads path: {_uploadsPath}");
        return _uploadsPath;
    }
}