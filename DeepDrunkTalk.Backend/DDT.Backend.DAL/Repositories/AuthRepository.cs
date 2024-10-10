using DDT.Backend.UserService.Common;
using Microsoft.EntityFrameworkCore;
using DDT.Backend.UserService.Common.Interfaces;
using DDT.Backend.UserService.Common.Models.Authentication;

namespace DDT.Backend.UserService.DAL.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserDbContext _context;

        public AuthRepository(UserDbContext context)
        {
            _context = context;
        }

        public bool UserExists(string email)
        {
            return _context.Users.Any(u => u.Email.Trim().ToLower() == email.Trim().ToLower());
        }

        public void AddUser(RegisterRequest request)
        {
            request.Password = request.Password; 
            _context.Users.Add(request);
            _context.SaveChanges();
        }

        public RegisterRequest GetUserByEmail(string email)
        {
            return _context.Users.FirstOrDefault(u => u.Email.Trim().ToLower() == email.Trim().ToLower());
        }
    }
}