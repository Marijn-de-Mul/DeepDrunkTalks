using System.Text;

namespace DDT.Backend.BLL.Helpers;

public static class ConnectionStringHelper
{
    public static string GetConnectionString()
    {
        var sb = new StringBuilder();
        sb.Append($"Host={Environment.GetEnvironmentVariable("DB_HOST")};");
        sb.Append($"Port={Environment.GetEnvironmentVariable("DB_PORT")};");
        sb.Append($"Username={Environment.GetEnvironmentVariable("DB_USER")};");
        sb.Append($"Password={Environment.GetEnvironmentVariable("DB_PASS")};");
        sb.Append($"Database={Environment.GetEnvironmentVariable("DB_NAME")};");
        sb.Append("Pooling=true;");
        sb.Append("ConnectionLifeTime=15;");
        return sb.ToString();
    }
}