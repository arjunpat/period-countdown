import Vue from 'vue';
import { get as getURL, post as postURL } from '../../common.js';

export async function get(url) {
  let res = await getURL(url);
  Vue.$ga.time({
    timingCategory: 'GET ' + url,
    timingVar: 'load',
    timingValue: Math.round(res.loadTime)
  });
  return res;
}

export async function post(url, data) {
  let res = await postURL(url, data);
  Vue.$ga.time({
    timingCategory: 'POST ' + url,
    timingVar: 'load',
    timingValue: Math.round(res.loadTime)
  });
  return res;
}