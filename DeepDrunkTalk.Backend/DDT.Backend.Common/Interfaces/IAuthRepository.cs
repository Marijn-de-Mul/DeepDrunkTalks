

using DDT.Backend.UserService.Common.Models.Authentication;

namespace DDT.Backend.UserService.Common.Interfaces;

public interface IAuthRepository
{
    bool UserExists(string email);
    void AddUser(RegisterRequest request);
    RegisterRequest GetUserByEmail(string email); 
}