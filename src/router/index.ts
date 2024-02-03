import { createRouter, createWebHistory } from "vue-router";
// import About from "../page/About.vue";
import employeeDriver from "@/pages/employee/employeeDriver.vue";
import employeeList from "@/pages/employee/employeeList.vue";
import vehicleList from "@/pages/vehicle/vehicleList.vue";
import vehicleStatus from "@/pages/vehicle/vehicleStatus.vue";
import orderList from "@/pages/order/orderList.vue";
import autoRouting from "@/pages/routing/autoRouting.vue";
const routes = [
    {name:"employee-list",path: '/employee/list', component:  employeeList},
    {name:"employee-driver",path: '/employee/driver', component:  employeeDriver},
    {name:"order-list",path: '/order/list', component:  orderList},
    {name:"vehicle-status",path: '/vehicle/status', component:  vehicleStatus},
    {name:"vehicle-list",path: '/vehicle/list', component:  vehicleList},
    {name:"auto-routing",path: '/routing/auto-routing', component:  autoRouting},
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})
 
export default router