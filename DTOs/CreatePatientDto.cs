namespace PAmazeCare.DTOs
{
    public class CreatePatientDto
    {
        public string FullName { get; set; }
        public DateTime DOB { get; set; }
        public string Gender { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string Password { get; set; }

    }
}
