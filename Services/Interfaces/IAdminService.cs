using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IAdminService
    {
        Task<PagedResult<AdminDto>> GetAllAdminsAsync(PaginationParams paginationParams);
        Task<List<AdminDto>> GetAllAdminsAsync();
        Task<AdminDto?> GetAdminByIdAsync(int id);
        Task<AdminDto?> CreateAdminAsync(CreateAdminDto dto);
        Task<bool> UpdateAdminAsync(int id, UpdateAdminDto dto);
        Task<bool> DeleteAdminAsync(int id);
    }
}
