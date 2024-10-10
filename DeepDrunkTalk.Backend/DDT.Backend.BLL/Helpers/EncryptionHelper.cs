using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace DDT.Backend.UserService.BLL.Helpers;

public class EncryptionHelper
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 4;

    public static string Encrypt(string password)
    {
        try
        {
            var salt = GenerateSalt();
            var hash = GenerateHash(password, salt);

            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);   
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            return null;
        }
    }

    public static bool Verify(string password, string encryptedPassword)
    {
        try
        {
            var parts = encryptedPassword.Split(':');
            if (parts.Length != 2) return false;

            var salt = Convert.FromBase64String(parts[0]);
            var hash = Convert.FromBase64String(parts[1]);

            var newHash = GenerateHash(password, salt);

            return SlowEquals(hash, newHash);   
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            return false;
        }
    }

    private static byte[] GenerateSalt()
    {
        try
        {
            var salt = new byte[SaltSize];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(salt);
            return salt;    
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            return null;
        }
    }

    private static byte[] GenerateHash(string password, byte[] salt)
    {
        try
        {
            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
            argon2.Salt = salt;
            argon2.DegreeOfParallelism = 16;
            argon2.MemorySize = 600_000;
            argon2.Iterations = Iterations;

            return argon2.GetBytes(HashSize);
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            return null;
        }
    }

    private static bool SlowEquals(byte[] a, byte[] b)
    {
        try
        {
            var diff = (uint)a.Length ^ (uint)b.Length;
            for (var i = 0; i < a.Length && i < b.Length; i++) diff |= (uint)(a[i] ^ b[i]);
            return diff == 0;
        }
        
        catch (Exception e)
        {
            Console.WriteLine(e);
            return false;
        }
    }
}