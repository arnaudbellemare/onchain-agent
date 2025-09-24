"use strict";(()=>{var e={};e.id=458,e.ids=[458],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8477:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>g,patchFetch:()=>h,requestAsyncStorage:()=>d,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>m});var o={};i.r(o),i.d(o,{POST:()=>c});var a=i(9303),n=i(8716),r=i(670),s=i(7070);class p{constructor(){this.optimizationEnabled=!0,this.onChainAgentUrl="http://localhost:3000/api/v1/optimize",this.googleAIStudioKey=process.env.GOOGLE_AI_STUDIO_API_KEY||""}async generateCode(e){console.log(`[VibeCodeGenerator] Generating code for: ${e.userPrompt}`);let t=await this.optimizePrompt(e.userPrompt),i=await this.generateProjectStructure(t,e),o=await this.generateFiles(t,e),a=await this.calculateCostOptimization(e.userPrompt,t),n=await this.prepareDeployment(o);return{files:o,projectStructure:i,costOptimization:a,deployment:n}}async optimizePrompt(e){if(!this.optimizationEnabled)return e;try{console.log("[VibeCodeGenerator] Optimizing prompt for cost efficiency");let t=await fetch(this.onChainAgentUrl,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":"ak_c88d0dde13eaacbead83331aef5667f9feff0129425bba4bbb8143add2e9ec73"},body:JSON.stringify({prompt:e,model:"perplexity",quality:.9,max_cost:.1,optimization_type:"cost",use_blockchain:!0,use_x402:!0})});if(!t.ok)return console.warn("[VibeCodeGenerator] Optimization failed, using original prompt"),e;let i=await t.json();if(i.success&&i.result.optimized_prompt)return console.log(`[VibeCodeGenerator] Prompt optimized: ${i.result.optimization_metrics.cost_reduction}% cost reduction`),i.result.optimized_prompt;return e}catch(t){return console.warn("[VibeCodeGenerator] Optimization error, using original prompt:",t),e}}async generateProjectStructure(e,t){let i=["src/","src/components/","src/styles/","src/utils/","public/","package.json","README.md"];return"react"===t.framework?i.push("src/App.tsx","src/index.tsx","src/components/App.css"):"vue"===t.framework?i.push("src/App.vue","src/main.js","src/components/"):"next"===t.framework&&i.push("pages/","pages/api/","pages/_app.tsx","pages/index.tsx"),i}async generateFiles(e,t){let i=[];return i.push({path:"package.json",content:this.generatePackageJson(t),type:"config"}),i.push({path:"src/App.tsx",content:await this.generateMainComponentWithAI(e,t),type:"component"}),i.push({path:"src/App.css",content:this.generateStyles(t),type:"style"}),i.push({path:"README.md",content:this.generateReadme(e,t),type:"script"}),i}async generateMainComponentWithAI(e,t){if(this.googleAIStudioKey)try{console.log("[VibeCodeGenerator] Using Google AI Studio for code generation");let i=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":this.googleAIStudioKey},body:JSON.stringify({contents:[{parts:[{text:`Generate a React component for: ${e}. 
                Framework: ${t.framework||"react"}
                Features: ${t.features?.join(", ")||"basic functionality"}
                
                Return only the JSX/TSX code, no explanations.`}]}]})});if(i.ok){let o=await i.json();if(o.candidates?.[0]?.content?.parts?.[0]?.text){let i=o.candidates[0].content.parts[0].text;return console.log("[VibeCodeGenerator] Google AI Studio generated code successfully"),this.wrapInReactComponent(i,e,t)}}}catch(e){console.warn("[VibeCodeGenerator] Google AI Studio failed, using fallback:",e)}return this.generateMainComponent(e,t)}wrapInReactComponent(e,t,i){return`import React from 'react';
import './App.css';

// Generated with OnChain Agent + Google AI Studio cost optimization
// Original prompt: ${i.userPrompt}
// Optimized for: ${t}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Generated Application</h1>
        <p>Built with Google AI Studio + OnChain Agent optimization</p>
        <div className="features">
          <h2>Features:</h2>
          <ul>
            ${i.features?.map(e=>`<li>${e}</li>`).join("\n            ")||"<li>Basic functionality</li>"}
          </ul>
        </div>
        <div className="cost-optimization">
          <h3>Cost Optimization Active</h3>
          <p>This application was generated using optimized prompts to reduce AI costs.</p>
        </div>
        <div className="ai-generated-content">
          ${e}
        </div>
      </header>
    </div>
  );
};

export default App;`}generatePackageJson(e){let t={react:"^18.2.0","react-dom":"^18.2.0",typescript:"^5.0.0","@types/react":"^18.2.0","@types/react-dom":"^18.2.0"};return"next"===e.framework?t.next="^14.0.0":"vue"===e.framework&&(t.vue="^3.3.0"),JSON.stringify({name:"vibe-generated-app",version:"1.0.0",description:"AI-generated application with cost optimization",main:"src/index.tsx",scripts:{dev:"next dev",build:"next build",start:"next start"},dependencies:t,devDependencies:{"@types/node":"^20.0.0",eslint:"^8.0.0","eslint-config-next":"^14.0.0"}},null,2)}generateMainComponent(e,t){return`import React from 'react';
import './App.css';

// Generated with OnChain Agent cost optimization
// Original prompt: ${t.userPrompt}
// Optimized for: ${e}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Generated Application</h1>
        <p>Built with cost-optimized prompts</p>
        <div className="features">
          <h2>Features:</h2>
          <ul>
            ${t.features?.map(e=>`<li>${e}</li>`).join("\n            ")||"<li>Basic functionality</li>"}
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

export default App;`}generateStyles(e){return`.App {
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
}`}generateReadme(e,t){return`# AI-Generated Application

This application was generated using the OnChain Agent + VibeSDK platform with cost optimization.

## Original Request
${t.userPrompt}

## Cost Optimization
- **Optimization**: Enabled
- **Cost Reduction**: Real-time AI cost optimization
- **Blockchain Payments**: x402 micropayments
- **Revenue Model**: 13% fee on cost savings

## Features
${t.features?.map(e=>`- ${e}`).join("\n")||"- Basic functionality"}

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

Built with ❤️ by OnChain Agent + VibeSDK`}async calculateCostOptimization(e,t){try{console.log("[VibeCodeGenerator] Calculating real cost optimization");let t=await fetch(this.onChainAgentUrl,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":"ak_c88d0dde13eaacbead83331aef5667f9feff0129425bba4bbb8143add2e9ec73"},body:JSON.stringify({prompt:e,model:"perplexity",quality:.9,max_cost:.1,optimization_type:"cost",use_blockchain:!0,use_x402:!0})});if(t.ok){let e=await t.json();if(e.success&&e.result){let t=e.result;return console.log("[VibeCodeGenerator] Real optimization result:",t),{originalCost:`$${t.original_cost||"0.000000"}`,optimizedCost:`$${t.optimized_cost||"0.000000"}`,savings:`$${t.savings||"0.000000"}`,savingsPercentage:`${t.savings_percentage||"0.0"}%`}}}}catch(e){console.warn("[VibeCodeGenerator] Real cost calculation failed, using fallback:",e)}let i=Math.ceil(e.length/4),o=Math.ceil(t.length/4),a=5e-4*i/1e3,n=5e-4*o/1e3,r=a-n,s=(r/a*100).toFixed(1);return{originalCost:`$${a.toFixed(6)}`,optimizedCost:`$${n.toFixed(6)}`,savings:`$${r.toFixed(6)}`,savingsPercentage:`${s}%`}}async prepareDeployment(e){let t=`vibe-${Date.now()}`;return{previewUrl:`https://${t}.vibe-platform.example.com`,deploymentStatus:"ready"}}}async function c(e){try{let{prompt:t,projectType:i="web-app",framework:o="react",features:a=[],optimizationEnabled:n=!0}=await e.json();if(!t)return s.NextResponse.json({success:!1,error:"Prompt is required"},{status:400});console.log(`[VibeSDK] Generating code for: ${t}`);let r=new p,c=await r.generateCode({userPrompt:t,projectType:i,framework:o,features:a,optimizationEnabled:n});return console.log(`[VibeSDK] Code generation completed with ${c.costOptimization.savingsPercentage} cost savings`),s.NextResponse.json({success:!0,result:{...c,vibe_platform:{integration:"OnChain Agent + VibeSDK",cost_optimization:"Real-time AI cost reduction",blockchain_payments:"x402 micropayments enabled",revenue_model:"13% fee on cost savings",deployment:"Cloudflare Workers ready"},timestamp:new Date().toISOString()}})}catch(e){return console.error("VibeSDK code generation error:",e),s.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Unknown error occurred"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/generate-code/route",pathname:"/api/generate-code",filename:"route",bundlePath:"app/api/generate-code/route"},resolvedPagePath:"/Users/cno/onchain-agent-2/vibe-platform/src/app/api/generate-code/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:d,staticGenerationAsyncStorage:m,serverHooks:u}=l,g="/api/generate-code/route";function h(){return(0,r.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:m})}}};var t=require("../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),o=t.X(0,[276,972],()=>i(8477));module.exports=o})();