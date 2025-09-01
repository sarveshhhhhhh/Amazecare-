using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PAmazeCare.Migrations
{
    /// <inheritdoc />
    public partial class AddTestNameAndDescriptionToRecommendedTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Dosage",
                table: "DosageMasters",
                newName: "DosageName");

            migrationBuilder.RenameIndex(
                name: "IX_DosageMasters_Dosage",
                table: "DosageMasters",
                newName: "IX_DosageMasters_DosageName");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "DosageMasters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "DosageMasters");

            migrationBuilder.RenameColumn(
                name: "DosageName",
                table: "DosageMasters",
                newName: "Dosage");

            migrationBuilder.RenameIndex(
                name: "IX_DosageMasters_DosageName",
                table: "DosageMasters",
                newName: "IX_DosageMasters_Dosage");
        }
    }
}
