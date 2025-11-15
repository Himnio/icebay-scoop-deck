-- Add payment_method column to orders table
ALTER TABLE orders 
ADD COLUMN payment_method TEXT CHECK (payment_method IN ('cash', 'online'));

-- Update existing orders to have a default payment method
UPDATE orders 
SET payment_method = 'cash' 
WHERE payment_method IS NULL AND status = 'paid';