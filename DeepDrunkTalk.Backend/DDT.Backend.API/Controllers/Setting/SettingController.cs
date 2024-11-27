using Microsoft.AspNetCore.Mvc;

namespace DDT.Backend.UserService.API.Controllers.Setting;

public class SettingController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}