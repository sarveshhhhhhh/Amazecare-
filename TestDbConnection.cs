using Microsoft.EntityFrameworkCore;
using PAmazeCare.Data;
using Microsoft.Extensions.Configuration;

namespace PAmazeCare
{
    public class TestDbConnection
    {
        public static void Main(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            Console.WriteLine($"Connection String: {connectionString}");

            var options = new DbContextOptionsBuilder<PAmazeCareContext>()
                .UseSqlServer(connectionString)
                .Options;

            try
            {
                using var context = new PAmazeCareContext(options);
                Console.WriteLine("Testing database connection...");
                
                // Test connection
                context.Database.OpenConnection();
                Console.WriteLine("✓ Database connection successful!");
                
                // Test if database exists
                bool canConnect = context.Database.CanConnect();
                Console.WriteLine($"✓ Can connect to database: {canConnect}");
                
                // Check if migrations are needed
                var pendingMigrations = context.Database.GetPendingMigrations();
                if (pendingMigrations.Any())
                {
                    Console.WriteLine($"⚠ Pending migrations: {string.Join(", ", pendingMigrations)}");
                }
                else
                {
                    Console.WriteLine("✓ Database is up to date");
                }
                
                context.Database.CloseConnection();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Database connection failed: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
