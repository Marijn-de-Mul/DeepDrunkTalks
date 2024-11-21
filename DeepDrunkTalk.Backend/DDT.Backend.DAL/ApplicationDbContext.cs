using Microsoft.EntityFrameworkCore;
using DDT.Backend.Common.Models;
using DDT.Backend.Common.Models;

namespace DDT.Backend.DAL
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Question> Questions { get; set; } 
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Topic> Topics { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Conversation>()
                .ToTable("Conversations") 
                .Property(c => c.UserId)  
                .HasColumnName("UserId")  
                .IsRequired();
            
            modelBuilder.Entity<Conversation>()
                .Property(c => c.StartTime)
                .HasConversion(
                    v => v.ToUniversalTime(),   
                    v => DateTime.SpecifyKind(v, DateTimeKind.Utc) 
                );
            
            modelBuilder.Entity<Conversation>()
                .Property(c => c.EndTime)
                .HasConversion(
                    v => v.ToUniversalTime(),
                    v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                );
        }
    }
}