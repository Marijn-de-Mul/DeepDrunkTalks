using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.API.Controllers.Audio;

public class AudioController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}