using System;

namespace DDT.Backend.Common.Models
{
    public class Category
    {
        public int CategoryId { get; set; }  // Primary Key (SERIAL in the DB)
        public string CategoryName { get; set; }  // The name of the category
        
        // Timestamps
        public DateTime CreatedAt { get; set; }  // Creation timestamp
        public DateTime UpdatedAt { get; set; }  // Last updated timestamp
    }
}