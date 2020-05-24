export const isProd = window.location.origin.includes('periods.io');
export const serverHost = isProd ? 'https://api.periods.io' : 'http://localhost:8081';
export const accountVersion = '1.2.1';
export const mainVersion = '4.1.1';

export function get(url) {
  if (!url.includes('http')) {
    url = serverHost + url;
  }

  let startTime = window.performance.now();
  return fetch(url, {
    credentials: 'include'
  }).then(async res => {
    return {
      json: await res.json(),
      loadTime: window.performance.now() - startTime
    }
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
    return {
      json: await res.json(),
      loadTime: window.performance.now() - startTime
    }
  });
}

export function getClientInformation() {
  let ua = window.navigator.userAgent;
  let chrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  let int_exp = /*@cc_on!@*/false || !!document.documentMode;

  let temp = {
    chrome,
    int_exp,
    edge: !int_exp && !!window.StyleMedia,
    edge_chromium: chrome && (navigator.userAgent.indexOf("Edg") != -1),
    safari: (
      /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))
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
  let redirectURI = encodeURIComponent(isProd ? 'https://account.periods.io/' : 'http://localhost:8082/');
  let client_id = '770077939711-hbanoschq9p65gr8st8grsfbku4bsnhl.apps.googleusercontent.com';
  
  return `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&redirect_uri=${redirectURI}&scope=profile%20email&response_type=token&prompt=select_account`;
}
