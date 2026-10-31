using System.ComponentModel.DataAnnotations;

namespace InventoryManagementAPI.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Product name is required")]
        public string Name { get; set; } = string.Empty;

        [Range(0, 10000000, ErrorMessage = "Price cannot be negative")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Quantity cannot be negative")]
        public int Quantity { get; set; }
    }
}