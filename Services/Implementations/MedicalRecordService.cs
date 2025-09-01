using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PAmazeCare.Data;
using PAmazeCare.DTOs;
using PAmazeCare.Models;
using PAmazeCare.Services.Interfaces;

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
                    .AsNoTracking()
                    .Where(mr => !mr.IsDeleted)
                    .Include(mr => mr.Patient)
                    .Include(mr => mr.Doctor)
                    .OrderBy(mr => mr.Id);

                var totalCount = await query.CountAsync();

                var items = await query
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(mr => new MedicalRecordDto
                    {
                        Id = mr.Id,
                        PatientId = mr.PatientId,
                        DoctorId = mr.DoctorId,
                        PatientName = mr.Patient != null ? mr.Patient.FullName : string.Empty,
                        DoctorName = mr.Doctor != null ? mr.Doctor.FullName : string.Empty,
                        Diagnosis = mr.Diagnosis,
                        Description = mr.Description,
                        Treatment = mr.Treatment,
                        RecordDate = mr.RecordDate
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
                // Return empty page rather than throwing to keep controller simple
                return new PagedResult<MedicalRecordDto>
                {
                    Items = new List<MedicalRecordDto>(),
                    TotalCount = 0,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
        }

        public async Task<List<MedicalRecordDto>> GetAllMedicalRecordsAsync()
        {
            try
            {
                return await _context.MedicalRecords
                    .AsNoTracking()
                    .Where(m => !m.IsDeleted)
                    .Include(m => m.Patient)
                    .Include(m => m.Doctor)
                    .OrderBy(m => m.Id)
                    .Select(m => new MedicalRecordDto
                    {
                        Id = m.Id,
                        PatientId = m.PatientId,
                        DoctorId = m.DoctorId,
                        PatientName = m.Patient != null ? m.Patient.FullName : string.Empty,
                        DoctorName = m.Doctor != null ? m.Doctor.FullName : string.Empty,
                        Diagnosis = m.Diagnosis,
                        Description = m.Description,
                        Treatment = m.Treatment,
                        RecordDate = m.RecordDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all medical records");
                return new List<MedicalRecordDto>();
            }
        }

        public async Task<MedicalRecordDto?> GetMedicalRecordByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation($"Searching for medical record with ID: {id}");

                // Step 1: Find the medical record without navigation properties
                var record = await _context.MedicalRecords
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(m => m.Id == id)
                    .Select(m => new
                    {
                        m.Id,
                        m.PatientId,
                        m.DoctorId,
                        m.Diagnosis,
                        m.Description,
                        m.Treatment,
                        m.RecordDate,
                        m.IsDeleted
                    })
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Medical record query result: {record != null}");

                if (record == null)
                {
                    _logger.LogWarning($"Medical record with ID {id} does not exist in database");
                    return null;
                }

                _logger.LogInformation($"Medical record found - IsDeleted: {record.IsDeleted}, PatientId: {record.PatientId}, DoctorId: {record.DoctorId}");

                // Check if medical record is soft deleted
                if (record.IsDeleted)
                {
                    _logger.LogWarning($"Medical record with ID {id} is soft deleted");
                    return null;
                }

                // Step 2: Get patient and doctor names separately with null safety
                var patient = await _context.Patients
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(p => p.Id == record.PatientId)
                    .Select(p => new { p.FullName })
                    .FirstOrDefaultAsync();

                var doctor = await _context.Doctors
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(d => d.Id == record.DoctorId)
                    .Select(d => new { d.FullName })
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Patient found: {patient != null}, Doctor found: {doctor != null}");

                var result = new MedicalRecordDto
                {
                    Id = record.Id,
                    PatientId = record.PatientId,
                    DoctorId = record.DoctorId,
                    PatientName = patient?.FullName ?? "Unknown Patient",
                    DoctorName = doctor?.FullName ?? "Unknown Doctor",
                    Diagnosis = record.Diagnosis ?? string.Empty,
                    Description = record.Description ?? string.Empty,
                    Treatment = record.Treatment ?? string.Empty,
                    RecordDate = record.RecordDate
                };

                _logger.LogInformation($"Returning medical record DTO for ID {id}: {result.PatientName} - {result.DoctorName}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving medical record {id}: {ex.Message}");
                return null;
            }
        }

        public async Task<MedicalRecordDto?> CreateMedicalRecordAsync(CreateMedicalRecordDto dto)
        {
            try
            {
                var record = new MedicalRecord
                {
                    AppointmentId = dto.AppointmentId,
                    PatientId = dto.PatientId,
                    DoctorId = dto.DoctorId,
                    Diagnosis = dto.Diagnosis ?? string.Empty,
                    Description = dto.Description ?? string.Empty,
                    Treatment = dto.Treatment ?? string.Empty,
                    RecordDate = dto.RecordDate ?? DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                // Get patient and doctor names separately to avoid null value exceptions
                var patient = await _context.Patients
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(p => p.Id == record.PatientId)
                    .Select(p => new { p.FullName })
                    .FirstOrDefaultAsync();

                var doctor = await _context.Doctors
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(d => d.Id == record.DoctorId)
                    .Select(d => new { d.FullName })
                    .FirstOrDefaultAsync();

                return new MedicalRecordDto
                {
                    Id = record.Id,
                    PatientId = record.PatientId,
                    DoctorId = record.DoctorId,
                    PatientName = patient?.FullName ?? "Unknown Patient",
                    DoctorName = doctor?.FullName ?? "Unknown Doctor",
                    Diagnosis = record.Diagnosis ?? string.Empty,
                    Description = record.Description ?? string.Empty,
                    Treatment = record.Treatment ?? string.Empty,
                    RecordDate = record.RecordDate
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
                var record = await _context.MedicalRecords
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);

                if (record == null) return false;

                // Only update fields that are provided
                if (dto.Diagnosis != null) record.Diagnosis = dto.Diagnosis;
                if (dto.Description != null) record.Description = dto.Description;
                if (dto.Treatment != null) record.Treatment = dto.Treatment;
                if (dto.RecordDate.HasValue) record.RecordDate = dto.RecordDate;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating medical record {id}");
                return false;
            }
        }

        public async Task<bool> DeleteMedicalRecordAsync(int id)
        {
            try
            {
                var record = await _context.MedicalRecords
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);

                if (record == null) return false;

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