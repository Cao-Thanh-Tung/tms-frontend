import { createStore } from 'vuex'
import { Configuration } from '@/configuration';
import { UserXDTO, UserXResourceApi } from '@/api';
import { KJUR } from "jsrsasign";

const initialState = ():{
  jwt: String | null,
  user: UserXDTO | null,
  isLogin: Boolean,
} => {
  const jwt = localStorage.getItem('jwt') || null;
  let payloadObj = null;
  console.log("jwt: "+ jwt);
  if (jwt) {
    const decodedToken = KJUR.jws.JWS.parse(jwt);
    if (decodedToken.payloadObj) {
      payloadObj = decodedToken.payloadObj as { exp: number, sub: string };

      
      const now = Math.floor(Date.now() / 1000);
      if (now > payloadObj.exp) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        return {
          jwt: null,
          user: null,
          isLogin: false,
        }
      }else{
        console.log(JSON.parse(localStorage.getItem('user')!));
        return {
          jwt,
          user: JSON.parse(localStorage.getItem('user')!),
          isLogin: true,
        }
      }
    } else {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      return {
        jwt: null,
        user: null,
        isLogin: false,
      }
    }
  }else{
    return {
      jwt: null,
      user: null,
      isLogin: false,
    }
  }
}

const SET_JWT = 'SET_JWT';
const SET_USER = 'SET_USER';
const SET_IS_LOGIN = 'SET_IS_LOGIN';
const store = createStore({
  state: initialState(),
  mutations: {
    [SET_JWT](state, jwt) {
      state.jwt = jwt;
      console.log(jwt);
      
      if (jwt === null) {
        localStorage.removeItem('jwt');
      }else{
        localStorage.setItem('jwt', jwt);
      }
    },
    [SET_USER](state, user) {
      state.user = user;
      if(user === null){
        localStorage.removeItem('user');
      }else{
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    [SET_IS_LOGIN](state, isLogin) {
      state.isLogin = isLogin;
    }
  },
  actions: {
    async login({ commit }, jwt) {
      commit(SET_JWT, jwt)
      let payloadObj = null;
        const decodedToken = KJUR.jws.JWS.parse(jwt);
        if (decodedToken.payloadObj) {
          payloadObj = decodedToken.payloadObj as { exp: number, sub: string };
        } 
      const userxApi = new UserXResourceApi(new Configuration({
            accessToken: () => jwt,
            baseOptions: {
              headers: { 'Content-Type': 'application/json' }
            }
          }));
      const userx = (await userxApi.getUserXByLogin(payloadObj?.sub!)).data;
      commit(SET_USER, userx);
      commit(SET_IS_LOGIN, true);      
    },
    logout({ commit }) {
      localStorage.removeItem('jwt');
      commit(SET_JWT, null);
      commit(SET_USER, null);
      commit(SET_IS_LOGIN, false);
    }
  },
  getters: {
    jwt: state => state.jwt,
    user: state => state.user,
    isLogin: state => state.isLogin,
  }
})

export default store;