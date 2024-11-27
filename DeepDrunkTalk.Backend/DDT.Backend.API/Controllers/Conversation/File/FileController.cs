using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.API.Controllers.Audio.File;

public class FileController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}