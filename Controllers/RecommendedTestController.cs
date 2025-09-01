using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendedTestController : ControllerBase
    {
        private readonly IRecommendedTestService _recommendedTestService;

        public RecommendedTestController(IRecommendedTestService recommendedTestService)
        {
            _recommendedTestService = recommendedTestService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllRecommendedTestsPaged([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _recommendedTestService.GetAllRecommendedTestsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<ActionResult<List<RecommendedTestDto>>> GetAllRecommendedTests()
        {
            var tests = await _recommendedTestService.GetAllRecommendedTestsAsync();
            return Ok(tests);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecommendedTestDto>> GetRecommendedTestById(int id)
        {
            var test = await _recommendedTestService.GetRecommendedTestByIdAsync(id);
            if (test == null)
                return NotFound(new { message = $"RecommendedTest with ID {id} not found" });

            return Ok(test);
        }

        [HttpPost]
        public async Task<ActionResult<RecommendedTestDto>> CreateRecommendedTest([FromBody] CreateRecommendedTestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdTest = await _recommendedTestService.CreateRecommendedTestAsync(dto);
            if (createdTest == null)
                return BadRequest("Failed to create recommended test. Please check the input data.");

            return CreatedAtAction(nameof(GetRecommendedTestById), new { id = createdTest.Id }, createdTest);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecommendedTest(int id, [FromBody] UpdateRecommendedTestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _recommendedTestService.UpdateRecommendedTestAsync(id, dto);
            if (!updated)
                return NotFound(new { message = $"RecommendedTest with ID {id} not found or already deleted" });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecommendedTest(int id)
        {
            var deleted = await _recommendedTestService.DeleteRecommendedTestAsync(id);
            if (!deleted)
                return NotFound(new { message = $"RecommendedTest with ID {id} not found or already deleted" });

            return NoContent();
        }
    }
}
