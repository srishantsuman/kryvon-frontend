import axios from "axios";
const apiClient = axios.create({baseURL:"http://localhost:8000/api/v1",withCredentials:false,headers:{"Content-Type":"application/json"}});
apiClient.interceptors.request.use((config)=>{const token=localStorage.getItem("access_token");if(token&&config.headers){config.headers.Authorization="Bearer "+token;}return config;});
apiClient.interceptors.response.use((r)=>r,async(e)=>{if(e.response?.status===401){localStorage.removeItem("access_token");window.location.href="/";}return Promise.reject(e);});
export default apiClient;
