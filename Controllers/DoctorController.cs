using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ILogger<DoctorController> _logger;

        public DoctorController(IDoctorService doctorService, ILogger<DoctorController> logger)
        {
            _doctorService = doctorService;
            _logger = logger;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllDoctors([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedDoctors = await _doctorService.GetAllDoctorsAsync(paginationParams);
            return Ok(pagedDoctors);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllDoctorsWithoutPagination()
        {
            var doctors = await _doctorService.GetAllDoctorsAsync();
            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorById(int id)
        {
            var doctor = await _doctorService.GetDoctorByIdAsync(id);
            if (doctor == null)
                return NotFound();

            return Ok(doctor);
        }

        [HttpPost]
        public async Task<IActionResult> AddDoctor([FromBody] CreateDoctorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var newDoctorId = await _doctorService.AddDoctorAsync(dto);

                if (newDoctorId <= 0)
                    return StatusCode(500, "A problem happened while handling your request.");

                return CreatedAtAction(nameof(GetDoctorById), new { id = newDoctorId }, new { id = newDoctorId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add doctor");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] DoctorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _doctorService.UpdateDoctorAsync(id, dto);
            if (!updated)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var deleted = await _doctorService.DeleteDoctorAsync(id);
            if (!deleted)
                return NotFound();

            return Ok(new { message = "Doctor deleted successfully" });
        }
    }
}
