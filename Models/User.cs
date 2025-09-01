namespace PAmazeCare.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }

        public string PasswordHash { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // For seeding only

        public string UserType { get; set; } = string.Empty;

        public int Role { get; set; }
        public DateTime CreatedAt { get; set; }




    }

}
