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
    public class DosageMasterService : IDosageMasterService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<DosageMasterService> _logger;

        public DosageMasterService(PAmazeCareContext context, ILogger<DosageMasterService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<DosageMasterDto>> GetAllDosagesPagedAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.DosageMasters
                    .Where(d => !d.IsDeleted)
                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(d => d.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(d => new DosageMasterDto
                    {
                        Id = d.Id,
                        DosageName = d.DosageName,
                        Description = d.Description
                    })
                    .ToListAsync();

                return new PagedResult<DosageMasterDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged dosage masters");
                return new PagedResult<DosageMasterDto>();
            }
        }

        public async Task<List<DosageMasterDto>> GetAllDosagesAsync()
        {
            try
            {
                return await _context.DosageMasters
                    .Where(d => !d.IsDeleted)
                    .Select(d => new DosageMasterDto
                    {
                        Id = d.Id,
                        DosageName = d.DosageName,
                        Description = d.Description
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all dosage masters");
                return new List<DosageMasterDto>();
            }
        }

        public async Task<DosageMasterDto?> GetDosageByIdAsync(int id)
        {
            try
            {
                var dosage = await _context.DosageMasters
                    .Where(d => !d.IsDeleted && d.Id == id)
                    .FirstOrDefaultAsync();

                if (dosage == null) return null;

                return new DosageMasterDto
                {
                    Id = dosage.Id,
                    DosageName = dosage.DosageName,
                    Description = dosage.Description
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving dosage master with ID {id}");
                return null;
            }
        }

        public async Task<DosageMasterDto?> CreateDosageAsync(CreateDosageMasterDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.DosageName))
                    throw new ArgumentException("Dosage name cannot be empty");

                var dosage = new DosageMaster
                {
                    DosageName = dto.DosageName,
                    Description = dto.Description
                };

                _context.DosageMasters.Add(dosage);
                await _context.SaveChangesAsync();

                return new DosageMasterDto
                {
                    Id = dosage.Id,
                    DosageName = dosage.DosageName,
                    Description = dosage.Description
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dosage master");
                throw; // Let the controller return the actual error to Swagger/Postman
            }
        }

        public async Task<bool> UpdateDosageAsync(int id, UpdateDosageMasterDto dto)
        {
            try
            {
                var dosage = await _context.DosageMasters.FindAsync(id);
                if (dosage == null || dosage.IsDeleted) return false;

                dosage.DosageName = dto.DosageName;
                dosage.Description = dto.Description;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating dosage master with ID {id}");
                return false;
            }
        }

        public async Task<bool> DeleteDosageAsync(int id)
        {
            try
            {
                var dosage = await _context.DosageMasters.FindAsync(id);
                if (dosage == null || dosage.IsDeleted) return false;

                dosage.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting dosage master with ID {id}");
                return false;
            }
        }
    }
}
