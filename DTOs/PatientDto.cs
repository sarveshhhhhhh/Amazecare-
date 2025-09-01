using System.ComponentModel.DataAnnotations;

namespace PAmazeCare.DTOs
{
    public class PatientDto
    {
        public int Id { get; set; }

        [Required]
        public string? FullName { get; set; }

        [Required, EmailAddress]
        public string?  Email { get; set; }

        public string?  ContactNumber { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public DateTime? DateOfBirth { get; set; }

        public int? UserId { get; set; }
    }

}
