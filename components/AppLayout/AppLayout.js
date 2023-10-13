import { useUser } from "@auth0/nextjs-auth0/client";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import {Logo} from "../Logo";
import { useContext, useEffect } from "react";
import PostsContext from "../../context/postsContext";

export const AppLayout = ({ 
    children, availableTokens,
    posts: postsFromSSR, postid, postCreated
    }) => {

    const {user, error, isLoading} = useUser();

    const {setPostsFromSSR, posts, getPosts, noMorePosts} = useContext(PostsContext);

    console.log('POST DEL CTX', posts)

    useEffect(() => {
        setPostsFromSSR(postsFromSSR);
        if(postid){

            const exists = postsFromSSR.find((post) => post._id === postid);

            if(!exists){
                getPosts({getNewerPosts: true, lastPostDate: postCreated})
            }
        }
    }, [postsFromSSR, setPostsFromSSR, postid, postCreated, getPosts]);


  return (
    <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
        <div className="flex flex-col text-white overflow-hidden">

            <div className="bg-slate-800 px-2">
                <Logo/>
                <Link className="btn"
                        href="/post/new">
                    New Post    
                </Link> 
                <Link href="/token-topup" className="block mt-2 text-center">
                   <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
                    <span className="pl-1"> {availableTokens} tokens avaible</span>
                </Link> 
            </div>

            <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
                {
                    Array.isArray(posts) && posts.map((post, index) =>
                        (
                            <Link
                                key={index}
                                href={`/post/${post.id ? post.id : post._id}`}
                                className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap
                                my-1 px-2 bg-white/10 cursor-pointer rounded-sm
                                hover:bg-white/20 ${postid === post.id ? 'bg-white/20 border-white ' : ''}`}
                            >
                                
                                {post.topic}

                            </Link>
                        )
                    )
                }

                {
                    !noMorePosts && (
                    <div onClick={()=>{
                        getPosts({lastPostDate: posts[posts.length - 1].createdAt})
                        }}
                        className="hover:underline text-sm mt-4 text-slate-400 text-center cursor-pointer"
                    >
                        Cargar anteriores
                    </div>

                    )
                }

            </div>

            <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
                {
                    user ?
                    (<>
                        <div className="min-w-[50px]">
                            <Image
                                src={user.picture}
                                alt={user.name}
                                width={50}
                                height={50}
                                className="rounded-full"
                            />
                            
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">{user.email}</div>
                            <Link className="text-sm" href='/api/auth/logout'> Logout </Link>
                        </div>
                    </>)
                    :
                    <div>
                        No user
                        <Link href='/api/auth/login'> Login </Link>
                    </div>       

                }
            </div>
        
        </div>
        {children}

    </div>
  );
}