import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

export default function NewPost(props) {

  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);


    try{
      const response = await fetch("/api/generatePost", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          topic,
          keywords,
        }),
      });
      const data = await response.json();
      console.log("data:", data);

      if(data?.postId){
        router.push(`/post/${data.postId}`)
      }
    }catch(error){
      setLoading(false);
      console.log("error:", error);
    }



  };



  return (
    <div className="h-full overflow-hidden">
      { !!loading &&
        (
        <div className="text-green-500 flex h-full animate-pulse flex-col justify-center items-center">
          <FontAwesomeIcon icon={faBrain} className="text-8xl"/>
          <h6> Generando... </h6>
        </div>
        )
      }
        
      {!loading && (
      <div className="w-full h-full flex flex-col overflow-auto">
        <form onSubmit={handleSubmit}
              className="m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md
                        shadow-xl border border-slate-200 shadow-slate-200"
        >
          <div>
            <label>
              <strong>Genera un post sobre el tema:</strong>
            </label>
            <textarea
              className="resize-no border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={160}
            />
          </div>

          <div>
            <label>
              <strong>
                Siguiendo las siguientes palabras claves separadas por comas:
              </strong>
            </label>
            <textarea
              className="resize-no border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              maxLength={80}
            />
            <small className="block mb-2">
              Palabras claves separadas por comas
            </small>
          </div>
          <button
            type="submit"
            className="btn"
            disabled={!topic.trim() || !keywords.trim()}
          >
            Generate
          </button>
        </form>        
      </div>
      )}



    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};



export const getServerSideProps = withPageAuthRequired({

  async getServerSideProps(ctx){
      const props = await getAppProps(ctx);

      if (!props.availableTokens) {
        return {
          redirect: {
            destination: "/token-topup",
            permanent: false,
          },
        }
      } 

      return {
          props
      }
  }
});