-- Enums
CREATE TYPE public.gender_type AS ENUM ('Male','Female','Other');
CREATE TYPE public.activity_level AS ENUM ('Sedentary','Lightly Active','Moderately Active','Very Active','Extremely Active');
CREATE TYPE public.primary_goal AS ENUM ('Lose Weight','Maintain Weight','Gain Muscle','Improve Fitness','Better Sleep','Reduce Stress');
CREATE TYPE public.intensity_level AS ENUM ('Low','Moderate','High');
CREATE TYPE public.activity_source AS ENUM ('Manual','Wearable','HealthPlatform');
CREATE TYPE public.meal_type AS ENUM ('Breakfast','Lunch','Dinner','Snack');
CREATE TYPE public.nutrition_source AS ENUM ('Manual','Barcode','Meal Save');
CREATE TYPE public.habit_domain AS ENUM ('Physical Activity','Nutrition','Mental Well-being','Sleep','General');
CREATE TYPE public.habit_frequency AS ENUM ('Daily','Weekly','Monthly');
CREATE TYPE public.insight_type AS ENUM ('Correlation','Recommendation','Trend','Achievement','Warning');
CREATE TYPE public.priority_level AS ENUM ('Low','Medium','High');
CREATE TYPE public.report_type AS ENUM ('Daily','Weekly','Monthly','Custom');

-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Users (profiles)
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(100),
  date_of_birth DATE,
  gender public.gender_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.health_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- Health profiles
CREATE TABLE public.health_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  activity_level public.activity_level,
  primary_goal public.primary_goal,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_profiles TO authenticated;
GRANT ALL ON public.health_profiles TO service_role;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own health profile" ON public.health_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER health_profiles_updated BEFORE UPDATE ON public.health_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Physical activity logs
CREATE TABLE public.physical_activity_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  duration_minutes INT,
  distance_km NUMERIC(6,2),
  steps INT,
  calories_burned INT,
  intensity public.intensity_level,
  source public.activity_source NOT NULL DEFAULT 'Manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physical_activity_logs TO authenticated;
GRANT ALL ON public.physical_activity_logs TO service_role;
ALTER TABLE public.physical_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activity" ON public.physical_activity_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.physical_activity_logs (user_id, date);

-- Nutrition logs
CREATE TABLE public.nutrition_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type public.meal_type,
  total_calories INT NOT NULL DEFAULT 0,
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  water_ml INT,
  source public.nutrition_source NOT NULL DEFAULT 'Manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_logs TO authenticated;
GRANT ALL ON public.nutrition_logs TO service_role;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nutrition" ON public.nutrition_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.nutrition_logs (user_id, date);

-- Mental wellbeing logs
CREATE TABLE public.mental_wellbeing_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  emotions JSONB NOT NULL DEFAULT '[]'::jsonb,
  journal_entry TEXT,
  sleep_quality_self_report INT CHECK (sleep_quality_self_report BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mental_wellbeing_logs TO authenticated;
GRANT ALL ON public.mental_wellbeing_logs TO service_role;
ALTER TABLE public.mental_wellbeing_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mind" ON public.mental_wellbeing_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sleep logs
CREATE TABLE public.sleep_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_duration_hours NUMERIC(4,2) NOT NULL,
  sleep_quality_score INT CHECK (sleep_quality_score BETWEEN 1 AND 10),
  sleep_stage_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  source public.activity_source NOT NULL DEFAULT 'Manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_logs TO authenticated;
GRANT ALL ON public.sleep_logs TO service_role;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sleep" ON public.sleep_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habits
CREATE TABLE public.habits (
  habit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  domain public.habit_domain NOT NULL DEFAULT 'General',
  frequency public.habit_frequency NOT NULL DEFAULT 'Daily',
  target_value INT,
  unit VARCHAR(20),
  color VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT TRUE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habits" ON public.habits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit logs
CREATE TABLE public.habit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(habit_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  value INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_logs TO authenticated;
GRANT ALL ON public.habit_logs TO service_role;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habit logs" ON public.habit_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insights
CREATE TABLE public.insights (
  insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type public.insight_type NOT NULL DEFAULT 'Recommendation',
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  domain VARCHAR(50),
  priority public.priority_level NOT NULL DEFAULT 'Medium',
  generated_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed BOOLEAN NOT NULL DEFAULT FALSE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own insights" ON public.insights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Correlations
CREATE TABLE public.correlations (
  correlation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_x VARCHAR(50) NOT NULL,
  domain_y VARCHAR(50) NOT NULL,
  coefficient NUMERIC(4,2),
  significance VARCHAR(20),
  interpretation TEXT,
  generated_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.correlations TO authenticated;
GRANT ALL ON public.correlations TO service_role;
ALTER TABLE public.correlations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own correlations" ON public.correlations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE TABLE public.reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type public.report_type NOT NULL DEFAULT 'Weekly',
  date_generated TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_url VARCHAR(255)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.health_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.physical_activity_logs REPLICA IDENTITY FULL;
ALTER TABLE public.nutrition_logs REPLICA IDENTITY FULL;
ALTER TABLE public.mental_wellbeing_logs REPLICA IDENTITY FULL;
ALTER TABLE public.sleep_logs REPLICA IDENTITY FULL;
ALTER TABLE public.habits REPLICA IDENTITY FULL;
ALTER TABLE public.habit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.insights REPLICA IDENTITY FULL;
ALTER TABLE public.correlations REPLICA IDENTITY FULL;
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles, public.health_profiles, public.physical_activity_logs, public.nutrition_logs, public.mental_wellbeing_logs, public.sleep_logs, public.habits, public.habit_logs, public.insights, public.correlations, public.reports, public.notifications;