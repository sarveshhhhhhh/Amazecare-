using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DosageMasterController : ControllerBase
    {
        private readonly IDosageMasterService _dosageMasterService;

        public DosageMasterController(IDosageMasterService dosageMasterService)
        {
            _dosageMasterService = dosageMasterService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllDosagesPaged([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _dosageMasterService.GetAllDosagesPagedAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<ActionResult<List<DosageMasterDto>>> GetAllDosages()
        {
            var dosages = await _dosageMasterService.GetAllDosagesAsync();
            return Ok(dosages);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DosageMasterDto>> GetDosageById(int id)
        {
            var dosage = await _dosageMasterService.GetDosageByIdAsync(id);
            if (dosage == null) return NotFound();
            return Ok(dosage);
        }

        [HttpPost]
        public async Task<ActionResult<DosageMasterDto>> CreateDosage(CreateDosageMasterDto dto)
        {
            var createdDosage = await _dosageMasterService.CreateDosageAsync(dto);
            if (createdDosage == null) return BadRequest("Failed to create dosage.");
            return CreatedAtAction(nameof(GetDosageById), new { id = createdDosage.Id }, createdDosage);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDosage(int id, UpdateDosageMasterDto dto)
        {
            var updated = await _dosageMasterService.UpdateDosageAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDosage(int id)
        {
            var deleted = await _dosageMasterService.DeleteDosageAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
