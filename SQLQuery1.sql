use PAmazeCare;

ALTER TABLE Patients ADD FullName NVARCHAR(255);
ALTER TABLE Patients ADD IsDeleted BIT DEFAULT 0;
ALTER TABLE Patients ADD PasswordHash NVARCHAR(500);
ALTER TABLE Patients ALTER COLUMN DOB DATE NULL;
select * from Users;

ALTER TABLE Users
ALTER COLUMN Role INT NOT NULL;

-- 1. Drop the default constraint on Role
ALTER TABLE Users DROP CONSTRAINT DF__Users__Role__314D4EA8;

-- 2. Now alter the column to INT
ALTER TABLE Users
ALTER COLUMN Role INT NOT NULL;

DELETE FROM Users;


ALTER TABLE Users ALTER COLUMN UserType INT NOT NULL;

-- Replace NULL with empty string
UPDATE Users
SET Email = ''
WHERE Email IS NULL;

DROP INDEX IX_Users_Email ON Users;

-- Make column NOT NULL
ALTER TABLE Users
ALTER COLUMN Email NVARCHAR(255)  NULL;

CREATE UNIQUE INDEX IX_Users_Email ON Users (Email);


SELECT Id, FullName, IsDeleted
FROM Patients
WHERE IsDeleted = 0;
SELECT *
FROM Patients
WHERE Id = 12;

UPDATE Patients SET FullName = '' WHERE FullName IS NULL;
UPDATE Patients SET Email = '' WHERE Email IS NULL;
UPDATE Patients SET ContactNumber = '' WHERE ContactNumber IS NULL;

select * from Doctors;
select * from Patients;
select * from Appointments;
select * from Prescriptions;
select * from DosageMasters;
select * from TestMasters;
select * from RecommendedTests;


ALTER TABLE RecommendedTests
DROP CONSTRAINT FK_RecommendedTests_MedicalRecords_MedicalRecordId;

ALTER TABLE RecommendedTests
ADD CONSTRAINT FK_RecommendedTests_MedicalRecords_MedicalRecordId
FOREIGN KEY (MedicalRecordId)
REFERENCES MedicalRecords(Id);

ALTER TABLE RecommendedTests
ADD TestName NVARCHAR(255) NOT NULL DEFAULT(''),
    Description NVARCHAR(MAX) NULL,
    IsDeleted BIT NOT NULL DEFAULT(0);


ALTER TABLE TestMasters ADD Price decimal(18,2) NOT NULL DEFAULT 0;
ALTER TABLE TestMasters ADD IsDeleted bit NOT NULL DEFAULT 0;


EXEC sp_rename 'DosageMasters.Dosage', 'DosageName', 'COLUMN';


ALTER TABLE DosageMasters
ADD Description NVARCHAR(255) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0;




ALTER TABLE Prescriptions ADD DoctorId INT NULL;
ALTER TABLE Prescriptions ADD Dosage NVARCHAR(MAX) NULL;
ALTER TABLE Prescriptions ADD DosageMasterId INT NULL; -- only if you actually need it
ALTER TABLE Prescriptions ADD IsDeleted BIT NOT NULL DEFAULT(0);
ALTER TABLE Prescriptions ADD Medication NVARCHAR(MAX) NULL;
ALTER TABLE Prescriptions ADD PatientId INT NULL;
ALTER TABLE Prescriptions ADD PrescribedDate DATETIME2 NULL;
ALTER TABLE Prescriptions ADD Timing NVARCHAR(MAX) NULL;


UPDATE Patients SET FullName = 'Unknown' WHERE FullName IS NULL;
UPDATE Doctors SET FullName = 'Unknown' WHERE FullName IS NULL;
ALTER TABLE Patients ALTER COLUMN FullName NVARCHAR(255) NOT NULL;
ALTER TABLE Doctors ALTER COLUMN FullName NVARCHAR(255) NOT NULL;

