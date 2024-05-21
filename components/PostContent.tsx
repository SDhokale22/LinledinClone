import { IPostDocument } from '@/model/post.model'
import Image from 'next/image'
import React from 'react'

const PostContent = ({post}: {post:IPostDocument}) => {
  return (
    <div className='my-3'>
      <p className='px-4 my-3'>{post?.description}</p>
      {
        post?.imageUrl && (
          <Image 
          src={post?.imageUrl}
          width={400}
          height={400}
          alt='post-image'
          className='w-full mx-auto'
          />
        )
      }
    </div>
  )
}

export default PostContent