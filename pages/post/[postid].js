import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import PostsContext from "../../context/postsContext";

export default function Post(props) {
  console.log("PROPS", props);
  const router = useRouter();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { deletePost } = useContext(PostsContext)

  const handleDeleteConfirm = async () => {
    try {
        const response = await fetch(`/api/deletePost`, {
            method: "POST",            
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ postId: props.id }),
        });
        const json = await response.json();
        if(json.success) {
            deletePost(props.id);
            router.replace(`/post/new`);
        }

    } catch (error) {
        console.log(error);
    }
  }

  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-md mx-auto">
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          SEO title and meta description
        </div>
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">
            {" "}
            {props.postTitle}{" "}
          </div>
          <div className="mt-2"> {props.metaDescription} </div>
        </div>

        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Keywords
        </div>

        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, index) => {
            return (
              <div
                key={index}
                className="bg-slate-800 text-white text-sm p-2 rounded-md"
              >
                <FontAwesomeIcon icon={faHashtag} /> {keyword}
              </div>
            );
          })}
        </div>

        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Blog Post
        </div>

        <div dangerouslySetInnerHTML={{ __html: props.postContent || "" }} />
        <div>
          <hr className="my-8" />
        </div>
        <div className="my-8">

            {!showDeleteConfirm &&
                (
                <button
                    className="my-8 btn bg-red-600 hover:bg-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    Delete post
                </button>
                ) 
            }

            {!!showDeleteConfirm &&
                (
                <div className="flex flex-col gap-4">
                    <div className="text-red-600 font-bold text-lg">
                    Are you sure you want to delete this post?
                    </div>
                    <div className="flex gap-4">
                    <button
                        className="btn bg-green-600 hover:bg-green-700"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteConfirm}
                    >
                        Confirm
                    </button>
                    </div>
                </div>
                )
            }
            
        </div>

        <div className="my-8"></div>

        <div>
          <hr className="my-8" />
        </div>
      </div>
    </div>
  );
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);

    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = await client.db("blogGpt");
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub,
    });

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postid),
      userId: user._id,
    });
    if (!post) {
      console.log("post no encontrado", post);
      return {
        redirect: {
          destination: "/post/new",
          permanent: false,
        },
      };
    }
    return {
      props: {
        id: ctx.params.postid,
        postContent: post.postContent,
        postTitle: post.postTitle,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        postCreated: post.createdAt.toString(),
        ...props,
      },
    };
  },
});
