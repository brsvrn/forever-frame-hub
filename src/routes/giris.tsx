import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { appContent } from "@/lib/app-content";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { easeSilk } from "@/components/landing/motion-primitives";
import { Field, TextInput } from "@/components/builder/Field";
import { consumeAuthReturnTo, getAuthRedirectUrl, peekAuthReturnTo } from "@/lib/auth-helpers";

const title = "Giriş Yap veya Hesap Oluştur — MemoryWedding";
const description =
  "MemoryWedding hesabınıza giriş yapın; davetiyelerinizi kaydedin, RSVP yanıtlarını takip edin ve anılarınızı yönetin.";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AuthPage />
    </I18nProvider>
  ),
});

function AuthPage() {
  const { lang } = useI18n();
  const c = appContent[lang].auth;

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.assign(consumeAuthReturnTo());
    });
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${peekAuthReturnTo()}`,
            data: { full_name: name },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) window.location.assign(consumeAuthReturnTo());
        else setInfo(c.checkEmail);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        window.location.assign(consumeAuthReturnTo());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : c.genericError);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const redirectUrl = getAuthRedirectUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.warn("[Auth] Google OAuth error:", error.message);
      setError(c.genericError);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
      />

      <header className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-rose to-gold">
            <Heart className="size-4 text-background" aria-hidden="true" />
          </span>
          <span className="font-display text-xl tracking-tight text-foreground">
            Memory<span className="text-gradient-gold font-medium">Wedding</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 items-center px-4 pb-20 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeSilk }}
          className="glass w-full rounded-4xl p-7 sm:p-9"
        >
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-light sm:text-4xl">
            {mode === "signin" ? c.signInTitle : c.signUpTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? c.signInDesc : c.signUpDesc}
          </p>

          <button
            type="button"
            onClick={google}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-accent/20 px-6 text-sm font-medium transition-colors hover:bg-accent/40"
          >
            <GoogleMark />
            {c.google}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {c.or}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" ? (
              <Field label={c.name}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={c.namePh}
                    autoComplete="name"
                  />
                )}
              </Field>
            ) : null}

            <Field label={c.email}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siz@ornek.com"
                  autoComplete="email"
                />
              )}
            </Field>

            <Field label={c.password} hint={mode === "signup" ? c.passwordHint : undefined}>
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              )}
            </Field>

            {error ? <p className="text-sm text-rose">{error}</p> : null}
            {info ? (
              <p className="flex items-center gap-2 text-sm text-gold">
                <Mail className="size-4" aria-hidden="true" />
                {info}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose to-gold text-sm font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {c.loading}
                </>
              ) : mode === "signin" ? (
                c.signIn
              ) : (
                c.signUp
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? c.toSignUp : c.toSignIn}
          </button>
        </motion.section>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6 6.9 2.6 2.8 6.7 2.8 11.9S6.9 21.2 12 21.2c5.6 0 9.3-3.9 9.3-9.4 0-.6-.06-1.1-.15-1.6H12z"
      />
    </svg>
  );
}
