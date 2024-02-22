import { createStore } from 'vuex'
import axios from 'axios';
// Create a new store instance.
const store = createStore({
  state () {
    return {
      jwt: ''
    }
  },
  mutations: {
    setJwt (state, jwtToken: string) {
      state.jwt = jwtToken;
      axios.defaults.headers.common['Authorization'] = "Bearer " + jwtToken;
    }
  },
  actions: {
    login (context, jwt: string) {
      localStorage.setItem('jwt', jwt);
      context.commit('setJwt', jwt)
    },
    logout (context){
      localStorage.removeItem('jwt');
      context.commit('setJwt', "");
    },
    checkCacheLogin(context){
      let jwt = localStorage.getItem('jwt');
      if(jwt){
        context.commit('setJwt', jwt);
      }
    }
  },
})

export default store;