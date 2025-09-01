using PAmazeCare.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Interfaces
{
    public interface IRecommendedTestService
    {
        Task<PagedResult<RecommendedTestDto>> GetAllRecommendedTestsAsync(PaginationParams paginationParams);
        Task<List<RecommendedTestDto>> GetAllRecommendedTestsAsync();
        Task<RecommendedTestDto> GetRecommendedTestByIdAsync(int id);
        Task<RecommendedTestDto> CreateRecommendedTestAsync(CreateRecommendedTestDto dto);
        Task<bool> UpdateRecommendedTestAsync(int id, UpdateRecommendedTestDto dto);
        Task<bool> DeleteRecommendedTestAsync(int id);
    }
}
