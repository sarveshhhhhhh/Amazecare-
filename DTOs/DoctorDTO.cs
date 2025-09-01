namespace PAmazeCare.DTOs
{
    public class DoctorDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? ContactNumber { get; set; }
        public string? Specialty { get; set; }
    }
}
