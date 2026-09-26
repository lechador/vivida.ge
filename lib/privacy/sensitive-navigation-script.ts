/**
 * Run before hydration so history never puts sensitive and ordinary routes
 * in the same document. This also keeps browser Back from restoring a token
 * URL in a document that loaded analytics after leaving the token page.
 */
export const SENSITIVE_NAVIGATION_GUARD_SCRIPT = `
(function () {
  function isSensitive(url) {
    try {
      var path = new URL(url, window.location.href).pathname.replace(/\\/$/, '');
      return path === '/reset-password' || path === '/unsubscribe' || path === '/api/auth/verify-email';
    } catch (_) { return false; }
  }
  function needsNewDocument(url) {
    return isSensitive(url) !== isSensitive(window.location.href);
  }
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var anchor = event.target && event.target.closest && event.target.closest('a[href]');
    if (!anchor || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return;
    if (needsNewDocument(anchor.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(anchor.href);
    }
  }, true);
  ['pushState', 'replaceState'].forEach(function (method) {
    var original = history[method];
    history[method] = function (state, unused, url) {
      if (url != null && needsNewDocument(url)) {
        window.location[method === 'replaceState' ? 'replace' : 'assign'](new URL(url, window.location.href).href);
        return;
      }
      return original.apply(this, arguments);
    };
  });
})();
`;
