using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IPrescriptionService
    {
        Task<PagedResult<PrescriptionDto>> GetAllPrescriptionsAsync(PaginationParams paginationParams);
        Task<List<PrescriptionDto>> GetAllPrescriptionsAsync();
        Task<PrescriptionDto> GetPrescriptionByIdAsync(int id);
        Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionDto dto);
        Task<bool> UpdatePrescriptionAsync(int id, UpdatePrescriptionDto dto);
        Task<bool> DeletePrescriptionAsync(int id);
    }
}
