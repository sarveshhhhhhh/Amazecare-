using System;

namespace PAmazeCare.Models
{
    public class MedicalRecord
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public int DoctorId { get; set; }

        public string? Diagnosis { get; set; }     
        public string? Description { get; set; } 
        public string? Treatment { get; set; }     

        public DateTime? RecordDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
    }
}
