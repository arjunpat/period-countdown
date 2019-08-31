export const isProd = window.location.origin.includes('periods.io');
export const serverHost = isProd ? 'https://api.periods.io' : 'http://localhost:8081';
export const accountVersion = '1.1.6';
export const mainVersion = '4.0.5';

export function get(url) {
  if (!url.includes('http')) {
    url = serverHost + url;
  }

  let startTime = window.performance.now();
  return fetch(url, {
    credentials: 'include'
  }).then(async res => {
    res.json = await res.json();
    res.loadTime = window.performance.now() - startTime;

    return res;
  });
}

export function post(url, json) {
  if (!url.includes('http')) {
    url = serverHost + url;
  }

  let startTime = window.performance.now();

  return window.fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(json)
  }).then(async res => {
    res.json = await res.json();
    res.loadTime = window.performance.now() - startTime;

    return res;
  });
}

export function getClientInformation() {
  let ua = window.navigator.userAgent;

  let temp = {
    chrome: !!window.chrome,
    int_exp: /*@cc_on!@*/false || !!document.documentMode,
    edge: !!window.StyleMedia,
    safari: (
      /constructor/i.test(window.HTMLElement)
      || (function (p) { return p.toString() === "[object SafariRemoteNotification]" })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)))
      || ((!!ua.match(/iPad/i) || !!ua.match(/iPhone/i) && !window.chrome)
    ),
    firefox: typeof InstallTrigger !== 'undefined',
    opera: (!!window.opr && !!opr.addons) || !!window.opera || ua.indexOf(' OPR/') >= 0
  }

  let browser = [];

  for (let val in temp)
    if (temp.hasOwnProperty(val) && temp[val] === true)
      browser.push(val);

  return {
    user_agent: ua,
    platform: window.navigator.platform,
    browser
  }
}

export function isFreePeriod(name) {
  if (typeof name !== 'string')
    return false;
  
  name = name.trim().toLowerCase();
  return ['free', 'none', 'nothin'].some(a => name.includes(a));
}

export function generateGoogleSignInLink() {
  let redirectURI;

  if (isProd) {
    redirectURI = 'https://account.periods.io/';
  } else {
    redirectURI = 'http://localhost:8082/';
  }

  redirectURI = encodeURIComponent(redirectURI);
  let client_id = '770077939711-hbanoschq9p65gr8st8grsfbku4bsnhl.apps.googleusercontent.com';

  let url = `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&redirect_uri=${redirectURI}&scope=profile%20email&response_type=token&prompt=select_account`;

  return url;
}