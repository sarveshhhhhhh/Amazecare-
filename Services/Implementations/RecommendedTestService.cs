using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NUnit.Framework;
using PAmazeCare.Data;
using PAmazeCare.DTOs;
using PAmazeCare.Models;
using PAmazeCare.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PAmazeCare.Services.Implementations
{
    public class RecommendedTestService : IRecommendedTestService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<RecommendedTestService> _logger;

        public RecommendedTestService(PAmazeCareContext context, ILogger<RecommendedTestService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<RecommendedTestDto>> GetAllRecommendedTestsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.RecommendedTests
                    .Where(rt => !rt.IsDeleted)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(rt => rt.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(rt => new RecommendedTestDto
                    {
                        Id = rt.Id,
                        TestName = rt.TestName,
                        Description = rt.Description,
                        MedicalRecordId = rt.MedicalRecordId,
                        TestId = rt.TestId
                    })
                    .ToListAsync();

                return new PagedResult<RecommendedTestDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged recommended tests");
                return new PagedResult<RecommendedTestDto>();
            }
        }

        public async Task<List<RecommendedTestDto>> GetAllRecommendedTestsAsync()
        {
            try
            {
                return await _context.RecommendedTests
                    .Where(rt => !rt.IsDeleted)
                    .Select(rt => new RecommendedTestDto
                    {
                        Id = rt.Id,
                        TestName = rt.TestName,
                        Description = rt.Description,
                        MedicalRecordId = rt.MedicalRecordId,
                        TestId = rt.TestId
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all recommended tests");
                return new List<RecommendedTestDto>();
            }
        }

        public async Task<RecommendedTestDto> GetRecommendedTestByIdAsync(int id)
        {
            try
            {
                var test = await _context.RecommendedTests
                    .Where(rt => rt.Id == id && !rt.IsDeleted)
                    .FirstOrDefaultAsync();

                if (test == null) return null;

                return new RecommendedTestDto
                {
                    Id = test.Id,
                    TestName = test.TestName,
                    Description = test.Description,
                    MedicalRecordId = test.MedicalRecordId,
                    TestId = test.TestId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving recommended test with ID {id}");
                return null;
            }
        }

        public async Task<RecommendedTestDto> CreateRecommendedTestAsync(CreateRecommendedTestDto dto)
        {
            try
            {
                var test = new RecommendedTest
                {
                    TestName = dto.TestName,
                    Description = dto.Description,
                    MedicalRecordId = dto.MedicalRecordId,
                    TestId = dto.TestId
                };

                _context.RecommendedTests.Add(test);
                await _context.SaveChangesAsync();

                return new RecommendedTestDto
                {
                    Id = test.Id,
                    TestName = test.TestName,
                    Description = test.Description,
                    MedicalRecordId = test.MedicalRecordId,
                    TestId = test.TestId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating recommended test");
                throw;
            }
        }

        public async Task<bool> UpdateRecommendedTestAsync(int id, UpdateRecommendedTestDto dto)
        {
            try
            {
                var test = await _context.RecommendedTests.FindAsync(id);
                if (test == null || test.IsDeleted) return false;

                test.TestName = dto.TestName ?? test.TestName;
                test.Description = dto.Description ?? test.Description;
                test.MedicalRecordId = dto.MedicalRecordId != 0 ? dto.MedicalRecordId : test.MedicalRecordId;
                test.TestId = dto.TestId != 0 ? dto.TestId : test.TestId;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating recommended test with ID {id}");
                return false;
            }
        }

        public async Task<bool> DeleteRecommendedTestAsync(int id)
        {
            try
            {
                var test = await _context.RecommendedTests.FindAsync(id);
                if (test == null || test.IsDeleted) return false;

                test.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting recommended test with ID {id}");
                return false;
            }
        }
    }
}
