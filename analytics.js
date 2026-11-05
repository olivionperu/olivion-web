// ===== Google Analytics 4 + Meta Pixel con consentimiento =====
// Pega aquí tu ID de medición (formato G-XXXXXXXXXX). Mientras esté vacío no se carga GA.
const GA_ID = "";
// Pega aquí el ID de tu Pixel de Meta (solo números; está en Administrador de eventos). Vacío = no se carga.
// Si ambos están vacíos no se carga nada ni se muestra el aviso de cookies.
const PIXEL_ID = "1660070089075500";
// ==================================================

(() => {
  if (!GA_ID && !PIXEL_ID) return;
  const KEY = "olivion_cookies";
  const read = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (_) {} };

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    if (PIXEL_ID) {
      const f = (window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); });
      if (!window._fbq) window._fbq = f;
      f.push = f; f.loaded = true; f.version = "2.0"; f.queue = [];
      const p = document.createElement("script");
      p.async = true;
      p.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(p);
      f("init", PIXEL_ID);
      f("track", "PageView");
    }
    if (!GA_ID) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  };
  const grant = () => { gtag("consent", "update", { analytics_storage: "granted" }); load(); };
  const revoke = () => {
    gtag("consent", "update", { analytics_storage: "denied" });
    if (window.fbq) window.fbq("consent", "revoke");
  };
  const lead = (method, text) => {
    gtag("event", "generate_lead", text ? { method, link_text: text } : { method });
    if (window.fbq) window.fbq("track", "Lead", { content_name: method });
  };

  const banner = () => {
    if (document.getElementById("ck")) return;
    const d = document.createElement("div");
    d.className = "ck";
    d.id = "ck";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Preferencias de cookies");
    d.innerHTML =
      '<p>Usamos cookies de analítica' + (PIXEL_ID ? ' y de anuncios (Google Analytics y Meta Pixel) para entender cómo se usa la web, mejorarla y medir nuestros anuncios.' : ' (Google Analytics) para entender cómo se usa la web y mejorarla.') + ' Solo se activan si las aceptas. ' +
      '<a href="/cookies">Más información</a></p>' +
      '<div class="ck__b"><button type="button" class="ck__no">Rechazar</button><button type="button" class="ck__ok">Aceptar</button></div>';
    document.body.appendChild(d);
    d.querySelector(".ck__ok").addEventListener("click", () => { save("granted"); grant(); d.remove(); });
    d.querySelector(".ck__no").addEventListener("click", () => { save("denied"); revoke(); d.remove(); });
  };

  const state = read();
  if (state === "granted") grant();
  else if (state !== "denied") banner();

  document.addEventListener("click", (e) => {
    const open = e.target.closest && e.target.closest("[data-cookies]");
    if (open) { e.preventDefault(); try { localStorage.removeItem(KEY); } catch (_) {} revoke(); banner(); return; }
    if (read() !== "granted") return;
    const a = e.target.closest && e.target.closest("[data-contact],[data-demo],[data-fund],[data-plan],.stack__cta");
    if (a) lead("whatsapp", (a.textContent || "").trim().slice(0, 60));
  });

  const form = document.getElementById("form");
  if (form) form.addEventListener("submit", () => { if (read() === "granted") lead("formulario"); });
})();
