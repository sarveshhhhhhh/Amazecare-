using System.ComponentModel.DataAnnotations;

namespace PAmazeCare.DTOs
{
    public class PatientDto
    {
        public int Id { get; set; }

        [Required]
        public string? FullName { get; set; }

        [Required, EmailAddress]
        public string? Email { get; set; }

        public string? ContactNumber { get; set; }

        public string? Address { get; set; }

        [Required]
        public DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? BloodGroup { get; set; }

        public string? EmergencyContact { get; set; }

        public string Password { get; set; }

        public int? UserId { get; set; }
    }
}
