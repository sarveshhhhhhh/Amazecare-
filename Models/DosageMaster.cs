namespace PAmazeCare.Models
{
    public class DosageMaster
    {
        public int Id { get; set; }
        public string DosageName { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;

        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}
