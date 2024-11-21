using System;

namespace DDT.Backend.Common.Models
{
    public class Topic
    {
        public int TopicId { get; set; } // Primary Key (SERIAL in the DB)
        
        // Foreign key
        public int CategoryId { get; set; }
        public Category Category { get; set; }  // Navigation property to Category
        
        // Topic Details
        public string TopicName { get; set; }  // The name of the topic (not nullable)
        
        // Timestamps
        public DateTime CreatedAt { get; set; }  // Creation timestamp
        public DateTime UpdatedAt { get; set; }  // Last updated timestamp
    }
}