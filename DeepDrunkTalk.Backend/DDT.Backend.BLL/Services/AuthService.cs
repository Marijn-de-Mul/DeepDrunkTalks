using DDT.Backend.UserService.BLL.Helpers;
using DDT.Backend.UserService.Common.Interfaces;
using DDT.Backend.UserService.Common.Models.Authentication;
using Microsoft.Extensions.Configuration;

namespace DDT.Backend.UserService.BLL.Services;

public class AuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly string _jwtSecret;

    public AuthService(IAuthRepository authRepository, IConfiguration configuration)
    {
        _authRepository = authRepository;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
    }

    public string RegisterUser(RegisterRequest request)
    {
        if (_authRepository.UserExists(request.Email))
        {
            return null;
        }

        if (request.Password != request.ConfirmPassword)
        {
            return null;
        }

        request.ConfirmPassword = "";
        request.Password = EncryptionHelper.Encrypt(request.Password);

        _authRepository.AddUser(request);
        
        var token = JwtHelper.GenerateJwtToken(request.Email, request.Name,
            _jwtSecret); 
        Console.WriteLine("token: " + token);
        return token;
    }

    public string LoginUser(LoginRequest request)
    {
        var user = _authRepository.GetUserByEmail(request.Email);

        if (user == null)
        {
            return null;
        }

        if (EncryptionHelper.Verify(request.Password, user.Password))
        {
            var token = JwtHelper.GenerateJwtToken(user.Email, user.Name, _jwtSecret); 
            return token;
        }

        return null;
    }
}