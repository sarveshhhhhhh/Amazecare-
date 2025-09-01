namespace PAmazeCare.DTOs
{
    public class DosageMasterDto
    {
        public int Id { get; set; }
        public string DosageName { get; set; }
        public string? Description { get; set; }
    }

    public class CreateDosageMasterDto
    {
        public string DosageName { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateDosageMasterDto
    {
        public string DosageName { get; set; }
        public string? Description { get; set; }
    }
}
