'use strict';
const assert=require('node:assert/strict'),https=require('node:https'),dns=require('node:dns').promises,{Readable}=require('node:stream'),{EventEmitter}=require('node:events');
const {upstream}=require('./api-backend.cjs');
const originalRequest=https.request,originalLookup=dns.lookup;let captured,reply,status=200;
dns.lookup=async()=>[{address:'8.8.8.8',family:4}];
https.request=(url,options,cb)=>{const req=new EventEmitter();req.end=body=>{captured={url,options,body:body?JSON.parse(body):null};const response=Readable.from(reply);response.statusCode=status;response.headers={'content-type':options.method==='POST'&&captured.body?.stream||url.search?'text/event-stream':'application/json'};queueMicrotask(()=>cb(response));};return req;};
const base={baseUrl:'https://provider.example/v1',apiKey:'secret',model:'test-model',maxTokens:128};
(async()=>{for(const protocol of ['compatible','anthropic','gemini']){
 const p={...base,protocol};let output='';
 const event=protocol==='compatible'?{choices:[{delta:{content:'Hi 🌍'}}]}:protocol==='anthropic'?{type:'content_block_delta',delta:{type:'text_delta',text:'Hi 🌍'}}:{candidates:[{content:{parts:[{text:'Hi 🌍'}]}}]};
 const stream=Buffer.from('data: '+JSON.stringify(event)+'\r\n\r\n');reply=[stream.subarray(0,18),stream.subarray(18)];
 await upstream(p,'chat','Hello',new AbortController().signal,text=>output+=text);assert.equal(output,'Hi 🌍');
 assert.equal(captured.options.headers['Content-Type'],'application/json');assert.ok(captured.url.href.startsWith(p.baseUrl));
 if(protocol==='compatible'){assert.equal(captured.options.headers.Authorization,'Bearer secret');assert.equal(captured.body.messages[1].content,'Hello');assert.equal(captured.body.stream,true);}
 if(protocol==='anthropic'){assert.equal(captured.options.headers['x-api-key'],'secret');assert.equal(captured.body.max_tokens,128);assert.match(captured.url.pathname,/messages$/);}
 if(protocol==='gemini'){assert.equal(captured.options.headers['x-goog-api-key'],'secret');assert.equal(captured.body.contents[0].parts[0].text,'Hello');assert.match(captured.url.pathname,/streamGenerateContent$/);}
 reply=[JSON.stringify(protocol==='gemini'?{models:[{name:'models/test-model'}]}:{data:[{id:'test-model'}]})];
 assert.equal((await upstream(p,'models','',new AbortController().signal)).models.length,1);
 reply=[JSON.stringify(protocol==='compatible'?{choices:[{message:{content:'OK'}}]}:protocol==='anthropic'?{content:[{type:'text',text:'OK'}]}:{candidates:[{content:{parts:[{text:'OK'}]}}]})];
 await upstream(p,'test','Reply OK',new AbortController().signal);
 }
 status=302;reply=[''];await assert.rejects(()=>upstream({...base,protocol:'compatible'},'test','',new AbortController().signal),/HTTP 302/);
 dns.lookup=async()=>[{address:'127.0.0.1',family:4}];await assert.rejects(()=>upstream({...base,protocol:'compatible'},'test','',new AbortController().signal),/mtandao binafsi/);
 console.log('PASS protocol adapters: compatible, Anthropic, Gemini request shapes, headers, streamed Unicode, discovery, generation tests, redirect rejection and private DNS rejection. No external requests.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{https.request=originalRequest;dns.lookup=originalLookup;});
