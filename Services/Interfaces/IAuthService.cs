using PAmazeCare.DTOs;
using PAmazeCare.Models.Auth;

namespace PAmazeCare.Services.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterDto dto);
        Task<AuthResponse> LoginAsync(LoginDto dto);
    }
}
