import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token'))
    const isAuthenticated = ref(!!token.value)

    const login = async (credentials: any) => {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', credentials)
            token.value = response.data.token
            user.value = response.data.user
            isAuthenticated.value = true
            localStorage.setItem('token', response.data.token)
            // Set default auth header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const register = async (userData: any) => {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', userData)
            // Automatically log in after register if the API returns a token
            if (response.data.token) {
                token.value = response.data.token
                user.value = response.data.user
                isAuthenticated.value = true
                localStorage.setItem('token', response.data.token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
            }
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        }
    }

    const logout = () => {
        user.value = null
        token.value = null
        isAuthenticated.value = false
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout
    }
})
