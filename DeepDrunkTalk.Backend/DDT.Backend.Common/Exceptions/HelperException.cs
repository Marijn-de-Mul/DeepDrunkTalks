namespace DDT.Backend.BLL.Exceptions.HelperExceptions
{
    public class HelperException : Exception
    {
        public HelperException(string message) : base(message) { }
    }
    
    public class JwtGenerationException : HelperException
    {
        public JwtGenerationException() : base("An error occurred while generating the authentication token.") { }
    }
}