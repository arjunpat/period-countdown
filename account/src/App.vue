<template>
  <div>
    <div style="padding: 20px; font-size: 40px;" v-if="!show">{{ msg }}</div>
    <div id="nav-links" v-if="show">
      <div>
        <!-- <router-link to="/profile">Profile</router-link> -->
        <router-link to="/logout">Logout</router-link>
      </div>
      <img id="profile-pic" v-show="profile_pic" :src="profile_pic">
    </div>
    <transition name="page-change">
      <router-view v-if="show" />
    </transition>
  </div>
</template>

<script type="text/javascript">
import { mapState } from 'vuex';
import { get, post } from '@/utils.js';
import { getClientInformation, generateGoogleSignInLink } from '../../common.js';

export default {
  data() {
    return {
      show: false,
      msg: ''
    }
  },
  async mounted() {
    let accessTokenLocation = window.location.href.indexOf('access_token=');
    if (accessTokenLocation > -1) {
      this.msg = 'Signing you in. Please wait...';
      let accessToken = window.location.href.substring(accessTokenLocation + 13);
      while (accessToken.includes('&')) {
        accessToken = accessToken.substring(0, accessToken.indexOf('&'));
      }

      let res = await post('/v4/init', getClientInformation());
      res = await post('/v4/login', {
        google_token: accessToken
      });

      if (!res.json.success) {
        // TODO server issue
      }
    }

    let res = await get('/v4/account');

    if (res.json.success) {
      this.$store.commit('setAccount', res.json.data);
      this.show = true;

      this.$router.push({ path: '/settings' });
    } else {
      window.location.href = generateGoogleSignInLink();
    }
  },
  computed: {
    ...mapState(['profile_pic'])
  }
}
</script>

<style scoped>
#nav-links {
  float: right;
  padding: 60px;
  display: flex;
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
  background: #eee;
}

#profile-pic {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  transition: .2s ease all;
}

@media only screen and (max-width: 400px) {
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
  border: 3px solid !important;
  border-width: 0 0 3px 0 !important;
  border-image-source: linear-gradient(120deg, #fccb0b 0%, #fc590bad 100%) !important;
  border-image-slice: 1 !important;
  font-weight: bold;
}
</style>
