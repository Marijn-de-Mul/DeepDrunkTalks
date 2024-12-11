namespace DDT.Backend.Common.Exceptions
{
    public class UserException : Exception
    {
        public UserException(string message) : base(message) { }
    }
    public class RegistrationException : UserException
    {
        public RegistrationException(string message) : base(message) { }
    }
    
    public class LoginException : UserException
    {
        public LoginException(string message) : base(message) { }
    }

    public class MissingFieldException : RegistrationException
    {
        public MissingFieldException() : base("All fields are required.") { }
    }

    public class UserAlreadyExistsException : RegistrationException
    {
        public UserAlreadyExistsException() : base("User already exists.") { }
    }

    public class PasswordMismatchException : RegistrationException
    {
        public PasswordMismatchException() : base("Passwords do not match.") { }
    }

    public class UserNotFoundException : UserException
    {
        public UserNotFoundException() : base("Invalid Credentials.") { }
    }

    public class InvalidCredentialsException : UserException
    {
        public InvalidCredentialsException() : base("Invalid Credentials.") { }
    }
    
    public class InvalidPasswordException : UserException
    {
        public InvalidPasswordException() : base("Invalid password.") { }
    }
}