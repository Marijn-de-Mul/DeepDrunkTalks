namespace DDT.Backend.Common.Exceptions
{
    public class TokenException : Exception
    {
        public TokenException(string message) : base(message) { }
    }

    public class TokenValidationException : TokenException
    {
        public TokenValidationException(string message) : base(message) { }
    }

    public class InvalidTokenFormatException : TokenValidationException
    {
        public InvalidTokenFormatException() : base("The token format is invalid.") { }
    }

    public class TokenExpiredException : TokenValidationException
    {
        public TokenExpiredException() : base("The token has expired.") { }
    }

    public class MissingTokenException : TokenValidationException
    {
        public MissingTokenException() : base("Authorization token is required.") { }
    }
}
