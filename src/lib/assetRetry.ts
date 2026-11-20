/*
 * One reload when the page's own script or stylesheet fails to load (UX
 * sweep 21-11-26): one load in 600 got a 502 on the main bundle and never
 * hydrated, and a deploy can briefly serve a page whose files are gone (an
 * unstyled page that never runs). Nothing on such a page works, so the
 * browser is asked for it once more.
 *
 * An inline script in <head> (the root route's document; React writes it
 * after the head's links and meta), so it listens before the module script
 * in <body> runs. It reacts only to a <script>, a stylesheet or a module
 * preload from this site's /assets/ (an image, a font or analytics never
 * reloads the page), and only until the window's load event: a lazy file
 * failing later (a tab left open across a deploy) never reloads a page the
 * reader is using. The stylesheets above it have loaded or failed by the
 * time it runs (an inline script waits for them), so their failures came
 * before it listened: it checks them once, and a failed one has no rules
 * (Chromium keeps an empty sheet, WebKit none). A module preload that failed
 * before it ran fails the module script that imports it, which it hears.
 *
 * Before the reload it asks for the failed file again, past the browser's
 * caches (`cache: "reload"`): WebKit keeps a failed module script and serves
 * it to the reloaded page, which then fails the same way; the fresh answer
 * replaces it. The reload waits for that answer, or 3 s at most. A plain
 * reload of the page is enough since #165: the edge keeps no page of
 * another build, so the reload gets the current page and its files.
 *
 * It reloads at most once per tab until a page loads cleanly: a session
 * flag is set before the reload, and only a load with no failure clears it,
 * so a file that keeps failing can never loop. Without session storage it
 * never reloads.
 *
 * The Content Security Policy allows inline scripts (src/server/http.ts).
 * Kept small: every page's HTML carries it.
 */

/*
 * Written out by hand, minified: `k` is the session flag ("a reload was
 * tried and no load has been clean since"), `f` a failure on this load, `d`
 * the load event seen, `a` the address of a failed element when it is one
 * of the site's files, `r` the failure (the file asked for again, then one
 * reload). No interpolation: the root route keeps the string out of the
 * client bundle, and an expression in it would stay.
 */
export const ASSET_RETRY_SCRIPT = `(function(){var k="pf-asset-retry",f=0,d=0,p=location.origin+"/assets/";function a(n){var u=n&&(n.tagName=="SCRIPT"?n.src:/^(stylesheet|modulepreload)$/.test(n.rel)&&n.href);return u&&!u.indexOf(p)&&u}function r(u){f=1;if(d)return;try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,1)}catch(e){return}var o=0,g=function(){o++||location.reload()};fetch(u,{cache:"reload"}).then(g,g);setTimeout(g,3e3)}addEventListener("error",function(e){var u=a(e.target);u&&r(u)},!0);addEventListener("load",function(){d=1;if(!f)try{sessionStorage.removeItem(k)}catch(e){}});for(var l=document.querySelectorAll('link[rel="stylesheet"]'),i=0;i<l.length;i++)try{var s=l[i].sheet,u=a(l[i]);u&&!(s&&s.cssRules.length)&&matchMedia(l[i].media||"all").matches&&r(u)}catch(e){}})()`;
