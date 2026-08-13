-- Trigger functions are invoked by Postgres and must not be callable over RPC.
REVOKE ALL ON FUNCTION public.create_event_admin_notification()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_purchase_admin_notification()
  FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS admin_notifications_actor_user_idx
  ON public.admin_notifications (actor_user_id)
  WHERE actor_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS admin_notifications_invitation_idx
  ON public.admin_notifications (invitation_id)
  WHERE invitation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS admin_notifications_transaction_idx
  ON public.admin_notifications (transaction_id)
  WHERE transaction_id IS NOT NULL;
