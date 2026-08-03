export const GOOGLE_TAG_MANAGER_ID = "GTM-KSV2TJVL";

export const GOOGLE_TAG_MANAGER_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`;

export const GOOGLE_TAG_MANAGER_NOSCRIPT_URL =
  `https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}`;

export function renderGoogleTagManagerHead() {
  return `<!-- Google Tag Manager --><script>${GOOGLE_TAG_MANAGER_SCRIPT}</script><!-- End Google Tag Manager -->`;
}

export function renderGoogleTagManagerNoScript() {
  return `<!-- Google Tag Manager (noscript) --><noscript><iframe src="${GOOGLE_TAG_MANAGER_NOSCRIPT_URL}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript><!-- End Google Tag Manager (noscript) -->`;
}
