import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

import vue3GoogleLogin from 'vue3-google-login'
app.use(vue3GoogleLogin, {
    clientId: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'
})

app.mount('#app')
