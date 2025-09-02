using PAmazeCare.Models.Auth;

namespace PAmazeCare.Services.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterDto dto);
        Task<object> LoginAsync(LoginDto dto);
    }
}
