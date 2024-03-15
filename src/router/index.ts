import { createRouter, createWebHistory } from "vue-router";
// import About from "../page/About.vue";
import employeeDriver from "@/pages/employee/employeeDriver.vue";
import employeeList from "@/pages/employee/employeeList.vue";
import employeeDriverForEmployee from "@/pages/employee/employeeDriverForEmployee.vue";
import vehicleList from "@/pages/vehicle/vehicleList.vue";
import vehicleListForEmployee from "@/pages/vehicle/vehicleListForEmployee.vue";
import vehicleStatus from "@/pages/vehicle/vehicleStatus.vue";
import orderList from "@/pages/order/orderList.vue";
import orderListForEmployee from "@/pages/order/orderListForEmployee.vue";
import autoRouting from "@/pages/routing/autoRouting.vue";
import routingReport from "@/pages/routing/routingReport.vue";
import userInfo from "@/pages/user/userInfo.vue";
import changePassword from "@/pages/user/changePassword.vue";
import clientList from "@/pages/client/clientList.vue";
import clientListForEmployee from "@/pages/client/clientListForEmployee.vue";
import contractorList from "@/pages/contractor/contractorList.vue";
import districtList from "@/pages/position/districtList.vue";
import map from "@/pages/map/map.vue";
const routes = [
    {name:"auto-routing",path: '/', component:  autoRouting},
    {name:"employee-list",path: '/employee/list', component:  employeeList},
    {name:"driver-for-employee",path: '/em/driver', component:  employeeDriverForEmployee},
    {name:"employee-driver",path: '/employee/driver', component:  employeeDriver},
    {name:"order-list",path: '/order/list', component:  orderList},
    {name:"order-for-employee",path: '/em/order', component:  orderListForEmployee},
    {name:"vehicle-status",path: '/vehicle/status', component:  vehicleStatus},
    {name:"vehicle-list",path: '/vehicle/list', component:  vehicleList},
    {name:"vehicle-for-employee",path: '/em/vehicle', component:  vehicleListForEmployee},
    {name:"user-info", path:'/user/info', component: userInfo},
    {name:"change-password", path:"/user/change-password", component: changePassword},
    {name:"client-list", path: "/client/list", component: clientList},
    {name:"client-for-employee", path: "/em/client", component: clientListForEmployee},
    {name:"contractor-list", path: "/contractor/list", component: contractorList},
    {name:"map", path: "/map", component: map},
    {name:"district-list", path: "/district/list", component: districtList},
    {name:"auto-routing",path: '/auto-routing', component:  autoRouting},
    {name:"routing-report",path: '/routing-report', component:  routingReport},
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})
 
export default router