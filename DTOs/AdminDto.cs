using System.ComponentModel.DataAnnotations;

namespace PAmazeCare.DTOs
{
    public class AdminDto
    {
        public int Id { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class CreateAdminDto
    {
        [Required]
        public string AdminName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }
    }

    public class UpdateAdminDto
    {
        public string? AdminName { get; set; }
        public string? Email { get; set; }
    }
}
