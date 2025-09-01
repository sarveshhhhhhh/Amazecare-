namespace PAmazeCare.Models
{
    public class TestMaster
    {
        public int Id { get; set; }
        public string TestName { get; set; } = null!;
        public string? Description { get; set; }
        public string Timing { get; set; } = null!;
        public decimal Price { get; set; }
        public bool IsDeleted { get; set; } = false;

        public ICollection<RecommendedTest> RecommendedTests { get; set; } = new List<RecommendedTest>();
    }
}
