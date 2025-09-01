using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllAppointmentsPaged([FromQuery] PaginationParams paginationParams)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pagedResult = await _appointmentService.GetAllAppointmentsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAppointments()
        {
            return Ok(await _appointmentService.GetAllAppointmentsAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointmentById(int id)
        {
            var result = await _appointmentService.GetAppointmentByIdAsync(id);
            if (result == null) return NotFound($"Appointment with ID {id} not found");
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _appointmentService.CreateAppointmentAsync(dto);
            if (created == null) return BadRequest("Could not create appointment");

            return CreatedAtAction(nameof(GetAppointmentById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] UpdateAppointmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _appointmentService.UpdateAppointmentAsync(id, dto);
            if (!updated) return NotFound($"Appointment with ID {id} not found");
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var deleted = await _appointmentService.DeleteAppointmentAsync(id);
            if (!deleted) return NotFound($"Appointment with ID {id} not found");
            return NoContent();
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var canceled = await _appointmentService.CancelAppointmentAsync(id);
            if (!canceled) return NotFound($"Appointment with ID {id} not found");
            return NoContent();
        }
    }
}
