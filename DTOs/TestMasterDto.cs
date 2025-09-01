namespace PAmazeCare.DTOs
{
    public class TestMasterDto
    {
        public int Id { get; set; }
        public string TestName { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string Timing { get; set; }
    }

    public class CreateTestMasterDto
    {
        public string TestName { get; set; }
        public string? Description { get; set; }
        public string Timing { get; set; }
        public decimal Price { get; set; }
    }

    public class UpdateTestMasterDto
    {
        public string TestName { get; set; }
        public string? Description { get; set; }
        public string Timing { get; set; }
        public decimal Price { get; set; }
    }
}
