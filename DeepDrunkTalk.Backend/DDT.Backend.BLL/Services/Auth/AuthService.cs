using DDT.Backend.BLL.Exceptions.HelperExceptions;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.BLL.Helpers;
using DDT.Backend.Common;
using DDT.Backend.Common.Exceptions;
using DDT.Backend.Common.Logger;
using DDT.Backend.Common.Models.Authentication;
using DDT.Backend.Common.Models;
using MissingFieldException = System.MissingFieldException;

namespace DDT.Backend.BLL.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly string _jwtSecret;
        private readonly ILogger _logger;

        public AuthService(IUserRepository userRepository, ILogger logger)
        {
            _userRepository = userRepository;
            _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
            _logger = logger;
        }


        public async Task<string> RegisterUser(RegisterRequest request)
        {
            _logger.LogInformation($"Starting user registration for email: {request.Email}");

            try
            {
                if (string.IsNullOrWhiteSpace(request.Name) ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password) ||
                    string.IsNullOrWhiteSpace(request.ConfirmPassword))
                {
                    _logger.LogWarning($"Registration failed: Missing required fields for email: {request.Email}");
                    throw new MissingFieldException();
                }

                User? userExistsCheck = await _userRepository.GetUserByEmail(request.Email);

                if (userExistsCheck != null && await _userRepository.UserExists(userExistsCheck.UserId))
                {
                    _logger.LogWarning($"Registration failed: User already exists for email: {request.Email}");
                    throw new UserAlreadyExistsException();
                }

                if (request.Password != request.ConfirmPassword)
                {
                    _logger.LogWarning($"Registration failed: Password mismatch for email: {request.Email}");
                    throw new PasswordMismatchException();
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

                try
                {
                    await _userRepository.AddUser(user);
                    _logger.LogInformation($"User registration successful for email: {request.Email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error adding user during registration for email: {request.Email}", ex);
                    throw new RegistrationException("An error occurred during user registration.");
                }

                try
                {
                    var token = JwtHelper.GenerateJwtToken(user.UserId, user.Name, _jwtSecret);
                    _logger.LogInformation($"JWT token generated successfully for email: {request.Email}");
                    return token;
                }
                catch (JwtGenerationException ex)
                {
                    _logger.LogError($"Error generating JWT for user registration for email: {request.Email}", ex);
                    throw new JwtGenerationException();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An unexpected error occurred during registration for email: {request.Email}", ex);
                throw; 
            }
        }

        public async Task<string> LoginUser(LoginRequest request)
        {
            _logger.LogInformation($"Starting user login for email: {request.Email}");

            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                {
                    _logger.LogWarning($"Login failed: Missing email or password for email: {request.Email}");
                    throw new MissingFieldException(); 
                }

                var user = await _userRepository.GetUserByEmail(request.Email);

                if (user == null)
                {
                    _logger.LogWarning($"Login failed: User not found for email: {request.Email}");
                    throw new UserNotFoundException(); 
                }

                if (!EncryptionHelper.Verify(request.Password, user.Password))
                {
                    _logger.LogWarning($"Login failed: Invalid credentials for email: {request.Email}");
                    throw new InvalidCredentialsException(); 
                }

                var token = JwtHelper.GenerateJwtToken(user.UserId, user.Name, _jwtSecret);
                _logger.LogInformation($"User login successful for email: {request.Email}");
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError($"An unexpected error occurred during login for email: {request.Email}", ex);
                throw; 
            }
        }
    }
}
