﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace DDT.Backend.BLL.Helpers;

public static class JwtHelper
{
    public static string GenerateJwtToken(int userId, string username, string secret)
    {
        if (string.IsNullOrEmpty(secret))
            throw new ArgumentNullException(nameof(secret), "Secret cannot be null or empty.");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new(ClaimTypes.NameIdentifier, userId.ToString()),
                new(ClaimTypes.Name, username)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static string GetUserIdFromToken(string token, string secret)
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(secret)) return null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secret);
            var validationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            var userId = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return userId;
        }
        catch
        {
            return null;
        }
    }
}