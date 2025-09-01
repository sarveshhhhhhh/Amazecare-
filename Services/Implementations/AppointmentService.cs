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
    public class AppointmentService : IAppointmentService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(PAmazeCareContext context, ILogger<AppointmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<AppointmentDto>> GetAllAppointmentsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .Where(a => !a.IsDeleted)
                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(a => a.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(a => new AppointmentDto
                    {
                        Id = a.Id,
                        PatientId = a.PatientId,
                        PatientName = a.Patient.FullName ?? string.Empty,
                        DoctorId = a.DoctorId,
                        DoctorName = a.Doctor.FullName ?? string.Empty,
                        AppointmentDate = a.AppointmentDate,
                        AppointmentTime = a.AppointmentTime,
                        Symptoms = a.Symptoms ?? string.Empty,
                        Status = a.Status ?? string.Empty
                    })
                    .ToListAsync();

                return new PagedResult<AppointmentDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged appointments");
                return new PagedResult<AppointmentDto>();
            }
        }

        public async Task<List<AppointmentDto>> GetAllAppointmentsAsync()
        {
            try
            {
                return await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .Where(a => !a.IsDeleted)
                    .Select(a => new AppointmentDto
                    {
                        Id = a.Id,
                        PatientName = a.Patient.FullName ?? string.Empty,
                        DoctorName = a.Doctor.FullName ?? string.Empty,
                        PatientId = a.PatientId,
                        DoctorId = a.DoctorId,
                        AppointmentDate = a.AppointmentDate,
                        AppointmentTime = a.AppointmentTime,
                        Symptoms = a.Symptoms ?? string.Empty,
                        Status = a.Status ?? string.Empty
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointments");
                return new List<AppointmentDto>();
            }
        }
        public async Task<AppointmentDto?> GetAppointmentByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation($"Searching for appointment with ID: {id}");

                // Step 1: Find the appointment without navigation properties
                var appointment = await _context.Appointments
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(a => a.Id == id)
                    .Select(a => new 
                    {
                        a.Id,
                        a.PatientId,
                        a.DoctorId,
                        a.AppointmentDate,
                        a.AppointmentTime,
                        a.Symptoms,
                        a.Status,
                        a.IsDeleted
                    })
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Appointment query result: {appointment != null}");

                if (appointment == null)
                {
                    _logger.LogWarning($"Appointment with ID {id} does not exist in database");
                    return null;
                }

                _logger.LogInformation($"Appointment found - IsDeleted: {appointment.IsDeleted}, PatientId: {appointment.PatientId}, DoctorId: {appointment.DoctorId}");

                // Check if appointment is soft deleted
                if (appointment.IsDeleted)
                {
                    _logger.LogWarning($"Appointment with ID {id} is soft deleted");
                    return null;
                }

                // Step 2: Get patient and doctor names separately with null safety
                var patient = await _context.Patients
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(p => p.Id == appointment.PatientId)
                    .Select(p => new { p.FullName })
                    .FirstOrDefaultAsync();

                var doctor = await _context.Doctors
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(d => d.Id == appointment.DoctorId)
                    .Select(d => new { d.FullName })
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Patient found: {patient != null}, Doctor found: {doctor != null}");

                var result = new AppointmentDto
                {
                    Id = appointment.Id,
                    PatientName = patient?.FullName ?? "Unknown Patient",
                    DoctorName = doctor?.FullName ?? "Unknown Doctor",
                    PatientId = appointment.PatientId,
                    DoctorId = appointment.DoctorId,
                    AppointmentDate = appointment.AppointmentDate,
                    AppointmentTime = appointment.AppointmentTime,
                    Symptoms = appointment.Symptoms ?? string.Empty,
                    Status = appointment.Status ?? string.Empty
                };

                _logger.LogInformation($"Returning appointment DTO for ID {id}: {result.PatientName} - {result.DoctorName}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving appointment {id}: {ex.Message}");
                return null;
            }
        }



        public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto)
        {
            try
            {
                var appointment = new Appointment
                {
                    PatientId = dto.PatientId,
                    DoctorId = dto.DoctorId,
                    AppointmentDate = dto.AppointmentDate,
                    AppointmentTime = dto.AppointmentTime,
                    Symptoms = dto.Symptoms,
                    Status = "Scheduled"
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Fetch the appointment with related patient & doctor in one query
                var result = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .Where(a => a.Id == appointment.Id)
                    .Select(a => new AppointmentDto
                    {
                        Id = a.Id,
                        PatientName = a.Patient.FullName ?? string.Empty,
                        DoctorName = a.Doctor.FullName ?? string.Empty,
                        PatientId = a.PatientId,
                        DoctorId = a.DoctorId,
                        AppointmentDate = a.AppointmentDate,
                        AppointmentTime = a.AppointmentTime,
                        Symptoms = a.Symptoms ?? string.Empty,
                        Status = a.Status ?? string.Empty
                    })
                    .FirstOrDefaultAsync();

                return result ?? new AppointmentDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment: {Message}", ex.Message);
                throw;
            }
        }




        public async Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentDto dto)
        {
            try
            {
                var appointment = await _context.Appointments
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
                if (appointment == null) return false;

                appointment.AppointmentDate = dto.AppointmentDate;
                appointment.AppointmentTime = dto.AppointmentTime;
                appointment.Symptoms = dto.Symptoms ?? string.Empty;
                appointment.Status = dto.Status ?? string.Empty;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating appointment {id}");
                return false;
            }
        }

        public async Task<bool> CancelAppointmentAsync(int id)
        {
            try
            {
                var appointment = await _context.Appointments
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
                if (appointment == null) return false;

                appointment.Status = "Canceled";
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error canceling appointment {id}");
                return false;
            }
        }

        public async Task<bool> DeleteAppointmentAsync(int id)
        {
            try
            {
                var appointment = await _context.Appointments
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
                if (appointment == null) return false;

                appointment.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting appointment {id}");
                return false;
            }
        }
    }
}
