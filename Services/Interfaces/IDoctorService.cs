using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IDoctorService
    {
        Task<PagedResult<DoctorDto>> GetAllDoctorsAsync(PaginationParams paginationParams);

        Task<List<DoctorDto>> GetAllDoctorsAsync();
        Task<DoctorDto?> GetDoctorByIdAsync(int id);
        Task<int> AddDoctorAsync(CreateDoctorDto dto);
        Task<bool> UpdateDoctorAsync(int id, DoctorDto dto);
        Task<bool> DeleteDoctorAsync(int id);
    }
}
