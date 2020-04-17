const fetch = require('node-fetch');

module.exports = {
  generateRequestIssues(arr) {
    let issues = {};

    for (let issue of arr) {
      issues[issue.param] = {
        value_sent: issue.value,
        issue: issue.msg
      }
    }

    return issues;
  },
  generateId(length) {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let id = '';
    for (let i = 0; i < length; i++)
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
  },
  async validateGoogleToken(token) {
    let resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + encodeURIComponent(token));
    resp = await resp.json();

    if (!resp.email_verified) return false;
    return resp;
  }
}
