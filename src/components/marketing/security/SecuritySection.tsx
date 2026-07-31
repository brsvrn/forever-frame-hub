import { Shield, Lock, EyeOff, Server } from "lucide-react";
import { motion } from "framer-motion";
import { easeSilk } from "@/components/landing/motion-primitives";

export function SecuritySection() {
  const features = [
    {
      title: "Erişim Güvenliği",
      description:
        "Fotoğraf ve videolar yetkilendirilmiş erişim kurallarıyla korunur.",
      icon: Lock,
    },
    {
      title: "Etkinlik Gizliliği",
      description:
        "Etkinlik yönetim alanı, yetkilendirilmiş kullanıcı erişimiyle korunur.",
      icon: EyeOff,
    },
    {
      title: "Güvenli Veri Aktarımı",
      description:
        "Veri aktarımı SSL/TLS bağlantısı üzerinden gerçekleştirilir. MemoryWedding, kullanıcı içeriklerini hizmetin sunulması dışında kullanmaz.",
      icon: Server,
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-6"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-display font-medium tracking-tight text-foreground sm:text-5xl"
          >
            Anılarınız Tamamen Güvende
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            MemoryWedding, gizliliğinizi her şeyden önde tutar. Fotoğraflarınız ve videolarınız
            sadece sizin ve sevdiklerinizin erişimine açıktır.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5, ease: easeSilk }}
                className="flex flex-col bg-surface/80 p-8 rounded-3xl border border-border hover:border-gold/30 transition-colors shadow-sm"
              >
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-foreground mb-4">
                  <div className="p-2.5 bg-gold/10 rounded-xl text-gold">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
