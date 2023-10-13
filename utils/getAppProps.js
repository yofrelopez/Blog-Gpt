import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../lib/mongodb";


export const getAppProps = async (ctx) => {

    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = await client.db("blogGpt");
    const user = await db.collection("users").findOne({
        auth0Id: userSession.user.sub,
    });

    if(!user){
        return {
            availableTokens: 0,
            posts: {}
        }
    }

    const posts = await db.collection("posts").find({
        userId: user._id,
    })
    .limit(5)
    .sort({
        createdAt: -1
    })
    .toArray();

    console.log('usuario', user)

    return {
        availableTokens: user.availableTokens,
        posts: posts.map(({createdAt, _id, userId, ...rest})=>{
            return {
                _id: _id.toString(),
                createdAt: createdAt.toString(),
                ...rest
            }
        }),
        postid: ctx.params?.postid || null,
    }

}