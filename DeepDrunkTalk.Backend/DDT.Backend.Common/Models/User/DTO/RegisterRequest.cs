using System.ComponentModel.DataAnnotations.Schema;

namespace DDT.Backend.Common.Models.Authentication;

public class RegisterRequest
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }

    [NotMapped] public string ConfirmPassword { get; set; }
}