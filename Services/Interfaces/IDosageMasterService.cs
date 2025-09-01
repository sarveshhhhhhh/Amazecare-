using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IDosageMasterService
    {
        Task<PagedResult<DosageMasterDto>> GetAllDosagesPagedAsync(PaginationParams paginationParams);
        Task<List<DosageMasterDto>> GetAllDosagesAsync();
        Task<DosageMasterDto?> GetDosageByIdAsync(int id);
        Task<DosageMasterDto?> CreateDosageAsync(CreateDosageMasterDto dto);
        Task<bool> UpdateDosageAsync(int id, UpdateDosageMasterDto dto);
        Task<bool> DeleteDosageAsync(int id);
    }
}
