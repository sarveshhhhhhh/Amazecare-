using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface ITestMasterService
    {
        Task<PagedResult<TestMasterDto>> GetAllTestsAsync(PaginationParams paginationParams);
        Task<List<TestMasterDto>> GetAllTestsAsync();
        Task<TestMasterDto?> GetTestByIdAsync(int id);
        Task<TestMasterDto?> CreateTestAsync(CreateTestMasterDto dto);
        Task<bool> UpdateTestAsync(int id, UpdateTestMasterDto dto);
        Task<bool> DeleteTestAsync(int id);
    }
}
