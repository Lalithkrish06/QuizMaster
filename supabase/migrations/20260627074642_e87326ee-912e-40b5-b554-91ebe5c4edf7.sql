
-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);

INSERT INTO public.categories (slug, name, color, icon) VALUES
('science','Science','#6c5ce7','Atom'),
('technology','Technology','#ff6b35','Cpu'),
('history','History','#f7931e','Landmark'),
('geography','Geography','#2dd4a8','Globe'),
('pop-culture','Pop Culture','#e84393','Sparkles'),
('sports','Sports','#22c55e','Trophy'),
('art-design','Art & Design','#a78bfa','Palette'),
('language','Language','#06b6d4','Languages');

-- QUIZZES
CREATE TYPE public.quiz_difficulty AS ENUM ('easy','medium','hard','expert');
CREATE TYPE public.quiz_status AS ENUM ('draft','published');

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  difficulty public.quiz_difficulty NOT NULL DEFAULT 'medium',
  status public.quiz_status NOT NULL DEFAULT 'draft',
  time_limit_seconds INTEGER,
  randomize_questions BOOLEAN NOT NULL DEFAULT false,
  randomize_options BOOLEAN NOT NULL DEFAULT false,
  negative_marking BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  attempts_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX quizzes_status_idx ON public.quizzes(status);
CREATE INDEX quizzes_creator_idx ON public.quizzes(creator_id);
CREATE INDEX quizzes_category_idx ON public.quizzes(category_id);
GRANT SELECT ON public.quizzes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published quizzes readable by all" ON public.quizzes FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);
CREATE POLICY "Creators insert own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators delete own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = creator_id);
CREATE TRIGGER quizzes_updated BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QUESTIONS
CREATE TYPE public.question_type AS ENUM ('mcq_single','mcq_multi','true_false');

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_type public.question_type NOT NULL DEFAULT 'mcq_single',
  prompt TEXT NOT NULL,
  image_url TEXT,
  explanation TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  marks NUMERIC(5,2) NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX questions_quiz_idx ON public.questions(quiz_id, position);
GRANT SELECT ON public.questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions readable when quiz visible" ON public.questions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = questions.quiz_id AND (q.status='published' OR q.creator_id = auth.uid())));
CREATE POLICY "Creators manage questions" ON public.questions FOR ALL
USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = questions.quiz_id AND q.creator_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = questions.quiz_id AND q.creator_id = auth.uid()));

-- ATTEMPTS
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC(7,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(7,2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX attempts_quiz_idx ON public.attempts(quiz_id, score DESC);
CREATE INDEX attempts_user_idx ON public.attempts(user_id, completed_at DESC);
GRANT SELECT ON public.attempts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attempts readable by all (leaderboards)" ON public.attempts FOR SELECT USING (true);
CREATE POLICY "Users insert own attempts" ON public.attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bump quiz attempt count
CREATE OR REPLACE FUNCTION public.bump_attempts_count() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.quizzes SET attempts_count = attempts_count + 1 WHERE id = NEW.quiz_id;
  RETURN NEW;
END $$;
CREATE TRIGGER attempts_bump AFTER INSERT ON public.attempts FOR EACH ROW EXECUTE FUNCTION public.bump_attempts_count();

-- BOOKMARKS
CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quiz_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
