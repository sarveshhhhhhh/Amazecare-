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
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<MedicalRecordService> _logger;

        public MedicalRecordService(PAmazeCareContext context, ILogger<MedicalRecordService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<MedicalRecordDto>> GetAllMedicalRecordsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.MedicalRecords
                    .Where(mr => !mr.IsDeleted)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(mr => mr.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(mr => new MedicalRecordDto
                    {
                        Id = mr.Id,
                        Diagnosis = mr.Diagnosis,
                        Treatment = mr.Treatment,
                        Date = mr.Date,
                        CreatedAt = mr.CreatedAt
                    })
                    .ToListAsync();

                return new PagedResult<MedicalRecordDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged medical records");
                return new PagedResult<MedicalRecordDto>();
            }
        }

        public async Task<List<MedicalRecordDto>> GetAllMedicalRecordsAsync()
        {
            try
            {
                return await _context.MedicalRecords
                    .Where(mr => !mr.IsDeleted)
                    .Select(mr => new MedicalRecordDto
                    {
                        Id = mr.Id,
                        Diagnosis = mr.Diagnosis,
                        Treatment = mr.Treatment,
                        Date = mr.Date,
                        CreatedAt = mr.CreatedAt
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all medical records");
                return new List<MedicalRecordDto>();
            }
        }

        public async Task<MedicalRecordDto> GetMedicalRecordByIdAsync(int id)
        {
            try
            {
                var record = await _context.MedicalRecords
                    .FirstOrDefaultAsync(mr => mr.Id == id && !mr.IsDeleted);

                if (record == null) return null;

                return new MedicalRecordDto
                {
                    Id = record.Id,
                    Diagnosis = record.Diagnosis,
                    Treatment = record.Treatment,
                    Date = record.Date,
                    CreatedAt = record.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving medical record with ID {id}");
                return null;
            }
        }

        public async Task<MedicalRecordDto> CreateMedicalRecordAsync(CreateMedicalRecordDto dto)
        {
            try
            {
                var record = new MedicalRecord
                {
                    Diagnosis = dto.Diagnosis,
                    Treatment = dto.Treatment,
                    Date = dto.Date,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                return new MedicalRecordDto
                {
                    Id = record.Id,
                    Diagnosis = record.Diagnosis,
                    Treatment = record.Treatment,
                    Date = record.Date,
                    CreatedAt = record.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                throw;
            }
        }

        public async Task<bool> UpdateMedicalRecordAsync(int id, UpdateMedicalRecordDto dto)
        {
            try
            {
                var record = await _context.MedicalRecords.FindAsync(id);
                if (record == null || record.IsDeleted) return false;

                record.Diagnosis = dto.Diagnosis ?? record.Diagnosis;
                record.Treatment = dto.Treatment ?? record.Treatment;
                record.Date = dto.Date != default ? dto.Date : record.Date;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating medical record with ID {id}");
                return false;
            }
        }

        public async Task<bool> DeleteMedicalRecordAsync(int id)
        {
            try
            {
                var record = await _context.MedicalRecords.FindAsync(id);
                if (record == null || record.IsDeleted) return false;

                record.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting medical record with ID {id}");
                return false;
            }
        }
    }
}
