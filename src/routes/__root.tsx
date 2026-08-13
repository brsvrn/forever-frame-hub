import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "sonner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CookieConsentBanner } from "@/components/cookie/CookieConsentBanner";
import { ANALYTICS_CONFIG, trackPageView } from "@/lib/analytics/analytics";
import { captureUTMParams } from "@/lib/analytics/utm";
import { getStoredConsent, applyConsentToThirdParties } from "@/lib/analytics/consent";
import { reportAdminError } from "@/lib/admin-error-reporting";

const googleSiteVerification =
  (typeof process !== "undefined"
    ? process.env?.GOOGLE_SITE_VERIFICATION || process.env?.VITE_GOOGLE_SITE_VERIFICATION
    : undefined) || import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

const decorativeFontStylesheet =
  "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;0,6..96,700;1,6..96,400;1,6..96,600;1,6..96,700&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700;800&family=Great+Vibes&family=Inter:wght@300;400;500;600;700&family=Italiana&family=Manrope:wght@300;400;500;600;700;800&family=Marcellus&family=Montserrat:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700&family=Prata&display=swap";

function appendGoogleTagManager(gtmId: string) {
  if (!gtmId || document.querySelector("script[data-memorywedding-gtm]")) return;
  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };
  const dataLayer = (analyticsWindow.dataLayer ??= []);
  dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.dataset.memoryweddingGtm = "true";
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.appendChild(script);
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center flex flex-col items-center">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sayfa Bulunamadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center flex flex-col items-center">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Sayfa Yüklenemedi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bir sorun oluştu. Sayfayı yenileyebilir veya ana sayfaya dönebilirsiniz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MemoryWedding" },
      {
        name: "description",
        content: "Düğününüzün her anını toplayan premium dijital deneyim platformu.",
      },
      { name: "author", content: "MemoryWedding" },
      { name: "referrer", content: "origin-when-cross-origin" },
      { name: "theme-color", content: "#0E1220" },
      { property: "og:site_name", content: "MemoryWedding" },
      { property: "og:locale", content: "tr_TR" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.memory-wedding.com/logo.jpg" },
      { property: "og:image:secure_url", content: "https://www.memory-wedding.com/logo.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1024" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.memory-wedding.com/logo.jpg" },
      ...(googleSiteVerification
        ? [{ name: "google-site-verification", content: googleSiteVerification }]
        : []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        href: "/fonts/cormorant-garamond-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/plus-jakarta-sans-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: "/logo.jpg", type: "image/jpeg" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const gtmId = ANALYTICS_CONFIG.gtmId;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID || ANALYTICS_CONFIG.metaPixelId;

  return (
    <html lang="tr">
      <head>
        <HeadContent />
        {/* Google Consent Mode v2 Default Setup */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
              });
            `,
          }}
        />
        <link
          rel="stylesheet"
          href={decorativeFontStylesheet}
          media="print"
          onLoad={(event) => {
            event.currentTarget.media = "all";
          }}
        />
        <noscript>
          <link rel="stylesheet" href={decorativeFontStylesheet} />
        </noscript>

        {/* Meta Pixel */}
        {pixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
              `,
            }}
          />
        )}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KSV2TJVL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Meta Pixel (noscript) */}
        {pixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}

        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  useEffect(() => {
    // 1. Capture UTM parameters and store
    captureUTMParams();

    // 2. Apply existing consent if any
    const consent = getStoredConsent();
    applyConsentToThirdParties(consent);

    let analyticsTimer: number | undefined;
    const scheduleAnalytics = () => {
      analyticsTimer = window.setTimeout(
        () => appendGoogleTagManager(ANALYTICS_CONFIG.gtmId),
        2500,
      );
    };
    if (document.readyState === "complete") scheduleAnalytics();
    else window.addEventListener("load", scheduleAnalytics, { once: true });

    const onWindowError = (event: ErrorEvent) => {
      reportAdminError(event.error ?? event.message, { source: "window_error" });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportAdminError(event.reason, { source: "unhandled_rejection" });
    };
    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("load", scheduleAnalytics);
      if (analyticsTimer !== undefined) window.clearTimeout(analyticsTimer);
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    // 3. Track page views on route changes
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <CookieConsentBanner />
      <Toaster />
    </QueryClientProvider>
  );
}
