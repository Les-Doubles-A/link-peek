const radios = document.querySelectorAll('input[name="mode"]');
chrome.storage.sync.get({ mode: "alt" }, ({ mode }) => {
  radios.forEach((r) => (r.checked = r.value === mode));
});
radios.forEach((r) =>
  r.addEventListener("change", () => {
    chrome.storage.sync.set({ mode: r.value }, () => {
      const ok = document.getElementById("ok");
      ok.textContent = "Enregistré ✓";
      setTimeout(() => (ok.textContent = ""), 1500);
    });
  })
);

const url = chrome.runtime.getURL("newtab.html");
document.getElementById("url").textContent = url;
document.getElementById("open").href = url;
document.getElementById("copy").addEventListener("click", async (e) => {
  await navigator.clipboard.writeText(url);
  e.target.textContent = "Copié ✓";
  setTimeout(() => (e.target.textContent = "Copier l'adresse"), 1500);
});

// --- Sites autorisés (liste blanche) ---
const zoneSites = document.getElementById("sites");
const messageSites = document.getElementById("ok2");

function confirmerSites(texte) {
  messageSites.textContent = texte;
  setTimeout(() => (messageSites.textContent = ""), 1500);
}

chrome.storage.sync.get({ sitesAutorises: [] }, ({ sitesAutorises }) => {
  zoneSites.value = sitesAutorises.join("\n");
});

document.getElementById("enregistrer").addEventListener("click", () => {
  const liste = zoneSites.value
    .split("\n")
    .map((l) => l.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, ""))
    .filter(Boolean);
  chrome.storage.sync.set({ sitesAutorises: liste }, () => {
    zoneSites.value = liste.join("\n");
    confirmerSites("Enregistré ✓");
  });
});
