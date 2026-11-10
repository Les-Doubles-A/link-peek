(() => {
  if (window.top !== window) return;

  let mode = "alt"; // "alt" | "all" | "off"
  let sitesAutorises = []; // liste blanche : l'extension agit uniquement sur ces sites

  chrome.storage.sync.get({ mode: "alt", sitesAutorises: [] }, (v) => {
    mode = v.mode;
    sitesAutorises = v.sitesAutorises;
  });
  chrome.storage.onChanged.addListener((c) => {
    if (c.mode) mode = c.mode.newValue;
    if (c.sitesAutorises) sitesAutorises = c.sitesAutorises.newValue || [];
  });

  // Vrai si la page courante est dans la liste blanche (sous-domaines inclus)
  function siteEstAutorise() {
    const hote = location.hostname.toLowerCase().replace(/^www\./, "");
    return sitesAutorises.some((site) => {
      const s = String(site).trim().toLowerCase().replace(/^www\./, "");
      return s && (hote === s || hote.endsWith("." + s));
    });
  }

  document.addEventListener(
    "click",
    (e) => {
      if (mode === "off" || e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (mode === "alt" && !e.altKey) return;
      if (!siteEstAutorise()) return;

      const a = e.composedPath().find((n) => n.tagName === "A" && n.href);
      if (!a || a.hasAttribute("download")) return;

      let url;
      try {
        url = new URL(a.href);
      } catch (err) {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (
        url.origin === location.origin &&
        url.pathname === location.pathname &&
        url.search === location.search &&
        url.hash
      )
        return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.LinkPeek.open(url.href);
    },
    true
  );
})();
