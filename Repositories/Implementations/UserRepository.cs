using PAmazeCare.Data;
using PAmazeCare.Models;
using PAmazeCare.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace PAmazeCare.Repositories.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly PAmazeCareContext _context;

        public UserRepository(PAmazeCareContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> EmailExists(string email)
        {
            var normalizedEmail = email.Trim().ToLower();
            
            // Get all users and check in memory to avoid SQL collation issues
            var allUsers = await _context.Users.Select(u => u.Email).ToListAsync();
            var exists = allUsers.Any(userEmail => userEmail.Trim().ToLower() == normalizedEmail);
            
            // Debug logging
            Console.WriteLine($"EmailExists check - Input: '{email}', Normalized: '{normalizedEmail}', Exists: {exists}");
            Console.WriteLine($"Total users in database: {allUsers.Count}");
            
            if (exists)
            {
                var matchingEmail = allUsers.First(userEmail => userEmail.Trim().ToLower() == normalizedEmail);
                Console.WriteLine($"Matching email found: '{matchingEmail}'");
            }
            
            return exists;
        }

        public async Task AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User?> GetByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLower());
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLower());
        }
    }
}
