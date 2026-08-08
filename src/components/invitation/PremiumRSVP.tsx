import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-engine";
import { getPublicRsvpForm, submitAdvancedRsvp } from "@/lib/rsvp.functions";
import { trackRsvpSubmit } from "@/lib/analytics/analytics";

type RsvpForm = Awaited<ReturnType<typeof getPublicRsvpForm>>;

function questionOptions(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function PremiumRSVP({
  theme,
  invitationId,
  guestToken,
}: {
  theme: ThemeConfig;
  invitationId: string;
  guestToken?: string;
}) {
  const isLueur = theme.id === "lueur-de-minuit";
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"yes" | "no" | "maybe" | null>(null);
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mealPreference, setMealPreference] = useState("");
  const [allergyInfo, setAllergyInfo] = useState("");
  const [transportRequired, setTransportRequired] = useState(false);
  const [specialNote, setSpecialNote] = useState("");
  const [scheduleSelections, setScheduleSelections] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [form, setForm] = useState<RsvpForm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invitationId === "demo-id") return;
    void getPublicRsvpForm({ data: { invitationId, guestToken } })
      .then((loaded) => {
        setForm(loaded);
        if (loaded.personalGuest) {
          setName(loaded.personalGuest.name);
          setEmail(loaded.personalGuest.email || "");
          setPhone(loaded.personalGuest.phone || "");
          setPartySize(Math.max(1, loaded.personalGuest.invitedPartySize));
          setScheduleSelections(
            Object.fromEntries(loaded.personalGuest.scheduleIds.map((id: string) => [id, true])),
          );
        }
      })
      .catch(() => setError("LCV ayarları yüklenemedi."));
  }, [guestToken, invitationId]);

  const handleSubmit = async () => {
    if (!name.trim() || !status) {
      setError("Lütfen isminizi girin.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (invitationId === "demo-id") {
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        await submitAdvancedRsvp({
          data: {
            invitationId,
            guestName: name.trim(),
            status,
            adultCount: status !== "no" ? partySize : 0,
            childCount: status !== "no" ? childCount : 0,
            guestPhone: phone.trim() || null,
            guestEmail: email.trim() || null,
            mealPreference: mealPreference || null,
            allergyInfo: allergyInfo.trim() || null,
            transportRequired,
            specialNote: specialNote.trim() || null,
            scheduleSelections:
              status === "no"
                ? []
                : Object.entries(scheduleSelections).map(([scheduleId, attending]) => ({
                    scheduleId,
                    attending,
                  })),
            answers:
              status === "no"
                ? []
                : Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
            guestToken,
          },
        });
      }
      trackRsvpSubmit({
        status,
        partySize: status !== "no" ? partySize + childCount : 0,
        hasDietary: Boolean(mealPreference || allergyInfo.trim()),
        hasTransport: Boolean(transportRequired),
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-24 px-6 flex flex-col items-center snap-center font-sans text-white">
      <div
        className={`max-w-md w-full font-sans ${theme.styles.cards.wrapper} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border ${
          isLueur ? "lueur-rsvp border-[#d6b878]/35" : "border-white/20 text-white"
        }`}
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 text-center font-sans text-white"
            >
              <h3 className="font-sans font-bold text-2xl mb-2 tracking-tight text-white">
                Lütfen Cevap Verin
              </h3>
              <p className="font-sans text-sm mb-8 font-medium text-white/80">
                Bizimle olabilecek misiniz?
              </p>

              <div className="space-y-3 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setStatus("yes");
                    setStep(1);
                  }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold text-sm transition-all cursor-pointer ${
                    status === "yes"
                      ? "bg-white text-slate-950 font-bold shadow-lg shadow-white/10"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20 active:scale-[0.99]"
                  }`}
                >
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Evet, Katılıyorum</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("maybe");
                    setStep(1);
                  }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold text-sm transition-all cursor-pointer ${
                    status === "maybe"
                      ? "bg-white text-slate-950 font-bold shadow-lg shadow-white/10"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20 active:scale-[0.99]"
                  }`}
                >
                  <HelpCircle className="w-5 h-5 text-amber-300" />
                  <span>Kararsızım</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("no");
                    setStep(1);
                  }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold text-sm transition-all cursor-pointer ${
                    status === "no"
                      ? "bg-white text-slate-950 font-bold shadow-lg shadow-white/10"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20 active:scale-[0.99]"
                  }`}
                >
                  <X className="w-5 h-5 text-rose-400" />
                  <span>Maalesef Katılamıyorum</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 text-white font-sans"
            >
              <h3 className="text-2xl mb-6 text-center font-sans font-bold tracking-tight text-white">
                Detaylar
              </h3>
              {status !== "no" && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/85 font-bold mb-1.5">
                      Yetişkin
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        aria-label="Yetişkin sayısını azalt"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={1}
                        max={50}
                        value={partySize === 0 ? "" : partySize}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setPartySize(0);
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) setPartySize(Math.min(50, Math.max(0, num)));
                          }
                        }}
                        onBlur={() => {
                          if (partySize < 1) setPartySize(1);
                        }}
                        className="w-full text-center bg-black/30 border border-white/20 rounded-xl py-2.5 text-white text-base font-bold focus:outline-none focus:border-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setPartySize((p) => Math.min(50, (p || 0) + 1))}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                        aria-label="Yetişkin sayısını artır"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {form?.settings?.collect_child_count !== false && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/85 font-bold mb-1.5">
                        Çocuk
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setChildCount((c) => Math.max(0, c - 1))}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                          aria-label="Çocuk sayısını azalt"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min={0}
                          max={50}
                          value={childCount === 0 ? "" : childCount}
                          placeholder="0"
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setChildCount(0);
                            } else {
                              const num = parseInt(val, 10);
                              if (!isNaN(num)) setChildCount(Math.min(50, Math.max(0, num)));
                            }
                          }}
                          className="w-full text-center bg-black/30 border border-white/20 rounded-xl py-2.5 text-white placeholder:text-white/40 text-base font-bold focus:outline-none focus:border-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setChildCount((c) => Math.min(50, c + 1))}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                          aria-label="Çocuk sayısını artır"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-white/85 font-bold mb-2">
                  İsminiz
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                />
              </div>

              {status !== "no" && form?.settings?.collect_phone && (
                <label className="mb-4 block text-xs uppercase tracking-widest text-white/85 font-bold">
                  Telefon
                  <input
                    type="tel"
                    value={phone}
                    required
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                  />
                </label>
              )}
              {status !== "no" && form?.settings?.collect_email && (
                <label className="mb-4 block text-xs uppercase tracking-widest text-white/85 font-bold">
                  E-posta
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                  />
                </label>
              )}
              {status !== "no" && form?.settings?.event_level_attendance && (
                <fieldset className="mb-5 space-y-2">
                  <legend className="mb-2 text-xs uppercase tracking-widest text-white/90 font-bold">
                    Katılacağınız etkinlikler
                  </legend>
                  {form.schedules.map((schedule) => (
                    <label
                      key={schedule.id}
                      className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer text-white ${
                        scheduleSelections[schedule.id] === true
                          ? "border-white/50 bg-white/20 font-semibold"
                          : "border-white/15 bg-black/20 hover:bg-black/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded accent-rose-500 text-rose-500"
                        checked={scheduleSelections[schedule.id] === true}
                        onChange={(event) =>
                          setScheduleSelections((current) => ({
                            ...current,
                            [schedule.id]: event.target.checked,
                          }))
                        }
                      />
                      <span className="text-white text-sm font-semibold leading-snug">
                        {schedule.title}
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              {status !== "no" && form?.settings?.collect_meal_preference && (
                <label className="mb-4 block text-xs uppercase tracking-widest text-white/85 font-bold">
                  Yemek tercihi
                  <input
                    value={mealPreference}
                    onChange={(event) => setMealPreference(event.target.value)}
                    className="mt-2 w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                  />
                </label>
              )}
              {status !== "no" && form?.settings?.collect_allergy_info && (
                <label className="mb-4 block text-xs uppercase tracking-widest text-white/85 font-bold">
                  Alerji bilgisi
                  <textarea
                    value={allergyInfo}
                    onChange={(event) => setAllergyInfo(event.target.value)}
                    className="mt-2 w-full resize-none bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                  />
                </label>
              )}
              {status !== "no" && form?.settings?.collect_transport_need && (
                <label className="mb-4 flex min-h-11 items-center gap-3 text-sm text-white font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="size-4 rounded accent-rose-500 text-rose-500"
                    checked={transportRequired}
                    onChange={(event) => setTransportRequired(event.target.checked)}
                  />
                  Ulaşım desteğine ihtiyacım var
                </label>
              )}
              {status !== "no" &&
                form?.questions.map((question) => {
                  const options = questionOptions(question.options);
                  const selectQuestion = [
                    "single_choice",
                    "meal_preference",
                    "yes_no",
                    "transport_need",
                  ].includes(question.question_type);
                  return (
                    <label
                      key={question.id}
                      className="mb-4 block text-xs uppercase tracking-widest text-white/85 font-bold"
                    >
                      {question.label}
                      {question.question_type === "multiple_choice" ? (
                        <span className="mt-2 block space-y-2">
                          {options.map((option) => {
                            const selected = Array.isArray(answers[question.id])
                              ? (answers[question.id] as unknown[]).includes(option)
                              : false;
                            return (
                              <span
                                key={option}
                                className="flex min-h-11 items-center gap-3 rounded-xl border border-white/20 bg-black/20 px-4 normal-case tracking-normal text-white cursor-pointer hover:bg-black/30"
                              >
                                <input
                                  type="checkbox"
                                  className="size-4 rounded accent-rose-500 text-rose-500"
                                  checked={selected}
                                  onChange={(event) =>
                                    setAnswers((current) => {
                                      const previous = Array.isArray(current[question.id])
                                        ? (current[question.id] as string[])
                                        : [];
                                      return {
                                        ...current,
                                        [question.id]: event.target.checked
                                          ? [...new Set([...previous, option])]
                                          : previous.filter((item) => item !== option),
                                      };
                                    })
                                  }
                                />
                                <span className="text-white text-sm font-medium">{option}</span>
                              </span>
                            );
                          })}
                        </span>
                      ) : selectQuestion ? (
                        <select
                          value={String(answers[question.id] ?? "")}
                          required={question.is_required}
                          onChange={(event) => {
                            const value = ["yes_no", "transport_need"].includes(
                              question.question_type,
                            )
                              ? event.target.value === "true"
                              : event.target.value;
                            setAnswers((current) => ({ ...current, [question.id]: value }));
                          }}
                          className="mt-2 w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-white/50"
                        >
                          <option value="" className="bg-slate-900 text-white">
                            Seçin
                          </option>
                          {question.question_type === "yes_no" ||
                          question.question_type === "transport_need" ? (
                            <>
                              <option value="true" className="bg-slate-900 text-white">
                                Evet
                              </option>
                              <option value="false" className="bg-slate-900 text-white">
                                Hayır
                              </option>
                            </>
                          ) : (
                            options.map((option) => (
                              <option
                                key={option}
                                value={option}
                                className="bg-slate-900 text-white py-1"
                              >
                                {option}
                              </option>
                            ))
                          )}
                        </select>
                      ) : question.question_type === "long_text" ? (
                        <textarea
                          value={String(answers[question.id] ?? "")}
                          required={question.is_required}
                          maxLength={3000}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: event.target.value,
                            }))
                          }
                          className="mt-2 min-h-28 w-full resize-y bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                        />
                      ) : (
                        <input
                          type={
                            question.question_type === "number"
                              ? "number"
                              : question.question_type === "date"
                                ? "date"
                                : "text"
                          }
                          value={String(answers[question.id] ?? "")}
                          required={question.is_required}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]:
                                question.question_type === "number"
                                  ? Number(event.target.value)
                                  : event.target.value,
                            }))
                          }
                          className="mt-2 w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                        />
                      )}
                    </label>
                  );
                })}
              {status !== "no" && form?.settings?.collect_special_note && (
                <label className="mb-4 block text-xs uppercase tracking-widest text-white/85 font-bold">
                  Özel not
                  <textarea
                    value={specialNote}
                    onChange={(event) => setSpecialNote(event.target.value)}
                    className="mt-2 w-full resize-none bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm font-medium"
                  />
                </label>
              )}

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || (!form && invitationId !== "demo-id")}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:brightness-110 active:scale-[0.99]"
                } ${theme.styles.buttons.primary}`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Gönder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center text-white"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl mb-2 font-sans font-bold tracking-tight text-white">
                Teşekkürler
              </h3>
              <p className="font-sans font-medium text-white/85">Yanıtınız başarıyla iletildi.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
