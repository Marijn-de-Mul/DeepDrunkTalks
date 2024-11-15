namespace DDT.Backend.UserService.BLL;

public class UserSession
{
    public string UserId { get; }
    public string SessionId { get; } = Guid.NewGuid().ToString();
    private MemoryStream AudioStream { get; } = new();

    public UserSession(string userId)
    {
        UserId = userId;
    }

    public async Task AppendAudioAsync(Stream audioChunk)
    {
        await audioChunk.CopyToAsync(AudioStream);
    }

    public void FinalizeAudio()
    {
        // Save AudioStream to file or database as needed
        File.WriteAllBytes($"recordings/{SessionId}.wav", AudioStream.ToArray());
        AudioStream.Dispose();
    }
}
