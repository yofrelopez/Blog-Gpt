import React, { useCallback, useReducer } from "react";

const PostsContext = React.createContext();

export default PostsContext;



function postReducer(state, action){

    switch(action.type){
        case 'addPost': {
            const newPosts = [...state];
            action.posts.forEach((post) => {
                const exists = newPosts.find((p) => p._id === post._id);
                if(!exists){
                    newPosts.push(post);
                }
            });
            return newPosts;
        }
        case 'deletePost': {
            const newPosts = [];
            state.forEach((post) => {
                if(post._id !== action.postId){
                    newPosts.push(post);
                }
            });
            return newPosts;
        }
        default:
            return state;
    }
}



export const PostsProvider = ({ children }) => {

    const [posts, dispatch] = useReducer(postReducer, []);
    const [noMorePosts, setNoMorePosts] = React.useState(false);


    const deletePost = useCallback(async (postId) => {
        dispatch({ type: 'deletePost', postId });
    }, []);




    const setPostsFromSSR = useCallback((postsFromSSR = []) => {
        dispatch({ type: 'addPost', posts: postsFromSSR });

    }, [] ) 




    const getPosts = useCallback(async ({lastPostDate, getNewerPosts = false}) => {
        const response = await fetch(`/api/getPosts`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ lastPostDate, getNewerPosts }),
        });

        const json = await response.json();
        const postsResult = json.posts || [];

        console.log('POST RESULT ', postsResult);

        if(postsResult.length < 5 ){
            setNoMorePosts(true);
        }

        dispatch({ type: 'addPost', posts: postsResult });
        

    }, []);

    
    return (
        <PostsContext.Provider value={{ posts, setPostsFromSSR, getPosts, noMorePosts, deletePost }}>
        {children}
        </PostsContext.Provider>
    );
}
