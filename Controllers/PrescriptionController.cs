using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllPrescriptionsPaged([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _prescriptionService.GetAllPrescriptionsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPrescriptions()
        {
            var prescriptions = await _prescriptionService.GetAllPrescriptionsAsync();
            return Ok(prescriptions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPrescriptionById(int id)
        {
            var prescription = await _prescriptionService.GetPrescriptionByIdAsync(id);
            if (prescription == null)
                return NotFound($"Prescription with ID {id} not found");

            return Ok(prescription);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _prescriptionService.CreatePrescriptionAsync(dto);
                return CreatedAtAction(nameof(GetPrescriptionById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message); // For validation issues
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to create prescription: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrescription(int id, UpdatePrescriptionDto dto)
        {
            var updated = await _prescriptionService.UpdatePrescriptionAsync(id, dto);
            if (!updated)
                return NotFound($"Prescription with ID {id} not found");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var deleted = await _prescriptionService.DeletePrescriptionAsync(id);
            if (!deleted)
                return NotFound($"Prescription with ID {id} not found");

            return NoContent();
        }
    }
}
