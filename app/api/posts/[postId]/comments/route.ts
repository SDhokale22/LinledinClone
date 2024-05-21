import connectDB from "@/lib/db";
import { Post } from "@/model/post.model";
import { NextRequest, NextResponse } from "next/server";

//fetch all commentss
export const GET = async(req:NextRequest, {params}:{params:{postId:string}}) => {
    try{
        await connectDB();
        const post = await Post.findById({_id:params.postId});
        if(!post) return NextResponse.json({error:"Post not Found"});
        const comments = await post.populate({
            path:"comments", 
            options:{sort:{createdAt:-1}},
        });
        return NextResponse.json(post.comments);
    }catch(error:any){
        return NextResponse.json({error:"An error occured"});
    }
}