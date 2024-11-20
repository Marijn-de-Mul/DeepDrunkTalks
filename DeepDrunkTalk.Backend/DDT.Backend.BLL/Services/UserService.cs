using DDT.Backend.ConversationService.Common.Models;
using DDT.Backend.UserService.BLL.Helpers;
using DDT.Backend.UserService.Common.Interfaces;
using DDT.Backend.UserService.Common.Models;
using DDT.Backend.UserService.Common.Models.Authentication;

namespace DDT.Backend.UserService.BLL.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;
        private readonly string _jwtSecret;

        public UserService(IUserRepository userRepository)
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
        
        public async Task<UserSettings> GetUserSettingsAsync(string token)
        {
            var userEmail = JwtHelper.GetUserEmailFromToken(token, _jwtSecret);

            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedAccessException("Invalid or missing email in the token.");
            }

            var user = await _userRepository.GetUserByEmailAsync(userEmail);

            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }

            return new UserSettings
            {
                VolumeLevel = user.VolumeLevel,
                RefreshFrequency = user.RefreshFrequency
            };
        }


        public async Task UpdateUserSettingsAsync(string token, UserSettings settings)
        {
            var userEmail = JwtHelper.GetUserEmailFromToken(token, _jwtSecret);

            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedAccessException("Invalid or missing email in the token.");
            }

            var user = await _userRepository.GetUserByEmailAsync(userEmail);

            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }

            user.VolumeLevel = settings.VolumeLevel;
            user.RefreshFrequency = settings.RefreshFrequency;

            await _userRepository.UpdateUserAsync(user);
        }
    }
}