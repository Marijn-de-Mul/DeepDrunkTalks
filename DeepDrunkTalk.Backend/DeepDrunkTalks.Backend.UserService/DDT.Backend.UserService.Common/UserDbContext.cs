using Microsoft.EntityFrameworkCore;
using DDT.Backend.UserService.Common.Models.Authentication;

namespace DDT.Backend.UserService.Common
{
    public class UserDbContext : DbContext
    {
        public DbSet<RegisterRequest> Users { get; set; }

        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RegisterRequest>().HasKey(u => u.Email);
            base.OnModelCreating(modelBuilder);
        }
    }
}