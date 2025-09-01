using Microsoft.EntityFrameworkCore;
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
    public class PatientService : IPatientService
    {
        private readonly PAmazeCareContext _context;

        private readonly ILogger<PatientService> _logger;

        public PatientService(PAmazeCareContext context, ILogger<PatientService> logger)
        {
            _context = context;
            _logger = logger;
        }
        private string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public async Task<PagedResult<PatientDto>> GetAllPatientsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.Patients.AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(p => p.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(p => new PatientDto
                    {
                        Id = p.Id,
                        FullName = p.FullName,
                        Email = p.Email,
                        ContactNumber = p.ContactNumber,
                        DateOfBirth = p.DateOfBirth
                        // map other properties as needed
                    })
                    .ToListAsync();

                return new PagedResult<PatientDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged patients");
                return new PagedResult<PatientDto>();
            }
        }

        public async Task<List<PatientDto>> GetAllPatientsAsync()
        {
            try
            {
                return await _context.Patients
                    .Select(p => new PatientDto
                    {
                        Id = p.Id,
                        FullName = p.FullName,
                        Email = p.Email,
                        ContactNumber = p.ContactNumber
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving patient list", ex);
            }
        }
        public async Task<PatientDto?> GetPatientByIdAsync(int id)
        {
            try
            {
                var patient = await _context.Patients
                    .Where(p => p.Id == id)
                    .Select(p => new PatientDto
                    {
                        Id = p.Id,
                        FullName = p.FullName ?? string.Empty,
                        Email = p.Email ?? string.Empty,
                        ContactNumber = p.ContactNumber ?? string.Empty,
                        DateOfBirth = p.DateOfBirth ?? DateTime.MinValue
                    })
                    .SingleOrDefaultAsync();

                return patient;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving patient with ID {id}", ex);
            }
        }




        public async Task<int> AddPatientAsync(CreatePatientDto dto)
        {
            try
            {
                // ✅ Check if a user already exists with this email
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email);

                if (existingUser != null)
                {
                    // Stop here instead of letting SQL throw an exception
                    throw new InvalidOperationException($"A user with email '{dto.Email}' already exists.");
                }

                var user = new User
                {
                    Email = dto.Email,
                    FullName = dto.FullName,
                    PasswordHash = HashPassword(dto.Password),
                    Role = 2,
                    UserType = UserTypeEnum.Patient.ToString()
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var patient = new Patient
                {
                    UserId = user.Id,
                    FullName = dto.FullName,
                    Email = dto.Email,
                    ContactNumber = dto.ContactNumber,
                    DateOfBirth = dto.DateOfBirth
                };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();

                return patient.Id;
            }
            catch (InvalidOperationException)
            {
                // Re-throw so the controller can return 400 Bad Request
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error adding new patient", ex);
            }
        }



        public async Task<bool> UpdatePatientAsync(int id, PatientDto dto)
        {
            try
            {
                var patient = await _context.Patients.FindAsync(id);

                if (patient == null)
                    return false;

                // Update only allowed fields
                patient.FullName = dto.FullName ?? string.Empty;
                patient.Email = dto.Email ?? string.Empty;
                patient.ContactNumber = dto.ContactNumber ?? string.Empty;

                if (dto.DateOfBirth.HasValue)
                    patient.DateOfBirth = dto.DateOfBirth;

                // Only update UserId if it's provided and valid
                if (dto.UserId.HasValue && dto.UserId.Value != patient.UserId)
                {
                    bool userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId.Value);
                    if (!userExists)
                        throw new Exception($"User with ID {dto.UserId.Value} does not exist.");

                    patient.UserId = dto.UserId.Value;
                }

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating patient with ID {id}", ex);
            }
        }




        public async Task<bool> DeletePatientAsync(int id)
        {
            try
            {
                var patient = await _context.Patients
                    .IgnoreQueryFilters()
                    .Select(p => new { p.Id, p.IsDeleted })
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (patient == null) return false;
                if (patient.IsDeleted) return false;

                // Attach a stub entity and mark it modified
                var entity = new Patient { Id = patient.Id, IsDeleted = true };
                _context.Patients.Attach(entity);
                _context.Entry(entity).Property(p => p.IsDeleted).IsModified = true;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting patient with ID {id}");
                return false;
            }
        }




    }
}
