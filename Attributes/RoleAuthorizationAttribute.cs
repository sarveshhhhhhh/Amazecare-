using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PAmazeCare.Models;
using System.Security.Claims;

namespace PAmazeCare.Attributes
{
    public class RoleAuthorizationAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _requiredPermissions;
        private readonly UserTypeEnum[] _allowedRoles;

        public RoleAuthorizationAttribute(params string[] requiredPermissions)
        {
            _requiredPermissions = requiredPermissions;
        }

        public RoleAuthorizationAttribute(params UserTypeEnum[] allowedRoles)
        {
            _allowedRoles = allowedRoles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            
            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userTypeString = user.FindFirst("UserType")?.Value;
            if (string.IsNullOrEmpty(userTypeString) || !Enum.TryParse<UserTypeEnum>(userTypeString, out var userType))
            {
                context.Result = new ForbidResult();
                return;
            }

            // Check role-based authorization
            if (_allowedRoles != null && _allowedRoles.Length > 0)
            {
                if (!_allowedRoles.Contains(userType))
                {
                    context.Result = new ForbidResult();
                    return;
                }
            }

            // Check permission-based authorization
            if (_requiredPermissions != null && _requiredPermissions.Length > 0)
            {
                bool hasPermission = _requiredPermissions.Any(permission => 
                    RolePermissionMatrix.HasPermission(userType, permission));

                if (!hasPermission)
                {
                    context.Result = new ForbidResult();
                    return;
                }
            }
        }
    }

    // Specific role attributes for convenience
    public class SuperAdminOnlyAttribute : RoleAuthorizationAttribute
    {
        public SuperAdminOnlyAttribute() : base(UserTypeEnum.SuperAdmin) { }
    }

    public class AdminOrAboveAttribute : RoleAuthorizationAttribute
    {
        public AdminOrAboveAttribute() : base(UserTypeEnum.SuperAdmin, UserTypeEnum.Admin) { }
    }

    public class DoctorOrAboveAttribute : RoleAuthorizationAttribute
    {
        public DoctorOrAboveAttribute() : base(UserTypeEnum.SuperAdmin, UserTypeEnum.Admin, UserTypeEnum.Doctor) { }
    }

    public class RequirePermissionAttribute : RoleAuthorizationAttribute
    {
        public RequirePermissionAttribute(params string[] permissions) : base(permissions) { }
    }
}
