using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestMasterController : ControllerBase
    {
        private readonly ITestMasterService _testMasterService;

        public TestMasterController(ITestMasterService testMasterService)
        {
            _testMasterService = testMasterService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedTests([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _testMasterService.GetAllTestsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<ActionResult<List<TestMasterDto>>> GetAll()
        {
            var tests = await _testMasterService.GetAllTestsAsync();
            return Ok(tests);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TestMasterDto>> GetById(int id)
        {
            var test = await _testMasterService.GetTestByIdAsync(id);
            if (test == null) return NotFound();
            return Ok(test);
        }

        [HttpPost]
        public async Task<ActionResult<TestMasterDto>> Create(CreateTestMasterDto dto)
        {
            var createdTest = await _testMasterService.CreateTestAsync(dto);
            if (createdTest == null) return BadRequest("Failed to create test.");
            return CreatedAtAction(nameof(GetById), new { id = createdTest.Id }, createdTest);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTestMasterDto dto)
        {
            var updated = await _testMasterService.UpdateTestAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _testMasterService.DeleteTestAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
