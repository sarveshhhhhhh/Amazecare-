using Microsoft.EntityFrameworkCore;
using PAmazeCare.Models;

namespace PAmazeCare.Data
{
    public class PAmazeCareContext : DbContext
    {
        public PAmazeCareContext(DbContextOptions<PAmazeCareContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public virtual DbSet<Doctor> Doctors { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public virtual DbSet<DosageMaster> DosageMasters { get; set; }
        public DbSet<TestMaster> TestMasters { get; set; }
        public virtual DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<RecommendedTest> RecommendedTests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
            modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.Property(p => p.PatientId);
                entity.Property(p => p.DoctorId);
                
                entity.Property(p => p.DosageMasterId);
            });

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<DosageMaster>().HasIndex(d => d.DosageName).IsUnique();
            modelBuilder.Entity<TestMaster>().HasIndex(t => t.TestName).IsUnique();

            modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasDefaultValueSql("GETDATE()");
            modelBuilder.Entity<MedicalRecord>().Property(m => m.CreatedAt).HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<TestMaster>().HasQueryFilter(t => !t.IsDeleted);
            modelBuilder.Entity<DosageMaster>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<RecommendedTest>().HasQueryFilter(r => !r.IsDeleted);
            modelBuilder.Entity<Admin>().HasQueryFilter(a => !a.IsDeleted);
            modelBuilder.Entity<Appointment>().HasQueryFilter(a => !a.IsDeleted);
            modelBuilder.Entity<Doctor>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<MedicalRecord>().HasQueryFilter(m => !m.IsDeleted);
            modelBuilder.Entity<Patient>().HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<Prescription>().HasQueryFilter(p => !p.IsDeleted);




        }
    }
}
