namespace PAmazeCare.Models
{
    public class Admin
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;

        public User User { get; set; } = null!;
    }
}
