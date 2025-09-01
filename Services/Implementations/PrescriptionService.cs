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
    public class PrescriptionService : IPrescriptionService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<PrescriptionService> _logger;

        public PrescriptionService(PAmazeCareContext context, ILogger<PrescriptionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<PrescriptionDto>> GetAllPrescriptionsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.Prescriptions
                                    .Where(p => !p.IsDeleted)
                                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(p => p.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(p => new PrescriptionDto
                    {
                        Id = p.Id,
                        PatientId = p.PatientId,
                        DoctorId = p.DoctorId,
                        Medication = p.Medication,
                        Dosage = p.Dosage,
                        Timing = p.Timing,
                        PrescribedDate = p.PrescribedDate
                    })
                    .ToListAsync();

                return new PagedResult<PrescriptionDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged prescriptions");
                return new PagedResult<PrescriptionDto>();
            }
        }

        public async Task<List<PrescriptionDto>> GetAllPrescriptionsAsync()
        {
            try
            {
                return await _context.Prescriptions
                    .Where(p => !p.IsDeleted)
                    .Select(p => new PrescriptionDto
                    {
                        Id = p.Id,
                        PatientId = p.PatientId,
                        DoctorId = p.DoctorId,
                        Medication = p.Medication,
                        Dosage = p.Dosage,
                        Timing = p.Timing,
                        PrescribedDate = p.PrescribedDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prescriptions");
                return new List<PrescriptionDto>();
            }
        }

        public async Task<PrescriptionDto> GetPrescriptionByIdAsync(int id)
        {
            try
            {
                var prescription = await _context.Prescriptions
                    .Where(p => p.Id == id && !p.IsDeleted)
                    .FirstOrDefaultAsync();

                if (prescription == null) return null;

                return new PrescriptionDto
                {
                    Id = prescription.Id,
                    PatientId = prescription.PatientId,
                    DoctorId = prescription.DoctorId,
                    Medication = prescription.Medication,
                    Dosage = prescription.Dosage,
                    Timing = prescription.Timing,
                    PrescribedDate = prescription.PrescribedDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving prescription {id}");
                return null;
            }
        }
        public async Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionDto dto)
        {
            try
            {
                // Validate patient exists
                var patientExists = await _context.Patients.AnyAsync(p => p.Id == dto.PatientId);
                if (!patientExists)
                    throw new ArgumentException($"Patient with ID {dto.PatientId} does not exist");

                // Validate doctor exists
                var doctorExists = await _context.Doctors.AnyAsync(d => d.Id == dto.DoctorId);
                if (!doctorExists)
                    throw new ArgumentException($"Doctor with ID {dto.DoctorId} does not exist");

                var prescription = new Prescription
                {
                    PatientId = dto.PatientId,
                    DoctorId = dto.DoctorId,
                    Medication = dto.Medication,
                    MedicalRecordId = dto.MedicalRecordId,
                    


                    Dosage = dto.Dosage,
                    Timing = dto.Timing ?? "", 
                    PrescribedDate = DateTime.UtcNow
                };

                _context.Prescriptions.Add(prescription);
                await _context.SaveChangesAsync();

                return new PrescriptionDto
                {
                    Id = prescription.Id,
                    PatientId = prescription.PatientId,
                    DoctorId = prescription.DoctorId,
                    Medication = prescription.Medication,
                    Dosage = prescription.Dosage,
                    Timing = prescription.Timing,
                    PrescribedDate = prescription.PrescribedDate
                };
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Error creating prescription: {Message}", errorMessage);
                throw new Exception(errorMessage, ex);
            }
        }



        public async Task<bool> UpdatePrescriptionAsync(int id, UpdatePrescriptionDto dto)
        {
            try
            {
                var prescription = await _context.Prescriptions
                    .Where(p => p.Id == id && !p.IsDeleted)
                    .FirstOrDefaultAsync();

                if (prescription == null) return false;

                prescription.Medication = dto.Medication;
                prescription.Dosage = dto.Dosage;
                prescription.Timing = dto.Timing;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating prescription {id}");
                return false;
            }
        }

        public async Task<bool> DeletePrescriptionAsync(int id)
        {
            try
            {
                var prescription = await _context.Prescriptions
                    .Where(p => p.Id == id && !p.IsDeleted)
                    .FirstOrDefaultAsync();

                if (prescription == null)
                    return false;

                prescription.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting prescription with ID {id}");
                return false;
            }
        }
    }
}
