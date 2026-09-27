"use strict";

const normalize_url = (url)=>{
  let parsed = undefined;
  try{
    parsed = new URL(url);
    url =  parsed.protocol
         + "//"
         + parsed.hostname
         + (parsed.port ? ':' + parsed.port : '')
         + parsed.pathname
         + parsed.search
         + parsed.hash
         ;
  }catch(err){}

  url = encodeURIComponent( url );
  //url = url.replace(/%/gm,"");
  //url = url.toLowerCase();
  return url;
};



export { normalize_url };