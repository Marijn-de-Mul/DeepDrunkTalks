using DDT.Backend.UserService.Common.Interfaces;
using DDT.Backend.UserService.Common.Models.Authentication;
using Npgsql;

namespace DDT.Backend.UserService.DAL.Repositories;

public class AuthRepository : Repository, IAuthRepository
{
    public bool UserExists(string email)
    {
        const string query = "SELECT COUNT(*) FROM users WHERE email = @Email";

        using var connection = OpenConnection();
        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("Email", email.Trim().ToLower());

        var count = (long)command.ExecuteScalar();
        return count > 0;
    }

    public void AddUser(RegisterRequest request)
    {
        const string query = "INSERT INTO users (name, email, password) VALUES (@Name, @Email, @Password)";

        using var connection = OpenConnection();
        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("Name", request.Name);
        command.Parameters.AddWithValue("Email", request.Email.Trim().ToLower());
        command.Parameters.AddWithValue("Password", request.Password);

        command.ExecuteNonQuery();
    }

    public RegisterRequest GetUserByEmail(string email)
    {
        const string query = "SELECT email, password, name FROM users WHERE email = @Email";

        using var connection = OpenConnection();
        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("Email", email.Trim().ToLower());

        using var reader = command.ExecuteReader();
        if (reader.Read())
        {
            return new RegisterRequest
            {
                Email = reader.GetString(0),
                Password = reader.GetString(1),   
                Name = reader.GetString(2)
            };
        }
        
        return null;
    }
}
