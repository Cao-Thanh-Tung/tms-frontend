import { createStore } from 'vuex'

const initialState = () => {
  return {
    jwt: localStorage.getItem('jwt') || ''
  }
}

const SET_JWT = 'SET_JWT';

const store = createStore({
  state: initialState(),
  mutations: {
    [SET_JWT](state, jwt) {
      state.jwt = jwt;
      localStorage.setItem('jwt', jwt);
    }
  },
  actions: {
    login({ commit }, jwt) {
      commit(SET_JWT, jwt)
    },
    logout({ commit }) {
      localStorage.removeItem('jwt');
      commit(SET_JWT, "")
    }
  },
  getters: {
    jwt: state => state.jwt
  }
})

export default store;