using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PAmazeCare.Data;
using PAmazeCare.DTOs;
using PAmazeCare.Models;
using PAmazeCare.Models.Auth;
using PAmazeCare.Repositories.Interfaces;
using PAmazeCare.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly PAmazeCareContext _context;
        private readonly IUserRepository _userRepository;
        protected readonly ITokenService _tokenService;
        protected readonly ILogger<AuthService> _logger;

        public AuthService(
            PAmazeCareContext context,
            IUserRepository userRepository,
            ITokenService tokenService,
            ILogger<AuthService> logger)
        {
            _context = context;
            _userRepository = userRepository;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            try
            {
                if (await _userRepository.EmailExists(dto.Email))
                    return false;

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email.Trim().ToLower(),
                    PasswordHash = passwordHash,
                    UserType = dto.UserType,
                    Role = GetRoleFromUserType(dto.UserType),
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddUserAsync(user);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return false;
            }
        }

        public virtual async Task<object> LoginAsync(LoginDto dto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

                if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                    return null;

                var token = _tokenService.GenerateToken(user);
                
                return new
                {
                    Token = token,
                    UserType = user.UserType,
                    Email = user.Email,
                    FullName = user.FullName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return null;
            }
        }

        private int GetRoleFromUserType(string userType)
        {
            return userType?.ToLower() switch
            {
                "patient" => 1,
                "doctor" => 2,
                "admin" => 3,
                "superadmin" => 4,
                _ => 1 // Default to patient
            };
        }
    }
}
