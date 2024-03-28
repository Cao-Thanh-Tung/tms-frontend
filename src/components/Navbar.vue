<script lang="ts" setup>
import { ref } from "vue";
import store from "@/store";
import {
  UserOutlined,
  ControlOutlined,
  CarOutlined,
  ReconciliationOutlined,
  TeamOutlined,
  ContactsOutlined
} from "@ant-design/icons-vue";
const props = defineProps({
  avatar: String,
  name: String,
  role: String,
});
const selectedKeys2 = ref<string[]>(["42"]);
const openKeys = ref<string[]>(["sub4"]);
function logout() {
  store.dispatch("logout");
}
</script>
<template>
  <a-layout>
    <a-layout>
      <a-layout-sider width="240" style="background: #fff; min-height: 100vh">
        <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys" mode="inline"
          :style="{ height: '100%', borderRight: 0 }">
          <a-sub-menu key="sub1">
            <template #title>
              <span>
                <a-avatar :src="props.avatar" size="small" shape="circle">
                  <template #icon>
                    <user-outlined />
                  </template>
                </a-avatar>
                {{ name }}
              </span>
            </template>
            <a-menu-item key="1"><router-link :to="{ name: 'user-info' }">Thông tin cá nhân</router-link></a-menu-item>
            <a-menu-item key="2"><router-link :to="{ name: 'change-password' }">Đổi mật khẩu</router-link></a-menu-item>
            <a-menu-item key="3" @click="logout" style="">Đăng xuất</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub2" v-if="props.role == 'admin'">
            <template #title>
              <span>
                <user-outlined />
                Nhân viên
              </span>
            </template>
            <a-menu-item key="21" v-if="props.role == 'admin'"><router-link :to="{ name: 'admin-employees' }">Nhân
                viên điều phối</router-link></a-menu-item>
            <a-menu-item key="22" v-if="props.role == 'admin'"><router-link :to="{ name: 'admin-driver' }">Tài
                xế</router-link></a-menu-item>

          </a-sub-menu>
          <a-sub-menu key="sub3">
            <template #title>
              <span>
                <car-outlined />
                Quản lý xe
              </span>
            </template>
            <a-menu-item key="31" v-if="props.role == 'admin'"><router-link :to="{ name: 'admin-vehicles' }">Danh sách
                xe</router-link></a-menu-item>
            <a-menu-item key="32" v-if="props.role == 'employee'"><router-link :to="{ name: 'vehicles' }">Danh sách
                xe</router-link></a-menu-item>
            <a-menu-item key="33" v-if="props.role == 'admin'"><router-link :to="{ name: 'admin-vehicle-status' }">Trạng
                thái
                xe</router-link></a-menu-item>
            <a-menu-item key="34" v-if="props.role == 'employee'"><router-link :to="{ name: 'vehicle-status' }">Trạng
                thái
                xe</router-link></a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub6">
            <template #title>
              <span>
                <team-outlined />
                Khách hàng
              </span>
            </template>
            <a-menu-item key="61" v-if="props.role == 'admin'"><router-link :to="{ name: 'admin-clients' }">Khách
                hàng</router-link></a-menu-item>
            <a-menu-item key="62" v-if="props.role == 'employee'"><router-link :to="{ name: 'clients' }">Khách
                hàng</router-link></a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub9" v-if="props.role == 'admin'">
            <template #title>
              <span>
                <contacts-outlined />
                Nhà Thầu
              </span>
            </template>
            <a-menu-item key="91"><router-link :to="{ name: 'admin-contractors' }">Danh sách nhà
                thầu</router-link></a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub4">
            <template #title>
              <span>
                <reconciliation-outlined />
                Đơn vận chuyển
              </span>
            </template>
            <a-menu-item key="42" v-if="props.role == 'employee' || props.role == 'admin'"><router-link
                :to="{ name: 'orders' }">Danh
                sách
                đơn</router-link></a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub5">
            <template #title>
              <span>
                <control-outlined />
                Phân tuyến
              </span>
            </template>
            <a-menu-item key="51" v-if="props.role == 'admin'"><router-link :to="{ name: 'routing-report' }">Báo cáo
                phân
                tuyến</router-link></a-menu-item>
            <a-menu-item key="52" v-if="props.role == 'employee'"><router-link :to="{ name: 'auto-routing' }">
                Phân
                tuyến</router-link></a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <slot></slot>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<style scoped>
#components-layout-demo-top-side-2 .logo {
  float: left;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: white;
}
</style>
