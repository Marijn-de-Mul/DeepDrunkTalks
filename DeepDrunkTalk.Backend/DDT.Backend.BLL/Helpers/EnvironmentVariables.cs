namespace DDT.Backend.BLL.Helpers;

public class EnvironmentVariables
{
    public static void LoadEnvironments()
    {
        try
        {
            var envVars = File.ReadAllLines(".env")
                .Select(line => line.Split(new[] { '=' }, 2))
                .Where(parts => parts.Length == 2)
                .ToDictionary(parts => parts[0], parts => parts[1]);

            foreach (var (key, value) in envVars) Environment.SetEnvironmentVariable(key, value);
        }

        catch (Exception e)
        {
            Console.WriteLine(e);
        }
    }
}