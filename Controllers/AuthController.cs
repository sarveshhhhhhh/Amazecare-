using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Models.Auth;
using PAmazeCare.Services.Interfaces;
using PAmazeCare.Attributes;
using PAmazeCare.Models;

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

                // Public registration only allows Patient role
                dto.UserType = "Patient";
                
                var result = await _authService.RegisterAsync(dto);

                return result
                    ? Ok(new { Message = "Registration successful." })
                    : BadRequest(new { Message = "Registration failed. Email may already exist." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Registration error", Error = ex.Message });
            }
        }

        [HttpPost("register-staff")]
        [RequirePermission(PermissionConstants.CREATE_ADMIN, PermissionConstants.CREATE_DOCTOR)]
        public async Task<IActionResult> RegisterStaff(RegisterDto dto)
        {
            // Get current user's role to validate creation permissions
            var currentUserType = User.FindFirst("UserType")?.Value;
            if (!Enum.TryParse<UserTypeEnum>(currentUserType, out var creatorRole))
            {
                return Forbid("Invalid user role.");
            }

            if (!Enum.TryParse<UserTypeEnum>(dto.UserType, out var targetRole))
            {
                return BadRequest("Invalid target user type.");
            }

            // Check if current user can create the target role
            if (!UserRoleHierarchy.CanCreateRole(creatorRole, targetRole))
            {
                return Forbid($"You don't have permission to create {dto.UserType} accounts.");
            }

            var result = await _authService.RegisterAsync(dto);

            return result
                ? Ok($"{dto.UserType} registration successful.")
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
