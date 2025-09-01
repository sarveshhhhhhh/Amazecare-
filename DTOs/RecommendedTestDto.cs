namespace PAmazeCare.DTOs
{
    public class RecommendedTestDto
    {
        public int Id { get; set; }
        public string TestName { get; set; }
        public string Description { get; set; }
        public int MedicalRecordId { get; set; }
        public int TestId { get; set; }
    }

    public class CreateRecommendedTestDto
    {
        public string TestName { get; set; }
        public string Description { get; set; }
        public int MedicalRecordId { get; set; }
        public int TestId { get; set; }
    }

    public class UpdateRecommendedTestDto
    {
        public string TestName { get; set; }
        public string Description { get; set; }
        public int MedicalRecordId { get; set; }
        public int TestId { get; set; }
    }
}
