using DDT.Backend.Common.Exceptions;
using DDT.Backend.Common.Logger;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DDT.Backend.API.Middleware
{
    public class TokenValidator
    {
        private readonly RequestDelegate _next;
        private readonly string _secret;
        private readonly Logger _logger;

        public TokenValidator(RequestDelegate next, string secret, Logger logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _secret = secret ?? throw new ArgumentNullException(nameof(secret));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        private static HashSet<string> ExcludedPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "/api/users/login",
            "/api/users/register",
            "/swagger"
        };

        private bool IsExcludedPath(string path)
        {
            var pathString = new Microsoft.AspNetCore.Http.PathString(path);
            return ExcludedPaths.Any(excluded => pathString.StartsWithSegments(new Microsoft.AspNetCore.Http.PathString(excluded), StringComparison.OrdinalIgnoreCase));
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status200OK;
                return;
            }

            if (IsExcludedPath(context.Request.Path))
            {
                await _next(context);
                return;
            }
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (token != null)
            {
                try
                {
                    var userId = ValidateTokenAndAttachUser(context, token);
                    _logger.LogInformation($"Token validated for user ID: {userId}");
                }
                catch (TokenValidationException ex)
                {
                    _logger.LogError($"Token validation failed: {ex.Message}", ex);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync(ex.Message);
                    return;
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Unexpected error occurred while validating token: {ex.Message}", ex);
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    await context.Response.WriteAsync("An error occurred while processing the token.");
                    return;
                }
            }
            else
            {
                var ex = new MissingTokenException();
                _logger.LogError($"Missing token: {ex.Message}", ex);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync(ex.Message);
                return;
            }

            await _next(context);
        }

        private int ValidateTokenAndAttachUser(HttpContext context, string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secret);
            SecurityToken validatedToken;

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out validatedToken);
            }
            catch (SecurityTokenExpiredException)
            {
                var ex = new TokenExpiredException();
                _logger.LogError($"Token expired: {ex.Message}", ex);
                throw ex;
            }
            catch (SecurityTokenException)
            {
                var ex = new InvalidTokenFormatException();
                _logger.LogError($"Invalid token format: {ex.Message}", ex);
                throw ex;
            }

            if (validatedToken is JwtSecurityToken jwtToken)
            {
                var userIdString = jwtToken.Claims.FirstOrDefault(x => x.Type == "nameid")?.Value;

                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    var ex = new TokenValidationException("Invalid or missing UserId format in token");
                    _logger.LogError($"Token validation failed: {ex.Message}", ex);
                    throw ex;
                }

                context.Items["UserId"] = userId;
                return userId;
            }
            else
            {
                var ex = new TokenValidationException("Invalid token type");
                _logger.LogError($"Token type is not JwtSecurityToken: {ex.Message}", ex);
                throw ex;
            }
        }
    }
}
