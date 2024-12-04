
using DDT.Backend.Common.Models;

namespace DDT.Backend.Common.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> UserExists(int userId);
        Task AddUser(User user);
        Task<User> GetUserById(int userId);
        Task<User> GetUserByEmail(string email);
        Task UpdateUser(User user);
    }
}