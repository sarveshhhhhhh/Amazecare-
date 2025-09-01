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
    public class AdminService : IAdminService
    {
        private readonly PAmazeCareContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(PAmazeCareContext context, ILogger<AdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedResult<AdminDto>> GetAllAdminsAsync(PaginationParams paginationParams)
        {
            try
            {
                var query = _context.Admins
                    .Where(a => !a.IsDeleted)
                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(a => a.Id)
                    .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                    .Take(paginationParams.PageSize)
                    .Select(a => new AdminDto
                    {
                        Id = a.Id,
                        AdminName = a.AdminName,
                        Email = a.Email
                    })
                    .ToListAsync();

                return new PagedResult<AdminDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = paginationParams.PageNumber,
                    PageSize = paginationParams.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged admins");
                return new PagedResult<AdminDto>();
            }
        }

        public async Task<List<AdminDto>> GetAllAdminsAsync()
        {
            try
            {
                return await _context.Admins
                    .Where(a => !a.IsDeleted)
                    .Select(a => new AdminDto
                    {
                        Id = a.Id,
                        AdminName = a.AdminName,
                        Email = a.Email
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all admins");
                return new List<AdminDto>();
            }
        }

        public async Task<AdminDto?> GetAdminByIdAsync(int id)
        {
            try
            {
                var admin = await _context.Admins
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

                if (admin == null) return null;

                return new AdminDto
                {
                    Id = admin.Id,
                    AdminName = admin.AdminName,
                    Email = admin.Email
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving admin with ID {id}");
                return null;
            }
        }

        public async Task<AdminDto?> CreateAdminAsync(CreateAdminDto dto)
        {
            try
            {
                var admin = new Admin
                {
                    AdminName = dto.AdminName,
                    Email = dto.Email,
                    UserId = dto.UserId
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                return new AdminDto
                {
                    Id = admin.Id,
                    AdminName = admin.AdminName,
                    Email = admin.Email
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin");
                throw;
            }
        }

        public async Task<bool> UpdateAdminAsync(int id, UpdateAdminDto dto)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(id);
                if (admin == null || admin.IsDeleted) return false;

                if (!string.IsNullOrEmpty(dto.AdminName))
                    admin.AdminName = dto.AdminName;

                if (!string.IsNullOrEmpty(dto.Email))
                    admin.Email = dto.Email;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating admin with ID {id}");
                return false;
            }
        }

        public async Task<bool> DeleteAdminAsync(int id)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(id);
                if (admin == null || admin.IsDeleted) return false;

                admin.IsDeleted = true;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error soft deleting admin with ID {id}");
                return false;
            }
        }
    }
}
