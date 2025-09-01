using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PAmazeCare.Data;
using PAmazeCare.DTOs;
using PAmazeCare.Models;
using PAmazeCare.Models.Auth;
using PAmazeCare.Repositories.Interfaces;
using PAmazeCare.Services.Interfaces;

namespace PAmazeCare.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly PAmazeCareContext _context;
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;

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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var normalizedEmail = dto.Email.Trim().ToLower();
                
                _logger.LogInformation($"Registration attempt for email: {normalizedEmail}");
                
                // Check if email already exists
                var emailExists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
                
                if (emailExists)
                {
                    throw new InvalidOperationException("Email already exists.");
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var user = new User
                {
                    FullName = dto.FullName,
                    Email = normalizedEmail,
                    PasswordHash = passwordHash,
                    UserType = dto.UserType,
                    Role = GetRoleFromUserType(dto.UserType),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                
                var saveResult = await _context.SaveChangesAsync();
                _logger.LogInformation($"SaveChanges result: {saveResult} rows affected");
                
                await transaction.CommitAsync();
                _logger.LogInformation($"Transaction committed. User registered successfully: {normalizedEmail}");
                
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Registration failed for email: {dto.Email}");
                throw;
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginDto dto)
        {
            try
            {
                var normalizedEmail = dto.Email.Trim().ToLower();
                _logger.LogInformation($"Login attempt for email: {normalizedEmail}");

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

                if (user == null)
                {
                    _logger.LogWarning($"User not found for email: {normalizedEmail}");
                    return null;
                }

                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    _logger.LogWarning($"Invalid password for email: {normalizedEmail}");
                    return null;
                }

                var token = _tokenService.GenerateToken(user);
                _logger.LogInformation($"Login successful for email: {normalizedEmail}");
                
                return new AuthResponse
                {
                    Token = token,
                    UserType = user.UserType
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
                _ => 1 // Default to patient
            };
        }
    }
}
