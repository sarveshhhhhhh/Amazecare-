using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;

        public MedicalRecordController(IMedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllMedicalRecords([FromQuery] PaginationParams paginationParams)
        {
            // Safety defaults
            paginationParams.PageNumber = paginationParams.PageNumber <= 0 ? 1 : paginationParams.PageNumber;
            paginationParams.PageSize = paginationParams.PageSize <= 0 ? 10 : paginationParams.PageSize;

            var pagedResult = await _medicalRecordService.GetAllMedicalRecordsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _medicalRecordService.GetAllMedicalRecordsAsync();
            return Ok(records);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _medicalRecordService.GetMedicalRecordByIdAsync(id);
            if (record == null)
                return NotFound($"Medical record with ID {id} not found");

            return Ok(record);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMedicalRecordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _medicalRecordService.CreateMedicalRecordAsync(dto);
            if (created == null)
                return BadRequest("Failed to create medical record");

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMedicalRecordDto dto)
        {
            var updated = await _medicalRecordService.UpdateMedicalRecordAsync(id, dto);
            if (!updated)
                return NotFound($"Medical record with ID {id} not found or not updated");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _medicalRecordService.DeleteMedicalRecordAsync(id);
            if (!deleted)
                return NotFound($"Medical record with ID {id} not found");

            return NoContent();
        }
    }
}
