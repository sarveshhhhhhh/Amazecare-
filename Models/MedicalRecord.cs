namespace PAmazeCare.Models
{
    public class MedicalRecord
    {
        public int Id { get; set; }
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        public int? AppointmentId { get; set; }
        
        // Navigation property
        public Appointment? Appointment { get; set; }
    }
}
