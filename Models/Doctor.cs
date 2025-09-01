namespace PAmazeCare.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? ContactNumber { get; set; }
        public string? Specialty { get; set; }

        public int UserId { get; set; }   // FK to User

        public bool IsDeleted { get; set; } = false;

        // Navigation Properties
        public User? User { get; set; }
        public ICollection<Appointment>? Appointments { get; set; }
    }
}
