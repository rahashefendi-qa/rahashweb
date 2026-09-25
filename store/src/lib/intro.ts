export const INTRO_KEY = "intro-seen";

/** Runs before first paint: flags <html> so CSS shows the intro only when it should play. */
export const INTRO_DECIDE_SCRIPT = `(function(){try{var d=document.documentElement;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('reduce-motion')==='1';if(r){d.dataset.reduceMotion='1'}if(!r&&!sessionStorage.getItem('${INTRO_KEY}')&&location.pathname.indexOf('/admin')!==0){d.dataset.intro='1'}}catch(e){}})();`;
