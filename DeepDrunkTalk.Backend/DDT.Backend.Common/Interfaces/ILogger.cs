namespace DDT.Backend.Common;

public interface ILogger
{
    public void LogInformation(string message, params object[] args);
    public void LogError(string message, Exception ex, params object[] args);
    public void LogWarning(string message, params object[] args);
    public void LogDebug(string message, params object[] args);
    public void LogTrace(string message, params object[] args); 
}