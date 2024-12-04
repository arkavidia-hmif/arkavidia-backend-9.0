CREATE FUNCTION public.handle_new_identity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
 INSERT INTO public.user (id, email)
 VALUES (NEW.id, NEW.email);
 RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER on_identity_created
 AFTER INSERT ON public.user_identity
 FOR EACH ROW EXECUTE PROCEDURE handle_new_identity();