-- Create varieties table for ice cream inventory
CREATE TABLE public.varieties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('WATER BASE', 'MILK BASE', 'FAMILY PACK', '4L TUBS')),
  stock INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number INTEGER NOT NULL UNIQUE,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variety_id UUID NOT NULL REFERENCES public.varieties(id) ON DELETE CASCADE,
  variety_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for varieties (public read, no auth needed for now)
CREATE POLICY "Anyone can view varieties"
ON public.varieties
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert varieties"
ON public.varieties
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update varieties"
ON public.varieties
FOR UPDATE
USING (true);

-- Create policies for orders (public read/write, no auth needed for now)
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update orders"
ON public.orders
FOR UPDATE
USING (true);

-- Create policies for order_items (public read/write, no auth needed for now)
CREATE POLICY "Anyone can view order items"
ON public.order_items
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on varieties
CREATE TRIGGER update_varieties_updated_at
BEFORE UPDATE ON public.varieties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sequence for order numbers
CREATE SEQUENCE public.order_number_seq START 1;

-- Insert sample varieties from mockData
INSERT INTO public.varieties (name, category, stock, cost, selling_price) VALUES
('Blueberry', 'WATER BASE', 100, 30, 60),
('Mango', 'WATER BASE', 100, 30, 60),
('Cola', 'WATER BASE', 100, 30, 60),
('Orange', 'WATER BASE', 100, 30, 60),
('Strawberry', 'MILK BASE', 80, 35, 65),
('Chocolate', 'MILK BASE', 80, 35, 65),
('Vanilla', 'MILK BASE', 80, 35, 65),
('Butterscotch', 'MILK BASE', 80, 35, 65),
('Family Mango', 'FAMILY PACK', 50, 50, 100),
('Family Chocolate', 'FAMILY PACK', 50, 50, 100),
('Tub Vanilla', '4L TUBS', 30, 150, 300),
('Tub Strawberry', '4L TUBS', 30, 150, 300);