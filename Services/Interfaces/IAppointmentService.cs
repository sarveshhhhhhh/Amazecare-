using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task<PagedResult<AppointmentDto>> GetAllAppointmentsAsync(PaginationParams paginationParams);
        Task<List<AppointmentDto>> GetAllAppointmentsAsync();
        Task<AppointmentDto?> GetAppointmentByIdAsync(int id);
        Task<AppointmentDto?> CreateAppointmentAsync(CreateAppointmentDto dto);
        Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentDto dto);
        Task<bool> CancelAppointmentAsync(int id);
        Task<bool> DeleteAppointmentAsync(int id);
        Task<PagedResult<AppointmentDto>> GetAppointmentsByPatientIdAsync(int patientId, PaginationParams paginationParams);
    }
}
