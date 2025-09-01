using System.ComponentModel.DataAnnotations;

namespace PAmazeCare.Models
{
    public class RolePermissions
    {
        [Key]
        public int Id { get; set; }
        public UserTypeEnum Role { get; set; }
        public string Permission { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public static class PermissionConstants
    {
        // User Management Permissions
        public const string CREATE_SUPER_ADMIN = "CREATE_SUPER_ADMIN";
        public const string CREATE_ADMIN = "CREATE_ADMIN";
        public const string CREATE_DOCTOR = "CREATE_DOCTOR";
        public const string CREATE_PATIENT = "CREATE_PATIENT";
        
        // Data Management Permissions
        public const string MANAGE_ALL_PATIENTS = "MANAGE_ALL_PATIENTS";
        public const string MANAGE_ASSIGNED_PATIENTS = "MANAGE_ASSIGNED_PATIENTS";
        public const string MANAGE_OWN_DATA = "MANAGE_OWN_DATA";
        
        // System Permissions
        public const string VIEW_SYSTEM_LOGS = "VIEW_SYSTEM_LOGS";
        public const string MANAGE_SYSTEM_SETTINGS = "MANAGE_SYSTEM_SETTINGS";
        public const string DELETE_USERS = "DELETE_USERS";
        
        // Medical Records Permissions
        public const string CREATE_MEDICAL_RECORDS = "CREATE_MEDICAL_RECORDS";
        public const string VIEW_ALL_MEDICAL_RECORDS = "VIEW_ALL_MEDICAL_RECORDS";
        public const string VIEW_ASSIGNED_MEDICAL_RECORDS = "VIEW_ASSIGNED_MEDICAL_RECORDS";
        
        // Appointment Permissions
        public const string MANAGE_ALL_APPOINTMENTS = "MANAGE_ALL_APPOINTMENTS";
        public const string MANAGE_ASSIGNED_APPOINTMENTS = "MANAGE_ASSIGNED_APPOINTMENTS";
        public const string BOOK_APPOINTMENTS = "BOOK_APPOINTMENTS";
    }
    
    public static class RolePermissionMatrix
    {
        public static readonly Dictionary<UserTypeEnum, List<string>> Permissions = new()
        {
            {
                UserTypeEnum.SuperAdmin,
                new List<string>
                {
                    PermissionConstants.CREATE_SUPER_ADMIN,
                    PermissionConstants.CREATE_ADMIN,
                    PermissionConstants.CREATE_DOCTOR,
                    PermissionConstants.CREATE_PATIENT,
                    PermissionConstants.MANAGE_ALL_PATIENTS,
                    PermissionConstants.VIEW_SYSTEM_LOGS,
                    PermissionConstants.MANAGE_SYSTEM_SETTINGS,
                    PermissionConstants.DELETE_USERS,
                    PermissionConstants.CREATE_MEDICAL_RECORDS,
                    PermissionConstants.VIEW_ALL_MEDICAL_RECORDS,
                    PermissionConstants.MANAGE_ALL_APPOINTMENTS
                }
            },
            {
                UserTypeEnum.Admin,
                new List<string>
                {
                    PermissionConstants.CREATE_DOCTOR,
                    PermissionConstants.CREATE_PATIENT,
                    PermissionConstants.MANAGE_ALL_PATIENTS,
                    PermissionConstants.CREATE_MEDICAL_RECORDS,
                    PermissionConstants.VIEW_ALL_MEDICAL_RECORDS,
                    PermissionConstants.MANAGE_ALL_APPOINTMENTS
                }
            },
            {
                UserTypeEnum.Doctor,
                new List<string>
                {
                    PermissionConstants.CREATE_PATIENT,
                    PermissionConstants.MANAGE_ASSIGNED_PATIENTS,
                    PermissionConstants.CREATE_MEDICAL_RECORDS,
                    PermissionConstants.VIEW_ASSIGNED_MEDICAL_RECORDS,
                    PermissionConstants.MANAGE_ASSIGNED_APPOINTMENTS
                }
            },
            {
                UserTypeEnum.Patient,
                new List<string>
                {
                    PermissionConstants.MANAGE_OWN_DATA,
                    PermissionConstants.BOOK_APPOINTMENTS
                }
            }
        };
        
        public static bool HasPermission(UserTypeEnum role, string permission)
        {
            return Permissions.ContainsKey(role) && Permissions[role].Contains(permission);
        }
    }
}
