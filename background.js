// Retire X-Frame-Options / CSP uniquement pour le site affiché dans l'aperçu,
// et seulement dans l'onglet concerné, le temps que l'aperçu est ouvert.

const ruleId = (tabId) => tabId + 1;

function removeRule(tabId) {
  return chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [ruleId(tabId)]
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;
  if (tabId == null) return;

  if (msg.type === "open") {
    let hostname;
    try {
      hostname = new URL(msg.url).hostname;
    } catch (e) {
      sendResponse({ ok: false });
      return;
    }
    chrome.declarativeNetRequest
      .updateSessionRules({
        removeRuleIds: [ruleId(tabId)],
        addRules: [
          {
            id: ruleId(tabId),
            priority: 1,
            action: {
              type: "modifyHeaders",
              responseHeaders: [
                { header: "x-frame-options", operation: "remove" },
                { header: "content-security-policy", operation: "remove" }
              ]
            },
            condition: {
              tabIds: [tabId],
              resourceTypes: ["sub_frame"],
              requestDomains: [hostname]
            }
          }
        ]
      })
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true; // réponse asynchrone
  }

  if (msg.type === "close") {
    removeRule(tabId).finally(() => sendResponse({ ok: true }));
    return true;
  }
});

// Nettoyage si l'onglet navigue ou se ferme
chrome.tabs.onRemoved.addListener((tabId) => removeRule(tabId).catch(() => {}));
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === "loading" && info.url) removeRule(tabId).catch(() => {});
});

