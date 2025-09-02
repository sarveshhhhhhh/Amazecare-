namespace PAmazeCare.Models
{
    public class Patient
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Gender { get; set; }
        public string? ContactNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? BloodGroup { get; set; }
        public string? EmergencyContact { get; set; }

        public bool IsDeleted { get; set; } = false;

        public User User { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Prescription> Prescriptions { get; set; }  

    }

}
