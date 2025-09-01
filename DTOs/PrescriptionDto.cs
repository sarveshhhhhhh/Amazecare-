using System;

namespace PAmazeCare.DTOs
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string Medication { get; set; }
        public string Dosage { get; set; }
        public string Timing { get; set; }
        public DateTime PrescribedDate { get; set; }
        public int MedicalRecordId { get; set; }
        public string MedicineName { get; set; }


    }

    public class CreatePrescriptionDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string Medication { get; set; }
        public int MedicalRecordId { get; set; }
        public string MedicineName { get; set; }


        public string Dosage { get; set; }
        public string? Timing { get; set; } 
    }

    public class UpdatePrescriptionDto
    {
        public string Medication { get; set; }
        public string Dosage { get; set; }
        public string Timing { get; set; } // Allow updating timing
    }
}
