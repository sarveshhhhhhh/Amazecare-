using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllPatients([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _patientService.GetAllPatientsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPatientsWithoutPagination()
        {
            var patients = await _patientService.GetAllPatientsAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var patient = await _patientService.GetPatientByIdAsync(id);
            if (patient == null)
                return Ok(new PatientDto());

            return Ok(patient);
        }

        [HttpPost]
        [ProducesResponseType(typeof(PatientDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost]
        public async Task<IActionResult> AddPatient([FromBody] PatientDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var patientId = await _patientService.AddPatientAsync(dto);
                dto.Id = patientId;
                return CreatedAtAction(nameof(GetPatientById), new { id = patientId }, dto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] PatientDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _patientService.UpdatePatientAsync(id, dto);
            if (!updated)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var success = await _patientService.DeletePatientAsync(id);
            if (!success)
                return NotFound();

            return Ok(new { message = "Patient deleted successfully" });
        }

    }
}
