using PAmazeCare.Models;

namespace PAmazeCare.Services
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
