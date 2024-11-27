using Microsoft.AspNetCore.Http;

namespace DDT.Backend.BLL.Helpers;

public class FileHandler
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

    public static async Task<string> SaveAudioFileAsync(IFormFile file)
    {
        var filePath = Path.Combine(_uploadsPath, Guid.NewGuid() + Path.GetExtension(file.FileName));

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return filePath;
    }
}