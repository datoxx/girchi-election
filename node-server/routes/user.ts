import dotenv from 'dotenv';
import axios from 'axios';
import express from 'express';
dotenv.config();


const router = express.Router();

const axiosInstance = axios.create({ baseURL: process.env.DRUPAL_DOMAIN });
axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

router.post("/api", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const refresh_token = req.body.refresh_token;
  
    const form = new URLSearchParams();
    form.append('client_id', <string>process.env.CLIENT_ID);
    form.append('client_secret',<string>process.env.SECRET_KEY);
    
    if(username && password) {
        form.append('grant_type', 'password');
        form.append('username', username);
        form.append('password', password);
        axiosInstance.post('/oauth/token', form)
            .then(response => {
                res.json(response.data);
            })
            .catch(_error => {
                res.json({"error": 'error retrieving token'});
            })
    }
  
    if(refresh_token) {
        form.append('grant_type', 'refresh_token');
        form.append('refresh_token', refresh_token);
        axiosInstance.post('/oauth/token', form)
            .then(response => {
                res.json(response.data);
            })
            .catch(_error => {
                res.json({"error": 'error refreshing token'});
            })
    }
  })


  export default router;