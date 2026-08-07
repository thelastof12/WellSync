ALTER TABLE public.nutrition_logs ADD COLUMN food VARCHAR(200), ADD COLUMN quantity VARCHAR(50);
ALTER TABLE public.mental_wellbeing_logs ADD COLUMN energy INT CHECK (energy BETWEEN 1 AND 10);
ALTER TABLE public.sleep_logs ADD COLUMN bedtime VARCHAR(10), ADD COLUMN wake_time VARCHAR(10);
ALTER TABLE public.physical_activity_logs ADD COLUMN notes TEXT;