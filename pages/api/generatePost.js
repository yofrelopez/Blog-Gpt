import { Configuration, OpenAIApi } from "openai"
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import clientPromise from "../../lib/mongodb";





export default withApiAuthRequired(async function handler(req, res) {

    const {user} = await getSession(req, res);
    const client = await clientPromise;
    const db = await client.db('blogGpt');
    const userProfile = await db.collection('users').findOne({
        auth0Id: user.sub
    });

    if(!userProfile?.availableTokens) {
        res.status(403).json({
            error: 'No tienes suficientes tokens disponibles'
        })
        return;
    }


    const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
    const openai = new OpenAIApi(config)
    const { topic, keywords } = req.body


    if(!topic || !keywords){
        res.status(422).json({
            error: 'Faltan datos'
        })
        return;
    }

    if(!topic.trim() || !keywords.trim()){
        res.status(422).json({
            error: 'Faltan datos'
        })
        return;
    }

    if(topic.length > 120 || keywords.length > 80){
        res.status(422).json({
            error: 'Topic o Keywords demasiado largos'
        })
        return;
    }
    

    const postContestResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
            {
                role:"system",
                content: "Tú eres un generador de contenido de blogs"
            },
            {
                role: "user",
                content: `Escribe un post detallado y SEO friendly sobre el tema: ${req.body.topic},
                siguiendo las siguentes palabras claves separadas por comas: ${req.body.keywords}.
                El contenido debe estar formateado en SEO friendly HTML5,
                utilizando únicamente las etiquetas <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <p>, <ul>, <ol>, <li>, <a>, <img>, <strong>, <em>, <blockquote>, <code>, <pre>, <br>, <hr>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.`,
            }
        ]
    })

    const postContent = postContestResponse.data.choices[0]?.message?.content || "";
    
    const titleResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
            {
                role:"system",
                content: "Tú eres un generador de contenido de blogs"
            },
            {
                role: "user",
                content: `Escribe un post detallado y SEO friendly sobre el tema: ${req.body.topic},
                siguiendo las siguentes palabras claves separadas por comas: ${req.body.keywords}.
                El contenido debe estar formateado en SEO friendly HTML5,
                utilizando únicamente las etiquetas <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <p>, <ul>, <ol>, <li>, <a>, <img>, <strong>, <em>, <blockquote>, <code>, <pre>, <br>, <hr>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.`,
            },
            {
                role: "assistant",
                content: postContent
            },
            {
                role: "user",
                content: "Genera un título apropiado para el post anterior"
            }
        ]
    })  

    const metaDescriptionResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
            {
                role:"system",
                content: "Tú eres un generador de contenido de blogs"
            },
            {
                role: "user",
                content: `Escribe un post detallado y SEO friendly sobre el tema: ${req.body.topic},
                siguiendo las siguentes palabras claves separadas por comas: ${req.body.keywords}.
                El contenido debe estar formateado en SEO friendly HTML5,
                utilizando únicamente las etiquetas <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <p>, <ul>, <ol>, <li>, <a>, <img>, <strong>, <em>, <blockquote>, <code>, <pre>, <br>, <hr>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.`,
            },
            {
                role: "assistant",
                content: postContent
            },
            {
                role: "user",
                content: "Genera SEO friendly meta description para el post anterior"
            }
        ]
    })  

    const postTitle = titleResponse.data.choices[0]?.message?.content || "";
    const metaDescription = metaDescriptionResponse.data.choices[0]?.message?.content || "";

    console.log('POST CONTENT', postContent);
    console.log('POST TITLE', postTitle);
    console.log('META DESCRIPTION', metaDescription);


    await db.collection('users').updateOne(
        {
            auth0Id: user.sub,
        },
        {
            $inc: {
                availableTokens: -1
            }
        }
    )


    const post = await db.collection('posts').insertOne({
        postTitle: postTitle || '',
        metaDescription: metaDescription || '',
        postContent: postContent || '',
        topic,
        keywords,
        userId: userProfile._id,
        createdAt: new Date()
    })

    res.status(200).json({
        postId: post.insertedId,

    })

  })
  