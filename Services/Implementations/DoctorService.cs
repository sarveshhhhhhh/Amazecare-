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
    public class DoctorService : IDoctorService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<DoctorService> _logger;

        public DoctorService(PAmazeCareContext context, ILogger<DoctorService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<DoctorDto>> GetAllDoctorsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.Doctors.AsNoTracking().Where(d => !d.IsDeleted);

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(d => d.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(d => new DoctorDto
                    {
                        Id = d.Id,
                        FullName = d.FullName ?? string.Empty,
                        Email = d.Email ?? string.Empty,
                        ContactNumber = d.ContactNumber ?? string.Empty,
                        Specialty = d.Specialty ?? string.Empty,
                        UserId = d.UserId
                    })
                    .ToListAsync();

                return new PagedResult<DoctorDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged doctors");
                return new PagedResult<DoctorDto>();
            }
        }

        public async Task<List<DoctorDto>> GetAllDoctorsAsync()
        {
            try
            {
                return await _context.Doctors
                    .AsNoTracking()
                    .Where(d => !d.IsDeleted)
                    .Select(d => new DoctorDto
                    {
                        Id = d.Id,
                        FullName = d.FullName ?? string.Empty,
                        Email = d.Email ?? string.Empty,
                        ContactNumber = d.ContactNumber ?? string.Empty,
                        Specialty = d.Specialty ?? string.Empty,
                        UserId = d.UserId
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctors");
                return new List<DoctorDto>();
            }
        }

        public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);

                if (doctor == null) return null;

                return new DoctorDto
                {
                    Id = doctor.Id,
                    FullName = doctor.FullName ?? string.Empty,
                    Email = doctor.Email ?? string.Empty,
                    ContactNumber = doctor.ContactNumber ?? string.Empty,
                    Specialty = doctor.Specialty ?? string.Empty,
                    UserId = doctor.UserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving doctor with ID {id}");
                return null;
            }
        }

        public async Task<int> AddDoctorAsync(DoctorDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email is required.");

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (existingUser != null)
                throw new InvalidOperationException("User with this email already exists.");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            var user = new User
            {
                FullName = dto.FullName ?? "Unknown",
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = 2
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var doctor = new Doctor
            {
                FullName = dto.FullName,
                Email = dto.Email,
                ContactNumber = dto.ContactNumber,
                Specialty = dto.Specialty,
                UserId = user.Id
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            return doctor.Id;
        }

        public async Task<bool> UpdateDoctorAsync(int id, DoctorDto dto)
        {
            try
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
                if (doctor == null) return false;

                doctor.FullName = dto.FullName;
                doctor.Email = dto.Email;
                doctor.ContactNumber = dto.ContactNumber;
                doctor.Specialty = dto.Specialty;

                // Also update User table for consistency
                var user = await _context.Users.FindAsync(doctor.UserId);
                if (user != null)
                {
                    user.FullName = dto.FullName;
                    user.Email = dto.Email;
                }

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating doctor with ID {id}");
                return false;
            }
        }

        public async Task<bool> DeleteDoctorAsync(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (doctor == null || doctor.IsDeleted)
                    return false;

                doctor.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting doctor with ID {id}");
                return false;
            }
        }
    }
}
