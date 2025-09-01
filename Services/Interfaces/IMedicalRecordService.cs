using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IMedicalRecordService
    {
        Task<PagedResult<MedicalRecordDto>> GetAllMedicalRecordsAsync(PaginationParams paginationParams);
        Task<List<MedicalRecordDto>> GetAllMedicalRecordsAsync();
        Task<MedicalRecordDto?> GetMedicalRecordByIdAsync(int id);
        Task<MedicalRecordDto?> CreateMedicalRecordAsync(CreateMedicalRecordDto dto);
        Task<bool> UpdateMedicalRecordAsync(int id, UpdateMedicalRecordDto dto);
        Task<bool> DeleteMedicalRecordAsync(int id);
    }
}
