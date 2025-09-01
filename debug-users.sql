-- Debug script to check existing users in the database
SELECT 
    Id,
    FullName,
    Email,
    UserType,
    Role,
    CreatedAt
FROM Users
ORDER BY CreatedAt DESC;

-- Check for any duplicate emails
SELECT 
    Email,
    COUNT(*) as Count
FROM Users
GROUP BY Email
HAVING COUNT(*) > 1;
