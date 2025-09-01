using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    public class TestMasterService : ITestMasterService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<TestMasterService> _logger;

        public TestMasterService(PAmazeCareContext context, ILogger<TestMasterService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<TestMasterDto>> GetAllTestsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.TestMasters
                                    .Where(t => !t.IsDeleted)
                                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(t => t.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(t => new TestMasterDto
                    {
                        Id = t.Id,
                        TestName = t.TestName,
                        Description = t.Description,
                        Price = t.Price,
                        Timing = t.Timing
                    })
                    .ToListAsync();

                return new PagedResult<TestMasterDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged test masters");
                return new PagedResult<TestMasterDto>();
            }
        }

        public async Task<List<TestMasterDto>> GetAllTestsAsync()
        {
            try
            {
                return await _context.TestMasters
                    .Where(t => !t.IsDeleted)
                    .Select(t => new TestMasterDto
                    {
                        Id = t.Id,
                        TestName = t.TestName,
                        Description = t.Description,
                        Price = t.Price,
                        Timing = t.Timing
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all test masters");
                return new List<TestMasterDto>();
            }
        }

        public async Task<TestMasterDto?> GetTestByIdAsync(int id)
        {
            try
            {
                var test = await _context.TestMasters
                    .Where(t => t.Id == id && !t.IsDeleted)
                    .FirstOrDefaultAsync();

                if (test == null) return null;

                return new TestMasterDto
                {
                    Id = test.Id,
                    TestName = test.TestName,
                    Description = test.Description,
                    Price = test.Price,
                    Timing = test.Timing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving test master with ID {id}");
                return null;
            }
        }

        public async Task<TestMasterDto> CreateTestAsync(CreateTestMasterDto dto)
        {
            try
            {
                var test = new TestMaster
                {
                    TestName = dto.TestName,
                    Price = dto.Price,
                    Timing = string.IsNullOrWhiteSpace(dto.Timing) ? "Not specified" : dto.Timing,
                    Description = dto.Description
                };

                _context.TestMasters.Add(test);
                await _context.SaveChangesAsync();

                return new TestMasterDto
                {
                    Id = test.Id,
                    TestName = test.TestName,
                    Price = test.Price,
                    Timing = test.Timing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test master");
                throw; // Let the controller return the detailed error
            }
        }


        public async Task<bool> UpdateTestAsync(int id, UpdateTestMasterDto dto)
        {
            try
            {
                var test = await _context.TestMasters.FindAsync(id);
                if (test == null || test.IsDeleted) return false;

                test.TestName = dto.TestName;
                test.Description = dto.Description;
                test.Price = dto.Price;
                test.Timing = dto.Timing;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating test master with ID {id}");
                return false;
            }
        }

        public async Task<bool> DeleteTestAsync(int id)
        {
            try
            {
                var test = await _context.TestMasters.FindAsync(id);
                if (test == null || test.IsDeleted)
                    return false;

                test.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting test master with ID {id}");
                return false;
            }
        }
    }
}
