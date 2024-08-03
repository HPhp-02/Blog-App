const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const adminLayout = '../views/layouts/admin';
const jwtSecret =process.env.JWT_SECRET;

const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:'Unauthorized'})
    }


    try{
        const decoded = jwt.verify(token,jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({message:'Unauthorized'});
    }
}





router.get('/admin',async ( req ,res)=>{
    try{

    const locals={
        title:"Admin",
        description:"Simple Blog created with NodeJs , Express & mongodb"
    }
    res.render('admin/index',{locals , val , layout: adminLayout});
    }catch(error){
        console.log(error);
    }
});


router.post('/admin', async (req,res)=>{
    try{
        const val={
        mark:'true'
        }
    const {username,password} = req.body;
    
    const user = await User.findOne({username});
    if(!user){
        return res.status(401).json({message: 'Invalid Credentials'})
    }
     
    const isPasswordValid = await bcrypt.compare(password,user.password);
    
    if(!isPasswordValid){
        return res.status(401).json({message: 'Invalid Credentials'})
    }
    
    const token = jwt.sign({userId: user._id},jwtSecret)
    res.cookie('token',token,{httpOnly: true});

    res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
});


// router.post('/admin',)
// router.post('/admin', async (req,res)=>{
//     try{
    
//     const {username,password} = req.body;

//     if(req.body.username === 'admin' && req.body.password === 'password'){
//         res.send("You are logged in.")
//     }else{
//         res.send('Worng username or password')
//     }
//     }catch(error){
//         console.log(error);
//     }
// });

router.post('/register', async (req,res)=>{
    try{
    
    const {username,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    try{
        const user = await User.create({username,password:hashedPassword});
        res.status(201).json({message: 'User Created', users})
    }catch(error){
        if(error.code===11000){
            res.status(409).json({message:'User already in use'});
        }
        res.status(500).json({message: 'Internal Server error'})
    }
    }catch(error){
        console.log(error);
    }
});


router.get('/dashboard', authMiddleware , async(req,res)=>{

   try{
    const locals = {
        title:'Dashboard',
        description:'Simple Blog creaed wih NodeJs , Express & MongoDb.'
    }
    const data = await Post.find();
    res.render('admin/dashboard',{
        locals,
        data,
        layout: adminLayout
    });
   }catch(error){
   console.log(error);
   }

});


router.get('/add-post', authMiddleware , async(req,res)=>{

    try{
     const locals = {
         title:'Add Post',
         description:'Simple Blog creaed wih NodeJs , Express & MongoDb.'
     }
     const data = await Post.find();
     res.render('admin/add-post',{
         locals,
         data,
         layout: adminLayout
     });
    }catch(error){
    console.log(error);
    }
 
 });


 router.post('/add-post', authMiddleware , async(req,res)=>{

    try{
     console.log(req.body);
     
     try{
       const newPost = new Post({
        title:req.body.title,
        body: req.body.body
       });

       await Post.create(newPost);
       res.redirect('/dashboard')
     }catch(error){
      console.log(error);
     }

     res.redirect('/dashboard');

     
     
    }catch(error){
    console.log(error);
    }
 
 });


 router.get('/edit-post/:id', authMiddleware , async(req,res)=>{

    try{
        const locals = {
            title:'Add Post',
            description:'Simple Blog creaed wih NodeJs , Express & MongoDb.'
        }
        const data = await Post.findOne({_id: req.params.id})

        res.render('admin/edit-post',{
            data,
            locals,
            layout:adminLayout
        })
     
    }catch(error){
    console.log(error);
    }
 
 });


 router.get('/register', async(req,res)=>{
    const val={
        mark:'true'
    }

    try{
        res.render('admin/register',{
            val,
            layout:adminLayout
        })
     
    }catch(error){
    console.log(error);
    }
 
 });
 router.put('/edit-post/:id', authMiddleware , async(req,res)=>{

    try{
      
        await Post.findByIdAndUpdate(req.params.id,{
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`)
     
    }catch(error){
    console.log(error);
    }
 
 });


 router.delete('/delete-post/:id', authMiddleware , async(req,res)=>{
   try{
    await Post.deleteOne({_id: req.params.id});
    res.redirect('/dashboard');
   }catch(error){
    console.log(error);
   }
   
 });


 router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/')
 })
module.exports = router;