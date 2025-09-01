using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;

        public MedicalRecordController(IMedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllMedicalRecordsPaged([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _medicalRecordService.GetAllMedicalRecordsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<ActionResult<List<MedicalRecordDto>>> GetAllMedicalRecords()
        {
            var records = await _medicalRecordService.GetAllMedicalRecordsAsync();
            return Ok(records);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalRecordDto>> GetMedicalRecordById(int id)
        {
            var record = await _medicalRecordService.GetMedicalRecordByIdAsync(id);
            if (record == null)
                return NotFound(new { message = $"MedicalRecord with ID {id} not found" });

            return Ok(record);
        }

        [HttpPost]
        public async Task<ActionResult<MedicalRecordDto>> CreateMedicalRecord([FromBody] CreateMedicalRecordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdRecord = await _medicalRecordService.CreateMedicalRecordAsync(dto);
            if (createdRecord == null)
                return BadRequest("Failed to create medical record. Please check the input data.");

            return CreatedAtAction(nameof(GetMedicalRecordById), new { id = createdRecord.Id }, createdRecord);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicalRecord(int id, [FromBody] UpdateMedicalRecordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _medicalRecordService.UpdateMedicalRecordAsync(id, dto);
            if (!updated)
                return NotFound(new { message = $"MedicalRecord with ID {id} not found or already deleted" });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalRecord(int id)
        {
            var deleted = await _medicalRecordService.DeleteMedicalRecordAsync(id);
            if (!deleted)
                return NotFound(new { message = $"MedicalRecord with ID {id} not found or already deleted" });

            return NoContent();
        }
    }
}
