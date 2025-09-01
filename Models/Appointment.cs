using System;
using System.Collections.Generic;

namespace PAmazeCare.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string? Symptoms { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string Status { get; set; } = "Scheduled";

        public Patient Patient { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
        public bool IsDeleted { get; set; } = false;

        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}
