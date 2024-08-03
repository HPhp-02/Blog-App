const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('',async (req,res)=>{
  try{
   const locals ={title:"Node Js Blog",
    description:"Simple Blog Website"
   }
   let perPage =20;
   let page = req.query.page || 1;
   
   const data = await Post.aggregate([ { $sort: {createdAt: -1 } } ])
   .skip(perPage*page-perPage)
   .limit(perPage)
   .exec();

   const count = await Post.countDocuments();
   const nextPage = parseInt(page)+1;
   const hasNextPage = nextPage <= Math.ceil(count / perPage);



   
    res.render('index',{
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        currentRoute:'/'
    });


   }catch(error){
    console.log(error);
   }
}); 
router.get('/post/:id',async (req,res)=>{

    try{
        let slug = req.params.id;

        const data = await Post.findById({_id: slug});

        const locals ={title:data.title,
        description:"Simple Blog Website"
         }
    

     res.render('post',{locals,data, currentRoute:'/post/${slug}'});
    }catch(error){
     console.log(error);
    }
 }); 

 router.post('/search',async (req,res)=>{

    try{
        const locals ={title:"Search",
        description:"Simple Blog Website"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"")
        
        const data = await Post.find({
        $or: [
            {title:{$regex: new RegExp(searchNoSpecialChar,'i')}},
            {body:{$regex: new RegExp(searchNoSpecialChar,'i')}}  
        ]
        });
    
        res.render("search",{
            data,locals
        });

    }catch(error){
     console.log(error);
    }
 }); 








// function insertPostData () {
//     Post.insertMany([
//         {
//          title:"Building Blog",
//          body:"This is the body text"
//         },
//         {
//             title:"Building Blog",
//             body:"This is the body text"
//         },
//         {
//             title:"Building Blog",
//             body:"This is the body text"
//         },
//         {
//             title:"Building Blog",
//             body:"This is the body text"
//         },
//         {
//             title:"Building Blog",
//             body:"This is the body text"
//         },
//     ])
// };
// insertPostData(); 


router.get('/about',(req,res)=>{
    res.render('about',{
        currentRoute:'/about'
    });
})
router.get('/admin',(req,res)=>{
    res.render('admin',{
        currentRoute:'/about'
    });
})
module.exports = router;