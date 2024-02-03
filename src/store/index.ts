import { createStore } from 'vuex'

// Create a new store instance.
const store = createStore({
  state () {
    return {
      jwt: ''
    }
  },
  mutations: {
    setJwt (state, jwtLogin: string) {
      state.jwt = jwtLogin;
    }
  },
  actions: {
    login (context, jwt: string) {
      context.commit('setJwt', jwt)
    }
  },
})

export default store;