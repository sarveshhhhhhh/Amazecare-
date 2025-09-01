using PAmazeCare.Models;

namespace PAmazeCare.Repositories.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> GetUserByEmailAsync(string email);
        Task<bool> EmailExists(string email); 
        Task AddUserAsync(User user);
        Task<User?> GetByEmail(string email);

    }
}
