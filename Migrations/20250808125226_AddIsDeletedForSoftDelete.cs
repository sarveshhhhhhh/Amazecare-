using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PAmazeCare.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeletedForSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminName",
                table: "Admins",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Admins",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminName",
                table: "Admins");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Admins");
        }
    }
}
