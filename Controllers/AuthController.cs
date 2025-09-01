using Microsoft.AspNetCore.Mvc;
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
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    return BadRequest(new { Message = "Validation failed", Errors = errors });
                }

                // Allow any user type registration
                // Keep the UserType from the request (Patient, Doctor, Admin)

                await _authService.RegisterAsync(dto);

                return Ok(new { Message = "Registration successful." });
            }
            catch (Exception ex)
            {
                // Return the exact exception message (e.g., "Email already exists.")
                return BadRequest(new { Message = ex.Message });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    return BadRequest(new { Message = "Validation failed", Errors = errors });
                }

                var authResponse = await _authService.LoginAsync(dto);

                if (authResponse == null)
                    return Unauthorized(new { Message = "Invalid email or password." });

                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Login error", Error = ex.Message });
            }
        }
    }
}
