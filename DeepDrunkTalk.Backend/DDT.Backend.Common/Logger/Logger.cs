using System;
using System.IO;

namespace DDT.Backend.Common.Logger
{
    public class Logger : ILogger
    {
        private readonly bool _logToConsole;
        private readonly bool _logToFile;
        private readonly string _logFilePath;

        public Logger()
        {
            _logToConsole = Environment.GetEnvironmentVariable("LOG_TO_CONSOLE") == "True";
            _logToFile = Environment.GetEnvironmentVariable("LOG_TO_FILE") == "True";
            _logFilePath = Path.Combine(Directory.GetCurrentDirectory(), "logs", "logfile.txt");

            var logDirectory = Path.GetDirectoryName(_logFilePath);
            if (!Directory.Exists(logDirectory))
            {
                Directory.CreateDirectory(logDirectory);
            }
        }

        private void LogToConsole(string logLevel, string message)
        {
            Console.WriteLine($"{logLevel} | {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} | {message}");
        }

        private void LogToFile(string logLevel, string message)
        {
            try
            {
                File.AppendAllText(_logFilePath, $"{logLevel} | {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} | {message}\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to write log to file: {ex.Message}");
            }
        }

        public void LogInformation(string message, params object[] args)
        {
            var formattedMessage = $"{message}";
            if (_logToConsole)
            {
                LogToConsole("INFO", formattedMessage);
            }
            if (_logToFile)
            {
                LogToFile("INFO", formattedMessage);
            }
        }

        public void LogError(string message, Exception ex, params object[] args)
        {
            var formattedMessage = $"{message} | Exception: {ex.Message} | StackTrace: {ex.StackTrace}";
            if (_logToConsole)
            {
                LogToConsole("ERROR", formattedMessage);
            }
            if (_logToFile)
            {
                LogToFile("ERROR", formattedMessage);
            }
        }

        public void LogWarning(string message, params object[] args)
        {
            var formattedMessage = $"{message}";
            if (_logToConsole)
            {
                LogToConsole("WARN", formattedMessage);
            }
            if (_logToFile)
            {
                LogToFile("WARN", formattedMessage);
            }
        }

        public void LogDebug(string message, params object[] args)
        {
            var formattedMessage = $"{message}";
            if (_logToConsole)
            {
                LogToConsole("DEBUG", formattedMessage);
            }
            if (_logToFile)
            {
                LogToFile("DEBUG", formattedMessage);
            }
        }

        public void LogTrace(string message, params object[] args)
        {
            var formattedMessage = $"{message}";
            if (_logToConsole)
            {
                LogToConsole("TRACE", formattedMessage);
            }
            if (_logToFile)
            {
                LogToFile("TRACE", formattedMessage);
            }
        }
    }
}
