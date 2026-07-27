import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./motion-primitives";
import { SectionHeading } from "./SectionHeading";

export function FAQ() {
  const { t } = useI18n();

  return (
    <section id="sss" className="section-y relative">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />

        <Reveal className="mt-14 max-w-none">
          <Accordion type="single" collapsible className="space-y-3">
            {t.faq.items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="glass overflow-hidden rounded-2xl border-b-0 px-5 sm:px-7"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline sm:text-lg">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
