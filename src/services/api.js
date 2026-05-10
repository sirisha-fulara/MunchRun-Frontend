import axios from 'axios'

const BASE_URL= "https://munchrun-backend.onrender.com"

const api= axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type': 'application/json'}
})

//automatically atach token to every request
api.interceptors.request.use(config =>{
    const token= localStorage.getItem('access_token')
    if(token){
        config.headers.Authorization= `Bearer ${token}`
    }
    return config
})

//handle token expirey
api.interceptors.response.use((response)=>response,
async(error)=>{
    if(error.response?.status ===401){
        localStorage.clear()
        window.location.href= '/login'
    }
    return Promise.reject(error)
})

export default api