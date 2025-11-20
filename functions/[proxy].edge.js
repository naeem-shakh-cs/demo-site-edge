export default async function handler(request, context) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    if(hostname === 'www.vineshkamble.xyz'){
        return new Response(null, {
            status: 302,
            
            headers: { Location: 'https://vineshkamble.xyz/' } 
        });
    }
    return fetch(request); 
}
