using Microsoft.AspNetCore.Mvc;
using PAmazeCare.DTOs;
using PAmazeCare.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllAdminsPaged([FromQuery] PaginationParams paginationParams)
        {
            var pagedResult = await _adminService.GetAllAdminsAsync(paginationParams);
            return Ok(pagedResult);
        }

        [HttpGet]
        public async Task<ActionResult<List<AdminDto>>> GetAllAdmins()
        {
            var admins = await _adminService.GetAllAdminsAsync();
            return Ok(admins);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminDto>> GetAdminById(int id)
        {
            var admin = await _adminService.GetAdminByIdAsync(id);
            if (admin == null) return NotFound();
            return Ok(admin);
        }

        [HttpPost]
        public async Task<ActionResult<AdminDto>> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdAdmin = await _adminService.CreateAdminAsync(dto);
            if (createdAdmin == null) return BadRequest("Failed to create admin.");

            return CreatedAtAction(nameof(GetAdminById), new { id = createdAdmin.Id }, createdAdmin);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] UpdateAdminDto dto)
        {
            var updated = await _adminService.UpdateAdminAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var deleted = await _adminService.DeleteAdminAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
