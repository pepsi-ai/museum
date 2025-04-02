import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/components/login";
import Home from "@/components/home";
import User from "@/components/user/user";
import Collection from "@/components/collection";
import Addcol from "@/components/addcol";
import Announcement from "@/components/announcement";
import Addannouncement from "@/components/addannouncement";
import Analysis from "@/components/analysis";
import Annoudetails from "@/components/annoudetails";
import NotFound from "@/components/NotFound";
import Index from "@/components/Index";
import UserReservation from "@/components/reservation/UserReservation";
import addReservation from "@/components/reservation/addReservation";
import ReservationList from "@/components/reservation/ReservationList";
import ViewReservationDetail from "@/components/reservation/viewReservationDetail";
import EditReservation from "@/components/reservation/EditReservation";
import Comments from "@/components/publish/Comments";
import DicManager from "@/components/dic/DicManager";
import MakeVisual from "@/components/reservation/MakeVisual";
import Exhibition from "@/components/exhibition";

Vue.use(VueRouter)

const routes = [
    {path: '*', name: 'NotFound', component: NotFound},
    {path: '/', redirect: '/index'},
    {path: '/login', component: Login},
    {
        path: '/home', component: Home, redirect: '/index', children: [
            {path: '/user', component: User},
            {path: '/index', component: Index},
            {path: '/collection', component: Collection},
            {path: '/collection/add', component: Addcol},
            {path: '/announcement', component: Announcement},
            {path: '/announcement/add', component: Addannouncement},
            {path: '/data-analysis', component: Analysis},
            {path: '/announcement/details', component: Annoudetails},
            {path: '/UserReservation', component: UserReservation},
            {path: '/addReservation', component: addReservation},
            {path: '/ReservationList', component: ReservationList},
            {path: '/Comments', component: Comments},
            {path: '/dicManager', component: DicManager},
            {path: '/MakeVisual', component: MakeVisual},
            {path: '/exhibition', component: Exhibition},
            {path: '/viewReservationDetail/:id', component: ViewReservationDetail},
            {path: '/editReservation/:id', component: EditReservation}
        ]
    },
]

const router = new VueRouter({
    base: '/',
    mode: "hash",
    routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router
