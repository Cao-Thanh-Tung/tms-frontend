<script lang="ts" setup>
import { ref } from "vue";
import store from "@/store";
import {
  UserOutlined,
  ControlOutlined,
  CarOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons-vue";
const selectedKeys2 = ref<string[]>(["1"]);
const openKeys = ref<string[]>(["sub1"]);
function logout() {
  store.dispatch("logout");
}
</script>
<template>
  <a-layout>
    <a-layout>
        <a-layout>
            <a-layout-sider width="200" style="background: #fff">
                <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys" mode="inline"
                    :style="{ height: '100%', borderRight: 0 }">
                    <a-sub-menu key="sub1">
                        <template #title>
                            <span>
            <template #title>
              <span>
                <a-avatar size="small" shape="square">
                  <template #icon>
                    <user-outlined />
                  </template>
                </a-avatar>
                Tài khoản
              </span>
            </template>
            <a-menu-item key="1"
              ><router-link :to="{ name: 'user-info' }"
                >Thông tin cá nhân</router-link
              ></a-menu-item
            >
            <a-menu-item key="2"
              ><router-link :to="{ name: 'change-password' }"
                >Đổi mật khẩu</router-link
              ></a-menu-item
            >
            <a-menu-item
              key="3"
              @click="logout"
              style="background-color: orange; color: #fff"
              >Đăng xuất</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub2">
            <template #title>
              <span>
                <user-outlined />
                Nhân viên
              </span>
            </template>
            <a-menu-item key="21"
              ><router-link :to="{ name: 'employee-list' }"
                >Danh sách nhân viên</router-link
              ></a-menu-item
            >
            <a-menu-item key="22"
              ><router-link :to="{ name: 'employee-driver' }"
                >Tài xế</router-link
              ></a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub3">
            <template #title>
              <span>
                <car-outlined />
                Quản lý xe
              </span>
            </template>
            <a-menu-item key="31"
              ><router-link :to="{ name: 'vehicle-list' }"
                >Danh sách xe</router-link
              ></a-menu-item
            >
            <a-menu-item key="32"
              ><router-link :to="{ name: 'vehicle-status' }"
                >Trạng thái xe</router-link
              ></a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub6">
            <template #title>
              <span>
                <user-outlined />
                Khách hàng
              </span>
            </template>
            <a-menu-item key="61"
              ><router-link :to="{ name: 'client-list' }"
                >Khách hàng</router-link
              ></a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub4">
            <template #title>
              <span>
                <reconciliation-outlined />
                Đơn vận chuyển
              </span>
            </template>
            <a-menu-item key="41"
              ><router-link :to="{ name: 'order-list' }"
                >Danh sách đơn</router-link
              ></a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub5">
            <template #title>
              <span>
                <control-outlined />
                Phân tuyến
              </span>
            </template>
            <a-menu-item key="51"
              ><router-link :to="{ name: 'auto-routing' }"
                >Phân tuyến</router-link
              ></a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub7">
            <template #title>
              <span>
                <user-outlined />
                Bản đồ
              </span>
            </template>
            <a-menu-item key="71"
              ><router-link :to="{ name: 'map' }"
                >Bản đồ</router-link
              ></a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="sub8">
            <template #title>
              <span>
                <user-outlined />
                Quản lý điểm
              </span>
            </template>
            <a-menu-item key="81"
              ><router-link :to="{ name: 'district-list' }"
                >Danh sách Tỉnh/Huyện/X</router-link
              ></a-menu-item
            >
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <slot></slot>
      </a-layout>
>>>>>>> origin/dev
    </a-layout>
  </a-layout>
</template>
<style scoped>
#components-layout-demo-top-side-2 .logo {
  float: left;
  width: 120px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
</style>
