(()=>{var a={};a.id=623,a.ids=[623],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4429:()=>{},4749:()=>{},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},9121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9390:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{POST:()=>w});var e=c(4112),f=c(3125),g=c(3588),h=c(9510),i=c(1932),j=c(261),k=c(1290),l=c(2600),m=c(9704),n=c(7451),o=c(7845),p=c(4951),q=c(5017),r=c(7102),s=c(6439),t=c(8916),u=c(9113);class v{constructor(){this.optimizationEnabled=!0,this.onChainAgentUrl="http://localhost:3000/api/v1/optimize",this.googleAIStudioKey=process.env.GOOGLE_AI_STUDIO_API_KEY||""}async generateCode(a){console.log(`[VibeCodeGenerator] Generating code for: ${a.userPrompt}`);let b=await this.optimizePrompt(a.userPrompt),c=await this.generateProjectStructure(b,a),d=await this.generateFiles(b,a),e=await this.calculateCostOptimization(a.userPrompt,b),f=await this.prepareDeployment(d);return{files:d,projectStructure:c,costOptimization:e,deployment:f}}async optimizePrompt(a){if(!this.optimizationEnabled)return a;try{console.log("[VibeCodeGenerator] Optimizing prompt for cost efficiency");let b=await fetch(this.onChainAgentUrl,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":"ak_c88d0dde13eaacbead83331aef5667f9feff0129425bba4bbb8143add2e9ec73"},body:JSON.stringify({prompt:a,model:"perplexity",quality:.9,max_cost:.1,optimization_type:"cost",use_blockchain:!0,use_x402:!0})});if(!b.ok)return console.warn("[VibeCodeGenerator] Optimization failed, using original prompt"),a;let c=await b.json();if(c.success&&c.result.optimized_prompt)return console.log(`[VibeCodeGenerator] Prompt optimized: ${c.result.optimization_metrics.cost_reduction}% cost reduction`),c.result.optimized_prompt;return a}catch(b){return console.warn("[VibeCodeGenerator] Optimization error, using original prompt:",b),a}}async generateProjectStructure(a,b){let c=["src/","src/components/","src/styles/","src/utils/","public/","package.json","README.md"];return"react"===b.framework?c.push("src/App.tsx","src/index.tsx","src/components/App.css"):"vue"===b.framework?c.push("src/App.vue","src/main.js","src/components/"):"next"===b.framework&&c.push("pages/","pages/api/","pages/_app.tsx","pages/index.tsx"),c}async generateFiles(a,b){let c=[];return c.push({path:"package.json",content:this.generatePackageJson(b),type:"config"}),c.push({path:"src/App.tsx",content:await this.generateMainComponentWithAI(a,b),type:"component"}),c.push({path:"src/App.css",content:this.generateStyles(b),type:"style"}),c.push({path:"README.md",content:this.generateReadme(a,b),type:"script"}),c}async generateMainComponentWithAI(a,b){if(this.googleAIStudioKey)try{console.log("[VibeCodeGenerator] Using Google AI Studio for code generation");let c=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":this.googleAIStudioKey},body:JSON.stringify({contents:[{parts:[{text:`Generate a React component for: ${a}. 
                Framework: ${b.framework||"react"}
                Features: ${b.features?.join(", ")||"basic functionality"}
                
                Return only the JSX/TSX code, no explanations.`}]}]})});if(c.ok){let d=await c.json();if(d.candidates?.[0]?.content?.parts?.[0]?.text){let c=d.candidates[0].content.parts[0].text;return console.log("[VibeCodeGenerator] Google AI Studio generated code successfully"),this.wrapInReactComponent(c,a,b)}}}catch(a){console.warn("[VibeCodeGenerator] Google AI Studio failed, using fallback:",a)}return this.generateMainComponent(a,b)}wrapInReactComponent(a,b,c){return`import React from 'react';
import './App.css';

// Generated with OnChain Agent + Google AI Studio cost optimization
// Original prompt: ${c.userPrompt}
// Optimized for: ${b}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Generated Application</h1>
        <p>Built with Google AI Studio + OnChain Agent optimization</p>
        <div className="features">
          <h2>Features:</h2>
          <ul>
            ${c.features?.map(a=>`<li>${a}</li>`).join("\n            ")||"<li>Basic functionality</li>"}
          </ul>
        </div>
        <div className="cost-optimization">
          <h3>Cost Optimization Active</h3>
          <p>This application was generated using optimized prompts to reduce AI costs.</p>
        </div>
        <div className="ai-generated-content">
          ${a}
        </div>
      </header>
    </div>
  );
};

export default App;`}generatePackageJson(a){let b={react:"^18.2.0","react-dom":"^18.2.0",typescript:"^5.0.0","@types/react":"^18.2.0","@types/react-dom":"^18.2.0"};return"next"===a.framework?b.next="^14.0.0":"vue"===a.framework&&(b.vue="^3.3.0"),JSON.stringify({name:"vibe-generated-app",version:"1.0.0",description:"AI-generated application with cost optimization",main:"src/index.tsx",scripts:{dev:"next dev",build:"next build",start:"next start"},dependencies:b,devDependencies:{"@types/node":"^20.0.0",eslint:"^8.0.0","eslint-config-next":"^14.0.0"}},null,2)}generateMainComponent(a,b){return`import React from 'react';
import './App.css';

// Generated with OnChain Agent cost optimization
// Original prompt: ${b.userPrompt}
// Optimized for: ${a}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Generated Application</h1>
        <p>Built with cost-optimized prompts</p>
        <div className="features">
          <h2>Features:</h2>
          <ul>
            ${b.features?.map(a=>`<li>${a}</li>`).join("\n            ")||"<li>Basic functionality</li>"}
          </ul>
        </div>
        <div className="cost-optimization">
          <h3>Cost Optimization Active</h3>
          <p>This application was generated using optimized prompts to reduce AI costs.</p>
        </div>
      </header>
    </div>
  );
};

export default App;`}generateStyles(a){return`.App {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
  padding: 2rem;
}

.App-header {
  max-width: 800px;
  margin: 0 auto;
}

.features {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2rem;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
}

.cost-optimization {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 10px;
  padding: 1rem;
  margin: 2rem 0;
}

h1, h2, h3 {
  margin-bottom: 1rem;
}

ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

li {
  margin: 0.5rem 0;
}`}generateReadme(a,b){return`# AI-Generated Application

This application was generated using the OnChain Agent + VibeSDK platform with cost optimization.

## Original Request
${b.userPrompt}

## Cost Optimization
- **Optimization**: Enabled
- **Cost Reduction**: Real-time AI cost optimization
- **Blockchain Payments**: x402 micropayments
- **Revenue Model**: 13% fee on cost savings

## Features
${b.features?.map(a=>`- ${a}`).join("\n")||"- Basic functionality"}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Cost Optimization Benefits
- Reduced AI API costs
- Optimized prompt generation
- Real-time cost monitoring
- Blockchain-native payments

Built with ❤️ by OnChain Agent + VibeSDK`}async calculateCostOptimization(a,b){let c=Math.ceil(a.length/4),d=Math.ceil(b.length/4),e=5e-4*c/1e3,f=5e-4*d/1e3,g=e-f,h=(g/e*100).toFixed(1);return{originalCost:`$${e.toFixed(6)}`,optimizedCost:`$${f.toFixed(6)}`,savings:`$${g.toFixed(6)}`,savingsPercentage:`${h}%`}}async prepareDeployment(a){let b=`vibe-${Date.now()}`;return{previewUrl:`https://${b}.vibe-platform.example.com`,deploymentStatus:"ready"}}}async function w(a){try{let{prompt:b,projectType:c="web-app",framework:d="react",features:e=[],optimizationEnabled:f=!0}=await a.json();if(!b)return u.NextResponse.json({success:!1,error:"Prompt is required"},{status:400});console.log(`[VibeSDK] Generating code for: ${b}`);let g=new v,h=await g.generateCode({userPrompt:b,projectType:c,framework:d,features:e,optimizationEnabled:f});return console.log(`[VibeSDK] Code generation completed with ${h.costOptimization.savingsPercentage} cost savings`),u.NextResponse.json({success:!0,result:{...h,vibe_platform:{integration:"OnChain Agent + VibeSDK",cost_optimization:"Real-time AI cost reduction",blockchain_payments:"x402 micropayments enabled",revenue_model:"13% fee on cost savings",deployment:"Cloudflare Workers ready"},timestamp:new Date().toISOString()}})}catch(a){return console.error("VibeSDK code generation error:",a),u.NextResponse.json({success:!1,error:a instanceof Error?a.message:"Unknown error occurred"},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/generate-code/route",pathname:"/api/generate-code",filename:"route",bundlePath:"app/api/generate-code/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/cno/onchain-agent-2/vibe-platform/src/app/api/generate-code/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/generate-code/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[958,314],()=>b(b.s=9390));module.exports=c})();