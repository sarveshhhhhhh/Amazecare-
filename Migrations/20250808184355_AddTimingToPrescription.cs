using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PAmazeCare.Migrations
{
    /// <inheritdoc />
    public partial class AddTimingToPrescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DOB",
                table: "Patients",
                newName: "DateOfBirth");

            migrationBuilder.AddColumn<string>(
                name: "Timing",
                table: "Prescriptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Timing",
                table: "Prescriptions");

            migrationBuilder.RenameColumn(
                name: "DateOfBirth",
                table: "Patients",
                newName: "DOB");
        }
    }
}
