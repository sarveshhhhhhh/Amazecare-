using System;

namespace PAmazeCare.Models
{
    public class Prescription
    {
        public int Id { get; set; }
        public string Timing { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public int DoctorId { get; set; }

        public int MedicalRecordId { get; set; }
        public string MedicineName { get; set; } 


        public Patient Patient { get; set; }
        public Doctor Doctor { get; set; }

        public string Medication { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;
        public string Dosage { get; set; } = string.Empty;
        public DateTime PrescribedDate { get; set; }
    }
}
