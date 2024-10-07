using System.Text;
using Npgsql;

namespace DDT.Backend.UserService.DAL;

public class Repository 
{
    private string _connectionString;

    protected Repository()
    {
        SetConnectionString();
    }

    private void SetConnectionString()
    {
        try
        {
            var sb = new StringBuilder();
            sb.Append(
                $"Host={Environment.GetEnvironmentVariable("DB_HOST")}:{Environment.GetEnvironmentVariable("DB_PORT")};");
            sb.Append($"Username={Environment.GetEnvironmentVariable("DB_USER")};");
            sb.Append($"Password={Environment.GetEnvironmentVariable("DB_PASS")};");
            sb.Append($"Database={Environment.GetEnvironmentVariable("DB_NAME")}");
            sb.Append(";Pooling=true;");
            sb.Append(";ConnectionLifeTime=15;");
            _connectionString = sb.ToString();   
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw; 
        }
    }

    protected NpgsqlConnection OpenConnection()
    {
        try
        {
            var dataSourceBuilder = new NpgsqlDataSourceBuilder(_connectionString);
            var dataSource = dataSourceBuilder.Build();

            return dataSource.OpenConnection();   
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw; 
        }
    }
} 