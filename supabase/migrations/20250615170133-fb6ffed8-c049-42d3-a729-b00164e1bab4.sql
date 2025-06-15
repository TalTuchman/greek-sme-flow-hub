
ALTER TABLE public.customers
ADD COLUMN gender TEXT CHECK (gender IN ('Man', 'Woman'));

COMMENT ON COLUMN public.customers.gender IS 'Gender of the customer, can be Man or Woman.';
