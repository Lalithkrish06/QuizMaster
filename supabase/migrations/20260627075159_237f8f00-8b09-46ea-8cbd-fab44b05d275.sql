
ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_creator_profile_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.attempts ADD CONSTRAINT attempts_user_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
