const express = require('express');
const Router = express.Router();

const {signup, login, getAllUsers, getUserDetails, updateUser, deleteUser} = require('../Controllers/UserController')


//user routes
Router.post('/signup', signup);
Router.post('/login', login);
Router.get('/getallusers', getAllUsers);
Router.get('/getuser/:id', getUserDetails);
Router.put('/updateuser/:id', updateUser);
Router.delete('/deleteuser/:id', deleteUser);


//Soil routes
Router.post('/soil/add')
Router.get('/soil/get')
Router.get('/soil/get/:id')
Router.delete('/soil/delete/:id')
Router.put('/soil/update/:id')

//chatHistory routes
Router.post('/chat/add')
Router.get('/chat/get/:id')
Router.delete('/chat/delete/:id')


//pest routes
Router.post('/pest/add')
Router.get('/pest/get')
Router.delete('/pest/delete/:id')


//Feedback routes
Router.post('/feedback/add')
Router.get('/feedback/get')
Router.delete('/feedback/delete/:id')

module.exports = Router;