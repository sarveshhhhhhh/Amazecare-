using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IPatientService
    {
        Task<PagedResult<PatientDto>> GetAllPatientsAsync(PaginationParams paginationParams);

        Task<List<PatientDto>> GetAllPatientsAsync();
        Task<PatientDto?> GetPatientByIdAsync(int id);
        Task<int> AddPatientAsync(CreatePatientDto dto);
        Task<bool> UpdatePatientAsync(int id, PatientDto dto);
        Task<bool> DeletePatientAsync(int id);
    }
}
