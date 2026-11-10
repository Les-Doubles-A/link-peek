const elSite = document.getElementById("site");
const elEtat = document.getElementById("etat");
const bouton = document.getElementById("bascule");

let hoteCourant = null;

// Renvoie l'entrée de la liste qui couvre cet hôte (ou null)
function trouverEntree(liste, hote) {
  return (
    liste.find((site) => {
      const s = String(site).trim().toLowerCase();
      return s && (hote === s || hote.endsWith("." + s));
    }) || null
  );
}

async function afficher() {
  const { sitesAutorises } = await chrome.storage.sync.get({ sitesAutorises: [] });
  const entree = trouverEntree(sitesAutorises, hoteCourant);
  if (entree) {
    elEtat.textContent = "Link Peek est actif sur ce site.";
    bouton.textContent = "Retirer de la liste";
    bouton.classList.add("retirer");
  } else {
    elEtat.textContent = "Link Peek est inactif sur ce site.";
    bouton.textContent = "Activer sur ce site";
    bouton.classList.remove("retirer");
  }
  bouton.disabled = false;
}

bouton.addEventListener("click", async () => {
  const { sitesAutorises } = await chrome.storage.sync.get({ sitesAutorises: [] });
  const entree = trouverEntree(sitesAutorises, hoteCourant);
  const nouvelleListe = entree
    ? sitesAutorises.filter((s) => s !== entree)
    : [...sitesAutorises, hoteCourant];
  await chrome.storage.sync.set({ sitesAutorises: nouvelleListe });
  afficher();
});

document.getElementById("reglages").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
  window.close();
});

(async () => {
  const [onglet] = await chrome.tabs.query({ active: true, currentWindow: true });
  let url;
  try {
    url = new URL(onglet.url);
  } catch (err) {
    url = null;
  }
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) {
    elSite.textContent = "Page non compatible";
    elEtat.textContent = "Ouvre un site web (http/https) pour l'activer.";
    bouton.textContent = "Activer sur ce site";
    return;
  }
  hoteCourant = url.hostname.toLowerCase().replace(/^www\./, "");
  elSite.textContent = hoteCourant;
  afficher();
})();
