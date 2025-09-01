namespace PAmazeCare.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }

        public string PasswordHash { get; set; }

        public string UserType { get; set; }

        public int Role { get; set; }
        public DateTime CreatedAt { get; set; }




    }

}
