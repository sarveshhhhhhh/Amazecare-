using System;
using System.ComponentModel.DataAnnotations;

namespace PAmazeCare.DTOs
{
    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }

        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;

        public string Diagnosis { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;

        public DateTime? RecordDate { get; set; }
    }

    public class CreateMedicalRecordDto
    {
        // Keep Appointment optional if you don't always create through appointments
        public int? AppointmentId { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        public string Diagnosis { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Treatment { get; set; }

        public DateTime? RecordDate { get; set; }
    }

    public class UpdateMedicalRecordDto
    {
        public string? Diagnosis { get; set; }
        public string? Description { get; set; }
        public string? Treatment { get; set; }

        public DateTime? RecordDate { get; set; }
    }

    
}
