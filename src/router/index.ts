import { createRouter, createWebHistory } from "vue-router";
// import About from "../page/About.vue";
import employeeDriver from "@/pages/employee/employeeDriver.vue";
import employeeList from "@/pages/employee/employeeList.vue";
import employeeDriverForEmployee from "@/pages/employee/employeeDriverForEmployee.vue";
import vehicleList from "@/pages/vehicle/vehicleList.vue";
import vehicleListForEmployee from "@/pages/vehicle/vehicleListForEmployee.vue";
import vehicleStatus from "@/pages/vehicle/vehicleStatus.vue";
import vehicleStatusForEmployee from "@/pages/vehicle/vehicleStatusForEmployee.vue";
import orderList from "@/pages/order/orderList.vue";
import autoRouting from "@/pages/routing/autoRouting.vue";
import routingReport from "@/pages/routing/routingReport.vue";
import userInfo from "@/pages/user/userInfo.vue";
import changePassword from "@/pages/user/changePassword.vue";
import clientList from "@/pages/client/clientList.vue";
import clientListForEmployee from "@/pages/client/clientListForEmployee.vue";
import contractorList from "@/pages/contractor/contractorList.vue";
import solution from "@/pages/solution/solution.vue";
import solutionList from "@/pages/solution/solutionList.vue";
const routes = [
    //common router
    {name:"user-info", path:'/account/info', component: userInfo},
    {name:"change-password", path:"/account/change-password", component: changePassword},
    {name:"orders",path: '/orders', component:  orderList},
    {path: '/', component:  orderList},

    //admin router
    {name:"admin-employees",path: '/admin/employees', component:  employeeList},
    {name:"admin-driver",path: '/admin/drivers', component:  employeeDriver},
    {name:"admin-vehicle-status",path: '/admin/vehicle-status', component:  vehicleStatus},
    {name:"admin-vehicles",path: '/admin/vehicle-list', component:  vehicleList},
    {name:"admin-clients", path: "/admin/clients", component: clientList},
    {name:"admin-contractors", path: "/admin/contractors", component: contractorList},
    {name:"routing-report",path: '/admin/routing-report', component:  routingReport},
    
    //employee router
    {name:"drivers",path: '/employee/drivers', component:  employeeDriverForEmployee},
    {name:"vehicles",path: '/employee/vehicles', component:  vehicleListForEmployee},
    {name: "vehicle-status", path: '/employee/vehicle-status', component: vehicleStatusForEmployee},
    {name:"clients", path: '/employee/clients', component: clientListForEmployee},
    {name:"auto-routing",path: '/employee/routing', component:  autoRouting},
    {name:"solution",path: '/employee/solution', component:  solutionList},
    {name:"solution-detail",path: '/employee/solution/:id', component:  solution},
    //driver router

    //customer router
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})
 
export default router