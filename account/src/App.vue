<template>
  <div>
    <div style="padding: 20px; background: #eee;" v-show="showBanner">
      <div>
        <span style="float: right; display: block; cursor: pointer;" @click="closeBanner()">X</span>
      </div>
      <div>
        <span style="font-weight: bold; font-size: 20px;">It costs over $140 each year to run periods.io</span>—an amount that is only growing as our user base expands. This is not sustainable; we need your help! If you have found periods.io useful, consider donating. <span style="font-weight: bold;">Even $3 or $5 can support our servers for more than a week.</span> Donate via Venmo: <a href="https://www.venmo.com/u/periodcountdown">@periodcountdown</a>. $14 donated already (updated daily).
      </div>
    </div>
    <div id="nav-links">
      <div>
        <router-link to="/admin/analytics" v-if="admin">Analytics</router-link>
        <router-link to="/admin/chart" v-if="admin">Chart</router-link>
        <router-link to="/settings" v-if="admin">Settings</router-link>
        <a v-if="!admin" :href="isProd ? 'https://periods.io' : 'http://localhost:8080'">Back to periods.io</a>
        <router-link to="/logout">Logout</router-link>
      </div>
      <img id="profile-pic" v-show="profile_pic" :src="profile_pic">
    </div>
    <transition name="page-change">
      <router-view />
    </transition>
  </div>
</template>

<script type="text/javascript">
import { mapState } from 'vuex';
import { get, post } from '@/utils.js';
import { getClientInformation, generateGoogleSignInLink, isProd } from '../../common.js';

export default {
  data() {
    return {
      isProd,
      showBanner: true
    }
  },
  async mounted() {
    let accessTokenLocation = window.location.href.indexOf('access_token=');
    if (accessTokenLocation > -1) {
      this.msg = 'Signing you in. Please wait...';
      let accessToken = window.location.href.substring(accessTokenLocation + 13);
      window.history.replaceState(null, null, window.location.pathname);
      while (accessToken.includes('&')) {
        accessToken = accessToken.substring(0, accessToken.indexOf('&'));
      }

      await post('/v4/init', getClientInformation());
      let res = await post('/v4/login', {
        google_token: accessToken
      });

      if (!res.json.success) {
        // TODO server issue
      }
    }

    let res = await get('/v4/account');

    if (res.json.success) {
      setTimeout(() => { this.$store.commit('setAccount', res.json.data); }, 1500);
    } else {
      window.location.href = generateGoogleSignInLink();
    }
  },
  computed: {
    ...mapState(['profile_pic', 'admin'])
  },
  methods: {
    closeBanner() {
      this.showBanner = false;
      this.$ga.event({
        eventCategory: 'donatebanner.x',
        eventAction: 'click'
      });
    }
  }
}
</script>

<style scoped>
#nav-links {
  float: right;
  margin: 50px;
  padding: 10px 10px 10px 5px;
  display: flex;
  border-radius: 10px;
}

#nav-links > div {
  display: flex;
  align-items: center;
}

#nav-links > div > a {
  text-decoration: none;
  color: #333;
  display: inline-block;
  padding: 12px 16px;
  border-radius: 6px;
  border: none;
  font-size: 20px;
}

#nav-links > div > a:hover {
  text-decoration: underline;
  text-decoration-color: rgba(241, 116, 0, 1);
}

#profile-pic {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  transition: .2s ease all;
  border: 2px solid #f17600;
}

@media only screen and (max-width: 500px) {
  #nav-links {
    margin: 10px;
  }

  #profile-pic {
    display: none;
  }
}

.page-change-enter-active {
  transition: all 250ms ease;
}

.page-change-active {
  transition-delay: .25s;
}

.page-change-enter, .page-change-leave-to {
  opacity: 0;
  transform: scale(.97) /*translateY(20px)*/;
}
</style>

<style>
.router-link-active {
  text-decoration: underline !important;
  text-decoration-color: rgba(241, 116, 0, 1) !important;
  font-weight: bold;
}
</style>
