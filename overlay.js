// Fenêtre flottante : déplaçable (barre du haut) et redimensionnable (bords et coins).
// Expose window.LinkPeek.open(url) / close().
(() => {
  if (window.LinkPeek) return;

  const MIN_W = 320;
  const MIN_H = 240;
  let host = null;
  let geom = null;
  let cleanup = null;

  const CSS = `
    :host { all: initial; }
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.35);
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      animation: fade .15s ease-out;
    }
    .panel {
      position: absolute; background: #fff; border-radius: 12px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,.45);
    }
    .bar {
      display: flex; align-items: center; gap: 8px; padding: 8px 10px; flex: none;
      background: #f1f3f4; color: #202124; font-size: 13px; border-bottom: 1px solid #dadce0;
      cursor: move; user-select: none; touch-action: none;
    }
    .url { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .75; }
    button {
      border: 0; background: transparent; color: inherit; cursor: pointer;
      font: inherit; padding: 6px 10px; border-radius: 6px;
    }
    button:hover { background: rgba(128,128,128,.22); }
    .loading {
      position: absolute; top: 46px; left: 0; right: 0; text-align: center;
      padding: 14px; color: #5f6368; font-size: 13px; pointer-events: none;
    }
    iframe { flex: 1; width: 100%; border: 0; background: #fff; }
    .busy iframe { pointer-events: none; }
    .h { position: absolute; z-index: 5; }
    .n  { top: 0;    left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
    .s  { bottom: 0; left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
    .e  { right: 0;  top: 14px; bottom: 14px; width: 6px;  cursor: ew-resize; }
    .w  { left: 0;   top: 14px; bottom: 14px; width: 6px;  cursor: ew-resize; }
    .nw { top: 0; left: 0;  width: 14px; height: 14px; cursor: nwse-resize; }
    .se { bottom: 0; right: 0; width: 14px; height: 14px; cursor: nwse-resize; }
    .ne { top: 0; right: 0; width: 14px; height: 14px; cursor: nesw-resize; }
    .sw { bottom: 0; left: 0; width: 14px; height: 14px; cursor: nesw-resize; }
    @media (prefers-color-scheme: dark) {
      .bar { background: #2b2d31; color: #e8eaed; border-color: #3c4043; }
    }
    @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
  `;

  function send(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, () => {
          void chrome.runtime.lastError;
          resolve();
        });
      } catch (e) {
        resolve();
      }
    });
  }

  function defaultGeom() {
    const vw = innerWidth, vh = innerHeight;
    const w = Math.min(1100, vw * 0.92);
    const h = vh * 0.88;
    return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
  }

  function clamp(g) {
    const w = Math.min(Math.max(g.w, MIN_W), innerWidth);
    const h = Math.min(Math.max(g.h, MIN_H), innerHeight);
    const x = Math.min(Math.max(g.x, 0), innerWidth - w);
    const y = Math.min(Math.max(g.y, 0), innerHeight - h);
    return { x, y, w, h };
  }

  function loadGeom() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get({ peekGeom: null }, (v) => {
          void chrome.runtime.lastError;
          resolve(v ? v.peekGeom : null);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  function saveGeom() {
    try {
      chrome.storage.local.set({ peekGeom: geom });
    } catch (e) {}
  }

  function close() {
    if (!host) return;
    if (cleanup) cleanup();
    host.remove();
    host = null;
    send({ type: "close" });
  }

  async function open(url) {
    close();
    const [, saved] = await Promise.all([send({ type: "open", url }), loadGeom()]);
    geom = clamp(saved ? { ...saved } : defaultGeom());

    host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;";
    const root = host.attachShadow({ mode: "closed" });
    root.innerHTML = `<style>${CSS}</style>
      <div class="backdrop">
        <div class="panel">
          <div class="bar" title="Glisser pour déplacer · double-clic pour recentrer">
            <span class="url"></span>
            <button class="max" title="Remplace la page d'origine par celle-ci">⛶ Plein écran</button>
            <button class="x" title="Fermer (Échap)">✕</button>
          </div>
          <div class="loading">Chargement…</div>
          <iframe></iframe>
          <i class="h n" data-d="n"></i><i class="h s" data-d="s"></i>
          <i class="h e" data-d="e"></i><i class="h w" data-d="w"></i>
          <i class="h nw" data-d="nw"></i><i class="h ne" data-d="ne"></i>
          <i class="h sw" data-d="sw"></i><i class="h se" data-d="se"></i>
        </div>
      </div>`;

    const backdrop = root.querySelector(".backdrop");
    const panel = root.querySelector(".panel");
    const bar = root.querySelector(".bar");
    const iframe = root.querySelector("iframe");
    const loading = root.querySelector(".loading");

    const apply = () => {
      panel.style.left = geom.x + "px";
      panel.style.top = geom.y + "px";
      panel.style.width = geom.w + "px";
      panel.style.height = geom.h + "px";
    };
    apply();

    root.querySelector(".url").textContent = url;
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
    );
    iframe.addEventListener("load", () => (loading.style.display = "none"));
    iframe.src = url;

    // Suivi d'un glissement (déplacement ou redimensionnement)
    function track(e, el, onMove) {
      if (e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      backdrop.classList.add("busy");
      const sx = e.clientX, sy = e.clientY, g0 = { ...geom };
      const move = (ev) => {
        onMove(g0, ev.clientX - sx, ev.clientY - sy);
        apply();
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        backdrop.classList.remove("busy");
        saveGeom();
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    }

    // Déplacement par la barre
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      track(e, bar, (g0, dx, dy) => {
        geom = clamp({ ...g0, x: g0.x + dx, y: g0.y + dy });
      });
    });
    bar.addEventListener("dblclick", (e) => {
      if (e.target.closest("button")) return;
      geom = clamp(defaultGeom());
      apply();
      saveGeom();
    });

    // Redimensionnement par les bords/coins
    root.querySelectorAll(".h").forEach((h) => {
      const dir = h.dataset.d;
      h.addEventListener("pointerdown", (e) =>
        track(e, h, (g0, dx, dy) => {
          let { x, y, w, h: ht } = g0;
          if (dir.includes("e")) w = g0.w + dx;
          if (dir.includes("s")) ht = g0.h + dy;
          if (dir.includes("w")) { w = g0.w - dx; x = g0.x + dx; }
          if (dir.includes("n")) { ht = g0.h - dy; y = g0.y + dy; }
          if (w < MIN_W) { if (dir.includes("w")) x -= MIN_W - w; w = MIN_W; }
          if (ht < MIN_H) { if (dir.includes("n")) y -= MIN_H - ht; ht = MIN_H; }
          if (x < 0) { if (dir.includes("w")) w += x; x = 0; }
          if (y < 0) { if (dir.includes("n")) ht += y; y = 0; }
          if (x + w > innerWidth) w = innerWidth - x;
          if (y + ht > innerHeight) ht = innerHeight - y;
          geom = { x, y, w, h: ht };
        })
      );
    });

    root.querySelector(".x").addEventListener("click", close);
    const maxBtn = root.querySelector(".max");
    // Plein écran : la page remplace complètement la page d'origine, comme un clic normal sur le lien
    maxBtn.addEventListener("click", () => {
      close();
      location.assign(url);
    });
    backdrop.addEventListener("mousedown", (e) => {
      if (e.target === backdrop) close();
    });

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const onWinResize = () => {
      geom = clamp(geom);
      apply();
    };
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onWinResize);
    cleanup = () => {
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onWinResize);
      cleanup = null;
    };

    document.documentElement.appendChild(host);
  }

  window.LinkPeek = { open, close };
})();
