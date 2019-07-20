export const serverHost = 'http://localhost:8081';
// export const serverHost = 'https://api.periods.io';
export const accountVersion = '1.1.1';
export const mainVersion = '4.0.2';

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

  if (window.location.origin.includes('periods.io')) {
    redirectURI = 'https://account.periods.io/';
  } else {
    redirectURI = 'http://localhost:8082/';
  }

  redirectURI = encodeURIComponent(redirectURI);

  let params = {
    client_id: '770077939711-hbanoschq9p65gr8st8grsfbku4bsnhl.apps.googleusercontent.com',
    scope: encodeURIComponent('profile email')
  }

  let url = `https://accounts.google.com/o/oauth2/auth?client_id=${params.client_id}&redirect_uri=${redirectURI}&scope=${params.scope}&response_type=token&prompt=select_account`;

  return url;
}