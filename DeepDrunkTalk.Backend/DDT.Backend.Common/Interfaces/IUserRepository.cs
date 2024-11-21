
using DDT.Backend.Common.Models;

namespace DDT.Backend.Common.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> UserExistsAsync(string email);
        Task AddUserAsync(User user);
        Task<User> GetUserByEmailAsync(string email);
        Task UpdateUserAsync(User user);
    }
}