namespace PAmazeCare.Models
{
    public class RecommendedTest
    {
        public int Id { get; set; }
        public string TestName { get; set; }
        public string Description { get; set; }
        public int MedicalRecordId { get; set; }
        public int TestId { get; set; }
        public bool IsDeleted { get; set; } = false;

        public MedicalRecord MedicalRecord { get; set; }
        public TestMaster Test { get; set; }
    }
}
