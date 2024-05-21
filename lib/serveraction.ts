"use server"
import { Post } from "@/model/post.model";
import { IUser } from "@/model/user.model";
import { currentUser } from "@clerk/nextjs/server"
import {v2 as cloudinary} from 'cloudinary';
import connectDB from "./db";
import { revalidatePath } from "next/cache";
import { Comment } from "@/model/comment.model";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

export const createPostAction = async (inputText:string, selectedFile:string) => {
    await connectDB();
    const user = await currentUser();
    if(!user) throw new Error("User not authenticated");
    if(!inputText) throw new Error("Input field  is required");

    const image = selectedFile;
    const userDatabase : IUser = {
        firstName:user.firstName || "sona",
        lastName:user.lastName || "developer",
        userId:user.id,
        profilePhoto:user.imageUrl 
    }  

    let uploadResponse;

    try{
        if(image){
            uploadResponse = await cloudinary.uploader.upload(image);
            await Post.create({
                description:inputText,
                user:userDatabase,
                imageUrl:uploadResponse?.secure_url
            })
        }else{
            await Post.create({
                description:inputText,
                user:userDatabase,
            })
        }
        revalidatePath("/");
    }catch(error:any){
        throw new Error(error);
    }
}

//get all post
export const getAllPosts = async () => {
    try{
        await connectDB();
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: 'comments', options: { sort: { createdAt: -1 } } });
        if(!posts) return [];
        return JSON.parse(JSON.stringify(posts));

    }catch(error){
        console.log(error);
    }
}

//delete post
export const deletePostAction = async (postId: string) => {
    await connectDB();
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated.');
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found.');

    // only delete our post
    if (post.user.userId !== user.id) {
        throw new Error('You are not an owner of this Post.');
    }
    try {
        await Post.deleteOne({ _id: postId });
        revalidatePath("/");
    } catch (error: any) {
        throw new Error('An error occurred', error);
    }
}

//comment
export const createCommentAction = async (postId:string , formData:FormData) => {
    try{
        await connectDB();
        const user = await currentUser();
        if(!user) throw new Error("User not authenticated");
        const inputText = formData.get('inputText') as string;
        if(!inputText) throw new Error("Field is required");
        if(!postId) throw new Error("Post is required");

        const userDatabase : IUser = {
            firstName:user.firstName || "sona",
            lastName:user.lastName || "developer",
            userId:user.id,
            profilePhoto:user.imageUrl 
        } 

        const post = await Post.findById({_id:postId});
        if(!post) throw new Error("Post not found");

        const comment = await Comment.create({
            textMessage:inputText,
            user:userDatabase,
        });

        post.comments?.push(comment._id);
        await post.save();

        revalidatePath("/");

    }catch(error:any){
        throw new Error("An error occured", error);
    }
}