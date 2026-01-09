import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const token = ref(localStorage.getItem('token'))
    const isAuthenticated = ref(!!token.value)

    // Initialize Axios Header if token exists
    if (token.value) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }

    // Axios Interceptor for 401s
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                logout()
            }
            return Promise.reject(error)
        }
    )

    // Verify Session on Load
    const fetchUser = async () => {
        if (!token.value) return;
        try {
            const response = await axios.get('http://localhost:3001/api/auth/me');
            if (response.data) {
                // Merge existing user structure with new data to preserve other fields if any
                const updatedUser = { ...user.value, ...response.data };
                // Ensure subscription_tier is present
                if (!updatedUser.subscription_tier) updatedUser.subscription_tier = 'free'; // Fallback

                user.value = updatedUser;
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
            }
        } catch (error) {
            console.error('Failed to refresh user session:', error);
            // Optionally logout if invalid? No, 401 interceptor handles that.
        }
    }

    // Call on init
    if (token.value) {
        fetchUser();
    }

    const login = async (credentials: any) => {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', credentials)
            setSession(response.data)
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const register = async (userData: any) => {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', userData)
            if (response.data.token) {
                setSession(response.data)
            }
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        }
    }

    const googleLogin = async (credential: string) => {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/google', { credential })
            setSession(response.data)
        } catch (error) {
            console.error('Google login failed:', error)
            throw error
        }
    }

    const logout = () => {
        user.value = null
        token.value = null
        isAuthenticated.value = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        // Optional: Redirect to login if using router here
        // router.push('/login') 
        // But store usually shouldn't depend on router directly unless injected. 
        // Window location reload is a brutal but effective way to clear state if needed
        if (window.location.pathname.startsWith('/app')) {
            window.location.href = '/'
        }
    }

    const setSession = (data: any) => {
        token.value = data.token
        user.value = data.user
        isAuthenticated.value = true
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout
    }
})
