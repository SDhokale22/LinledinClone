import React from 'react'
import Post from './Post'
import { IPostDocument } from '@/model/post.model'

const Posts = ({posts}:{posts:IPostDocument[]}) => {
  return (
    <div>
      {
        posts?.map((post) => {
          return (
            <Post key={post._id} post={post}/>
          )
        })
      }
     
    </div>
  )
}

export default Posts