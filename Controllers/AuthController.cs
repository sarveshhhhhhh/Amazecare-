using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Models.Auth;
using PAmazeCare.Services.Interfaces;

namespace PAmazeCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            return result
                ? Ok("Registration successful.")
                : BadRequest("Registration failed.");

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var token = await _authService.LoginAsync(dto);

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Invalid credentials.");

            return Ok(new { Token = token });
        }

    }
}
