using DDT.Backend.UserService.BLL.Helpers;
using DDT.Backend.UserService.Common.Interfaces;
using DDT.Backend.UserService.Common.Models;
using DDT.Backend.UserService.Common.Models.Authentication;
using Microsoft.Extensions.Configuration;

namespace DDT.Backend.UserService.BLL.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;
        private readonly string _jwtSecret;

        public UserService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
        }

        public async Task<string> RegisterUserAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                throw new ArgumentException("All fields are required.");
            }

            if (await _userRepository.UserExistsAsync(request.Email))
            {
                throw new ArgumentException("User already exists.");
            }

            if (request.Password != request.ConfirmPassword)
            {
                throw new ArgumentException("Passwords do not match.");
            } 

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = EncryptionHelper.Encrypt(request.Password),
                CreatedAt = DateTime.UtcNow, 
                UpdatedAt = DateTime.UtcNow,
                Settings = new List<Setting>(),
                Conversations = new List<Conversation>()
            };

            await _userRepository.AddUserAsync(user);

            var token = JwtHelper.GenerateJwtToken(user.Email, user.Name, _jwtSecret);
            return token;
        }

        public async Task<string> LoginUserAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("Email and password are required.");
            }

            var user = await _userRepository.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                throw new ArgumentException("Invalid email or password.");
            }

            if (!EncryptionHelper.Verify(request.Password, user.Password))
            {
                throw new ArgumentException("Invalid email or password.");
            }

            if (EncryptionHelper.Verify(request.Password, user.Password))
            {
                var token = JwtHelper.GenerateJwtToken(user.Email, user.Name, _jwtSecret);
                return token;
            }

            return null;
        }
    }
}