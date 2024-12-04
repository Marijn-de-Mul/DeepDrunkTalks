namespace DDT.Backend.Common.Exceptions
{
    public class DatabaseException : Exception
    {
        public DatabaseException() 
            : base("An error occurred with the database operation.")
        {
        }

        public DatabaseException(string message) 
            : base(message)
        {
        }

        public DatabaseException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }
    }
}