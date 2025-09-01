namespace PAmazeCare.Models
{
    public enum UserTypeEnum
    {
        Patient = 1,
        Doctor = 2,
        Admin = 3,
        SuperAdmin = 4
    }
    
    public static class UserRoleHierarchy
    {
        public static readonly Dictionary<UserTypeEnum, int> RoleLevel = new()
        {
            { UserTypeEnum.Patient, 1 },
            { UserTypeEnum.Doctor, 2 },
            { UserTypeEnum.Admin, 3 },
            { UserTypeEnum.SuperAdmin, 4 }
        };
        
        public static bool CanManageRole(UserTypeEnum managerRole, UserTypeEnum targetRole)
        {
            return RoleLevel[managerRole] > RoleLevel[targetRole];
        }
        
        public static bool CanCreateRole(UserTypeEnum creatorRole, UserTypeEnum targetRole)
        {
            // SuperAdmin can create Admin, Doctor, Patient
            // Admin can create Doctor, Patient
            // Doctor can create Patient
            // Patient cannot create anyone
            return RoleLevel[creatorRole] > RoleLevel[targetRole];
        }
    }
}
