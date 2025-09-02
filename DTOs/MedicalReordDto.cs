namespace PAmazeCare.DTOs
{
    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? AppointmentId { get; set; }
    }

    public class CreateMedicalRecordDto
    {
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
        public DateTime Date { get; set; }
        public int? AppointmentId { get; set; }
    }

    public class UpdateMedicalRecordDto
    {
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
        public DateTime Date { get; set; }
    }
}
