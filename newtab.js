const grid = document.getElementById("grid");
const select = document.getElementById("folder");
let folders = [];

function collectFolders(node) {
  if (!node.url && node.id !== "0") {
    folders.push({ id: node.id, title: node.title || "(sans nom)" });
  }
  (node.children || []).forEach(collectFolders);
}

function tile(b) {
  const a = document.createElement("a");
  a.className = "tile";
  a.href = b.url;

  const img = document.createElement("img");
  img.className = "ico";
  img.src = chrome.runtime.getURL("/_favicon/") + "?pageUrl=" + encodeURIComponent(b.url) + "&size=64";
  img.addEventListener("error", () => {
    const l = document.createElement("div");
    l.className = "letter";
    l.textContent = (b.title || b.url).replace(/^https?:\/\/(www\.)?/, "").charAt(0).toUpperCase();
    img.replaceWith(l);
  });

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = b.title || b.url;

  a.append(img, name);
  a.addEventListener("click", (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!/^https?:/i.test(b.url)) return;
    e.preventDefault();
    window.LinkPeek.open(b.url);
  });
  return a;
}

async function render() {
  grid.textContent = "";
  const id = select.value;
  if (!id) return;
  const [folder] = await chrome.bookmarks.getSubTree(id);
  const items = (folder.children || []).filter((c) => c.url);
  if (!items.length) {
    const d = document.createElement("div");
    d.className = "empty";
    d.textContent = "Aucun favori dans ce dossier. Choisis le dossier de ton Speed Dial ci-dessus.";
    grid.append(d);
    return;
  }
  items.forEach((b) => grid.append(tile(b)));
}

async function init() {
  const tree = await chrome.bookmarks.getTree();
  folders = [];
  collectFolders(tree[0]);

  select.textContent = "";
  folders.forEach((f) => {
    const o = document.createElement("option");
    o.value = f.id;
    o.textContent = f.title;
    select.append(o);
  });

  const { speedFolder } = await chrome.storage.local.get({ speedFolder: null });
  const guess = folders.find((f) => /speed ?dial/i.test(f.title));
  const pick =
    (speedFolder && folders.find((f) => f.id === speedFolder)) || guess || folders[0];
  if (pick) select.value = pick.id;
  render();
}

select.addEventListener("change", () => {
  chrome.storage.local.set({ speedFolder: select.value });
  render();
});

["onCreated", "onRemoved", "onChanged", "onMoved"].forEach((ev) =>
  chrome.bookmarks[ev].addListener(() => init())
);

init();
