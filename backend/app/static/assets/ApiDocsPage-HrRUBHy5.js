import{p as V,l as J,j as e,c as X,q as Q,P as w,r as P,s as W,t as Z,n as R,k as ee}from"./ui-By_2Fhe3.js";import{l as k,j as E,C as x,a as h,b as u,c as p,d as f,K as se,S as ae,m as C,n as te,o as l,D as ie,F as re,B as T,p as ne}from"./index-Dm6eGH54.js";import{r as m}from"./router-BpYP0_uS.js";import{C as S}from"./clock-CnDSZUBK.js";import{C as g}from"./circle-check-big-Cj0iId1M.js";import{C as le}from"./copy-MCd2SHJj.js";import"./vendor-9sitkZcQ.js";/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]],oe=k("code-xml",de);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],me=k("database",ce);var A="Tabs",[xe,_e]=X(A,[P]),F=P(),[he,I]=xe(A),B=m.forwardRef((a,t)=>{const{__scopeTabs:i,value:s,onValueChange:r,defaultValue:d,orientation:n="horizontal",dir:j,activationMode:N="automatic",..._}=a,c=V(j),[o,y]=J({prop:s,onChange:r,defaultProp:d??"",caller:A});return e.jsx(he,{scope:i,baseId:Q(),value:o,onValueChange:y,orientation:n,dir:c,activationMode:N,children:e.jsx(w.div,{dir:c,"data-orientation":n,..._,ref:t})})});B.displayName=A;var D="TabsList",U=m.forwardRef((a,t)=>{const{__scopeTabs:i,loop:s=!0,...r}=a,d=I(D,i),n=F(i);return e.jsx(W,{asChild:!0,...n,orientation:d.orientation,dir:d.dir,loop:s,children:e.jsx(w.div,{role:"tablist","aria-orientation":d.orientation,...r,ref:t})})});U.displayName=D;var q="TabsTrigger",z=m.forwardRef((a,t)=>{const{__scopeTabs:i,value:s,disabled:r=!1,...d}=a,n=I(q,i),j=F(i),N=H(n.baseId,s),_=K(n.baseId,s),c=s===n.value;return e.jsx(Z,{asChild:!0,...j,focusable:!r,active:c,children:e.jsx(w.button,{type:"button",role:"tab","aria-selected":c,"aria-controls":_,"data-state":c?"active":"inactive","data-disabled":r?"":void 0,disabled:r,id:N,...d,ref:t,onMouseDown:R(a.onMouseDown,o=>{!r&&o.button===0&&o.ctrlKey===!1?n.onValueChange(s):o.preventDefault()}),onKeyDown:R(a.onKeyDown,o=>{[" ","Enter"].includes(o.key)&&n.onValueChange(s)}),onFocus:R(a.onFocus,()=>{const o=n.activationMode!=="manual";!c&&!r&&o&&n.onValueChange(s)})})})});z.displayName=q;var M="TabsContent",Y=m.forwardRef((a,t)=>{const{__scopeTabs:i,value:s,forceMount:r,children:d,...n}=a,j=I(M,i),N=H(j.baseId,s),_=K(j.baseId,s),c=s===j.value,o=m.useRef(c);return m.useEffect(()=>{const y=requestAnimationFrame(()=>o.current=!1);return()=>cancelAnimationFrame(y)},[]),e.jsx(ee,{present:r||c,children:({present:y})=>e.jsx(w.div,{"data-state":c?"active":"inactive","data-orientation":j.orientation,role:"tabpanel","aria-labelledby":N,hidden:!y,id:_,tabIndex:0,...n,ref:t,style:{...a.style,animationDuration:o.current?"0s":void 0},children:y&&d})})});Y.displayName=M;function H(a,t){return`${a}-trigger-${t}`}function K(a,t){return`${a}-content-${t}`}var ue=B,L=U,G=z,O=Y;const pe=ue,$=m.forwardRef(({className:a,...t},i)=>e.jsx(L,{ref:i,className:E("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",a),...t}));$.displayName=L.displayName;const b=m.forwardRef(({className:a,...t},i)=>e.jsx(G,{ref:i,className:E("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",a),...t}));b.displayName=G.displayName;const v=m.forwardRef(({className:a,...t},i)=>e.jsx(O,{ref:i,className:E("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",a),...t}));v.displayName=O.displayName;function we(){const[a,t]=m.useState(""),i=async(r,d)=>{try{await navigator.clipboard.writeText(r),t(d),setTimeout(()=>t(""),2e3)}catch(n){ne.error("Failed to copy text: ",n)}},s=({children:r,identifier:d})=>e.jsxs("div",{className:"relative",children:[e.jsx("pre",{className:"bg-muted border p-4 rounded-lg overflow-x-auto text-sm font-mono",children:e.jsx("code",{className:"text-foreground",children:r})}),e.jsx(T,{variant:"ghost",size:"sm",className:"absolute top-2 right-2 h-8 w-8 p-0",onClick:()=>i(r,d),children:a===d?e.jsx(g,{className:"h-4 w-4 text-foreground"}):e.jsx(le,{className:"h-4 w-4"})})]});return e.jsx("div",{className:"min-h-screen py-12 bg-background",children:e.jsxs("div",{className:"container mx-auto px-4 max-w-6xl",children:[e.jsxs("div",{className:"text-center mb-12",children:[e.jsx("h1",{className:"text-hero font-bold mb-6",children:"tidyframe.com API Documentation"}),e.jsx("p",{className:"text-base text-muted-foreground max-w-3xl mx-auto",children:"Integrate AI-powered name parsing directly into your applications with our REST API. Process names, detect entities, and extract insights programmatically."})]}),e.jsxs(x,{className:"mb-8 border-primary/20",children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(oe,{className:"h-5 w-5 text-primary"}),e.jsx(u,{children:"Quick Start"})]}),e.jsx(p,{children:"Get started with the tidyframe.com API in minutes"})]}),e.jsx(f,{children:e.jsxs("div",{className:"grid md:grid-cols-3 gap-4 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-primary/5 border rounded-lg",children:[e.jsx("div",{className:"flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-caption font-bold",children:"1"}),e.jsx("span",{children:"Get your API key from the dashboard"})]}),e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-primary/5 border rounded-lg",children:[e.jsx("div",{className:"flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-caption font-bold",children:"2"}),e.jsx("span",{children:"Upload your file via API"})]}),e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-primary/5 border rounded-lg",children:[e.jsx("div",{className:"flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-caption font-bold",children:"3"}),e.jsx("span",{children:"Download processed results"})]})]})})]}),e.jsxs(pe,{defaultValue:"authentication",className:"space-y-6",children:[e.jsxs($,{className:"grid w-full grid-cols-6",children:[e.jsx(b,{value:"authentication",className:"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold",children:"Authentication"}),e.jsx(b,{value:"endpoints",className:"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold",children:"Endpoints"}),e.jsx(b,{value:"examples",className:"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold",children:"Examples"}),e.jsx(b,{value:"responses",className:"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold",children:"Responses"}),e.jsx(b,{value:"limits",className:"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold",children:"Rate Limits"}),e.jsx(b,{value:"formats",className:"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold",children:"File Formats"})]}),e.jsx(v,{value:"authentication",children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(se,{className:"h-5 w-5 text-primary"}),e.jsx(u,{children:"Authentication"})]}),e.jsx(p,{children:"All API requests require authentication using your API key"})]}),e.jsxs(f,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Getting Your API Key"}),e.jsx("div",{className:"bg-muted/50 border p-4 rounded-lg mb-4",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(ae,{className:"h-5 w-5 text-primary mt-1"}),e.jsxs("div",{children:[e.jsxs("p",{className:"text-sm",children:[e.jsx("strong",{children:"Step 1:"})," Log in to your tidyframe.com dashboard"]}),e.jsxs("p",{className:"text-sm",children:[e.jsx("strong",{children:"Step 2:"})," Navigate to Settings → API Keys"]}),e.jsxs("p",{className:"text-sm",children:[e.jsx("strong",{children:"Step 3:"})," Generate a new API key or copy your existing one"]})]})]})})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Using Your API Key"}),e.jsx("p",{className:"text-muted-foreground mb-4",children:"Include your API key in the Authorization header of every request:"}),e.jsx(s,{identifier:"auth-header",children:"Authorization: Bearer YOUR_API_KEY_HERE"})]}),e.jsx("div",{className:"bg-destructive/5 border-destructive/20 p-4 rounded-lg border",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(C,{className:"h-5 w-5 text-destructive mt-1"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-foreground mb-2",children:"Security Note"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Keep your API key secure and never expose it in client-side code. Use server-side applications or secure environment variables only."})]})]})})]})]})}),e.jsx(v,{value:"endpoints",children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(te,{className:"h-5 w-5 text-foreground"}),e.jsx(u,{children:"Upload File"})]}),e.jsx(l,{variant:"secondary",children:"POST"})]}),e.jsx(p,{children:"Upload a file for name parsing and processing"})]}),e.jsxs(f,{className:"space-y-4",children:[e.jsx("div",{className:"bg-primary/10 border p-3 rounded-lg",children:e.jsx("code",{className:"text-sm font-mono text-foreground",children:"POST /api/upload"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Request Body (multipart/form-data)"}),e.jsxs("div",{className:"text-sm space-y-1",children:[e.jsxs("p",{children:[e.jsx("code",{children:"file"})," - The file to upload (required)"]}),e.jsxs("p",{children:[e.jsx("code",{children:"primary_name_column"})," - Name column identifier (optional, auto-detected if not specified)"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Response"}),e.jsx(s,{identifier:"upload-response",children:`{
  "job_id": "c3d5ffe0-b8f9-477d-87f5-f8ff88d21dfd",
  "message": "File uploaded successfully. Processing started.",
  "estimated_processing_time": 30
}`})]})]})]}),e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(S,{className:"h-5 w-5 text-foreground"}),e.jsx(u,{children:"Get Job Status"})]}),e.jsx(l,{variant:"outline",children:"GET"})]}),e.jsx(p,{children:"Check the processing status of your uploaded file"})]}),e.jsxs(f,{className:"space-y-4",children:[e.jsx("div",{className:"bg-primary/10 border p-3 rounded-lg",children:e.jsxs("code",{className:"text-sm font-mono text-foreground",children:["GET /api/jobs/","{"," job_id ","}"]})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Response"}),e.jsx(s,{identifier:"status-response",children:`{
  "id": "c3d5ffe0-b8f9-477d-87f5-f8ff88d21dfd",
  "status": "completed",
  "progress": 100,
  "filename": "processed_file.csv",
  "created_at": "2025-09-06T02:19:36.089873Z",
  "started_at": "2025-09-06T02:19:36.153497Z",
  "completed_at": "2025-09-06T02:19:37.618437Z",
  "estimated_completion_time": null,
  "total_rows": null,
  "processed_rows": 4,
  "successful_parses": 4,
  "failed_parses": 0,
  "success_rate": 100.0,
  "error_message": null
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Status Values"}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(l,{variant:"outline",children:"pending"}),e.jsx("span",{children:"Queued for processing"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(l,{variant:"secondary",children:"processing"}),e.jsx("span",{children:"Currently being processed"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(l,{variant:"default",children:"completed"}),e.jsx("span",{children:"Processing complete"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(l,{variant:"destructive",children:"failed"}),e.jsx("span",{children:"Processing failed"})]})]})]})]})]}),e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ie,{className:"h-5 w-5 text-foreground"}),e.jsx(u,{children:"Download Results"})]}),e.jsx(l,{variant:"outline",children:"GET"})]}),e.jsx(p,{children:"Download the processed results file"})]}),e.jsxs(f,{className:"space-y-4",children:[e.jsx("div",{className:"bg-primary/10 border p-3 rounded-lg",children:e.jsxs("code",{className:"text-sm font-mono text-foreground",children:["GET /api/jobs/","{"," job_id ","}","/download"]})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Response"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"Returns an Excel file (.xlsx) with processed name data"}),e.jsxs("div",{className:"text-sm",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Content-Type:"})," application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Content-Disposition:"}),' attachment; filename="processed_results.xlsx"']})]})]})]})]})]})}),e.jsx(v,{value:"examples",children:e.jsx("div",{className:"space-y-6",children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsx(u,{children:"Complete Workflow Example"}),e.jsx(p,{children:"Step-by-step example of uploading a file, checking status, and downloading results"})]}),e.jsxs(f,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Step 1: Upload File"}),e.jsx(s,{identifier:"curl-upload",children:`curl -X POST https://tidyframe.com/api/upload \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -F "file=@names.csv" \\
  -F "primary_name_column=full_name"`})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Step 2: Check Job Status"}),e.jsx(s,{identifier:"curl-status",children:`curl -X GET https://tidyframe.com/api/jobs/job_123456789 \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE"`})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Step 3: Download Results (when completed)"}),e.jsx(s,{identifier:"curl-download",children:`curl -X GET https://tidyframe.com/api/jobs/job_123456789/download \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -o processed_results.xlsx`})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"JavaScript/Node.js Example"}),e.jsx(s,{identifier:"js-example",children:`const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function processFile() {
  const form = new FormData();
  form.append('file', fs.createReadStream('names.csv'));
  form.append('primary_name_column', 'full_name');

  // Upload file
  const uploadResponse = await axios.post(
    'https://tidyframe.com/api/upload',
    form,
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        ...form.getHeaders()
      }
    }
  );

  const jobId = uploadResponse.data.job_id;
  logger.debug('Job ID:', jobId);

  // Poll for completion
  let status = 'pending';
  while (status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const statusResponse = await axios.get(
      \`https://tidyframe.com/api/jobs/\${jobId}\`,
      {
        headers: { 'Authorization': 'Bearer YOUR_API_KEY_HERE' }
      }
    );
    
    status = statusResponse.data.status;
    logger.debug('Status:', status);
  }

  // Download results
  const resultResponse = await axios.get(
    \`https://tidyframe.com/api/jobs/\${jobId}/download\`,
    {
      headers: { 'Authorization': 'Bearer YOUR_API_KEY_HERE' },
      responseType: 'stream'
    }
  );

  resultResponse.data.pipe(fs.createWriteStream('results.xlsx'));
  logger.debug('Results downloaded!');
}`})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Python Example"}),e.jsx(s,{identifier:"python-example",children:`import requests
import time

def process_file():
    # Upload file
    with open('names.csv', 'rb') as f:
        files = {'file': f}
        data = {'primary_name_column': 'full_name'}
        
        response = requests.post(
            'https://tidyframe.com/api/upload',
            files=files,
            data=data,
            headers={'Authorization': 'Bearer YOUR_API_KEY_HERE'}
        )
    
    job_id = response.json()['job_id']
    print(f'Job ID: {job_id}')
    
    # Poll for completion
    while True:
        status_response = requests.get(
            f'https://tidyframe.com/api/jobs/{job_id}',
            headers={'Authorization': 'Bearer YOUR_API_KEY_HERE'}
        )
        
        status = status_response.json()['status']
        print(f'Status: {status}')
        
        if status == 'completed':
            break
        elif status == 'failed':
            print('Job failed!')
            return
            
        time.sleep(5)
    
    # Download results
    result_response = requests.get(
        f'https://tidyframe.com/api/jobs/{job_id}/download',
        headers={'Authorization': 'Bearer YOUR_API_KEY_HERE'}
    )
    
    with open('results.xlsx', 'wb') as f:
        f.write(result_response.content)
    
    print('Results downloaded!')

process_file()`})]})]})]})})}),e.jsx(v,{value:"responses",children:e.jsx("div",{className:"space-y-6",children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsx(u,{children:"Response Format"}),e.jsx(p,{children:"Understanding the structure of API responses and processed data"})]}),e.jsxs(f,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Processed Data Fields"}),e.jsx("p",{className:"text-muted-foreground mb-4",children:"The downloaded Excel file contains the original data plus these additional columns:"}),e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Entity Classification"}),e.jsx("div",{className:"space-y-2 text-sm",children:e.jsxs("p",{children:[e.jsx("code",{children:"entity_type"}),' - Type of entity: "person", "company", or "trust"']})})]}),e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsx("h4",{className:"font-semibold mb-2",children:'Person Data (when entity_type = "person")'}),e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("p",{children:[e.jsx("code",{children:"first_name"})," - Extracted first name"]}),e.jsxs("p",{children:[e.jsx("code",{children:"last_name"})," - Extracted last name"]}),e.jsxs("p",{children:[e.jsx("code",{children:"middle_initial"})," - Middle initial or name"]}),e.jsxs("p",{children:[e.jsx("code",{children:"gender"}),' - Predicted gender: "Male", "Female", or "Unknown"']}),e.jsxs("p",{children:[e.jsx("code",{children:"gender_confidence"})," - Confidence score (0.0 to 1.0)"]})]})]}),e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Special Classifications"}),e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("p",{children:[e.jsx("code",{children:"is_agricultural_entity"})," - Boolean indicating agricultural business"]}),e.jsxs("p",{children:[e.jsx("code",{children:"processed_name"})," - Cleaned and standardized version of original name"]})]})]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Example Processed Data"}),e.jsx(s,{identifier:"processed-data",children:`Original Name: "John A. Smith"
├─ entity_type: "person"
├─ first_name: "John"
├─ last_name: "Smith"
├─ middle_initial: "A"
├─ gender: "Male"
├─ gender_confidence: 0.95
├─ is_agricultural_entity: false
└─ processed_name: "John A. Smith"

Original Name: "ABC Corporation Ltd"
├─ entity_type: "company"
├─ first_name: null
├─ last_name: null
├─ middle_initial: null
├─ gender: null
├─ gender_confidence: null
├─ is_agricultural_entity: false
└─ processed_name: "ABC Corporation Ltd"

Original Name: "Smith Family Trust"
├─ entity_type: "trust"
├─ first_name: null
├─ last_name: "Smith"
├─ middle_initial: null
├─ gender: null
├─ gender_confidence: null
├─ is_agricultural_entity: false
└─ processed_name: "Smith Family Trust"`})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Error Responses"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2",children:"Authentication Error (401)"}),e.jsx(s,{identifier:"auth-error",children:`{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2",children:"File Too Large (413)"}),e.jsx(s,{identifier:"size-error",children:`{
  "success": false,
  "error": "File too large",
  "message": "File size exceeds 200MB limit"
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2",children:"Invalid File Format (400)"}),e.jsx(s,{identifier:"format-error",children:`{
  "success": false,
  "error": "Invalid file format",
  "message": "Supported formats: CSV, XLSX, XLS, TXT"
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2",children:"Rate Limit Exceeded (429)"}),e.jsx(s,{identifier:"rate-error",children:`{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again in 60 seconds.",
  "retry_after": 60
}`})]})]})]})]})]})})}),e.jsx(v,{value:"limits",children:e.jsx("div",{className:"space-y-6",children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsx(u,{children:"Rate Limits & Usage Quotas"}),e.jsx(p,{children:"Understand the limits and quotas for API usage"})]}),e.jsxs(f,{className:"space-y-6",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsxs("h3",{className:"text-xl font-semibold mb-3 flex items-center gap-2",children:[e.jsx(S,{className:"h-5 w-5 text-foreground"}),"API Rate Limits"]}),e.jsxs("div",{className:"space-y-3 text-sm",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Requests per minute:"}),e.jsx(l,{children:"60"})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Requests per hour:"}),e.jsx(l,{children:"1,800"})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Concurrent uploads:"}),e.jsx(l,{children:"3"})]})]})]}),e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsxs("h3",{className:"text-xl font-semibold mb-3 flex items-center gap-2",children:[e.jsx(me,{className:"h-5 w-5 text-foreground"}),"Monthly Quotas"]}),e.jsxs("div",{className:"space-y-3 text-sm",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Names processed:"}),e.jsx(l,{children:"100,000"})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Overage rate:"}),e.jsx(l,{variant:"outline",children:"$0.002/name"})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Minimum overage:"}),e.jsx(l,{variant:"outline",children:"$2 per 1,000"})]})]})]})]}),e.jsxs("div",{className:"bg-muted/50 border p-6 rounded-lg",children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"How Rate Limiting Works"}),e.jsxs("div",{className:"space-y-3 text-sm",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Request Limits:"})," Rate limits are enforced per API key using a sliding window. If you exceed the limit, you'll receive a 429 status code with a ",e.jsx("code",{children:"retry_after"})," header."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Name Processing:"})," Each name in your uploaded file counts toward your monthly quota. Large files are processed efficiently, but each individual name record is counted."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Overage Billing:"})," If you exceed 100,000 names in a month, additional names are automatically billed at $0.002 per name ($2 per 1,000 names)."]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Best Practices"}),e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"flex gap-3 p-4 bg-primary/5 border rounded-lg",children:[e.jsx(g,{className:"h-5 w-5 text-primary mt-1 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-foreground",children:"Batch Processing"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Upload larger files instead of making many small requests to maximize efficiency."})]})]}),e.jsxs("div",{className:"flex gap-3 p-4 bg-primary/5 border rounded-lg",children:[e.jsx(g,{className:"h-5 w-5 text-primary mt-1 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-foreground",children:"Monitor Usage"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Use the ",e.jsx("code",{children:"/api/user/usage"})," endpoint to track your current usage and avoid surprises."]})]})]}),e.jsxs("div",{className:"flex gap-3 p-4 bg-primary/5 border rounded-lg",children:[e.jsx(g,{className:"h-5 w-5 text-primary mt-1 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-foreground",children:"Implement Retries"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Handle rate limits gracefully by implementing exponential backoff for 429 responses."})]})]})]})]})]})]})})}),e.jsx(v,{value:"formats",children:e.jsx("div",{className:"space-y-6",children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsx(u,{children:"Supported File Formats"}),e.jsx(p,{children:"File format requirements and specifications"})]}),e.jsxs(f,{className:"space-y-6",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("h3",{className:"text-xl font-semibold flex items-center gap-2",children:[e.jsx(re,{className:"h-5 w-5 text-foreground"}),"Supported Formats"]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg",children:[e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:"CSV Files"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:".csv"})]}),e.jsx(l,{variant:"default",children:"Recommended"})]}),e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg",children:[e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:"Excel Files"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:".xlsx, .xls"})]}),e.jsx(l,{variant:"secondary",children:"Supported"})]}),e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg",children:[e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:"Text Files"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:".txt"})]}),e.jsx(l,{variant:"outline",children:"Basic"})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h3",{className:"text-xl font-semibold",children:"File Requirements"}),e.jsxs("div",{className:"space-y-3 text-sm",children:[e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(g,{className:"h-4 w-4 text-foreground mt-0.5 flex-shrink-0"}),e.jsxs("span",{children:["Maximum file size: ",e.jsx("strong",{children:"200MB"})]})]}),e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(g,{className:"h-4 w-4 text-foreground mt-0.5 flex-shrink-0"}),e.jsx("span",{children:"Must contain a column with names"})]}),e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(g,{className:"h-4 w-4 text-foreground mt-0.5 flex-shrink-0"}),e.jsx("span",{children:"UTF-8 or automatic encoding detection"})]}),e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(g,{className:"h-4 w-4 text-foreground mt-0.5 flex-shrink-0"}),e.jsx("span",{children:"Headers in first row (recommended)"})]})]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Column Identification"}),e.jsx("p",{className:"text-muted-foreground mb-4",children:"tidyframe.com automatically detects name columns, but you can specify the column name for better accuracy:"}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-4 mb-4",children:[e.jsxs("div",{className:"p-4 bg-primary/5 rounded-lg border",children:[e.jsx("h4",{className:"font-semibold text-foreground mb-2",children:"Auto-detected Column Names"}),e.jsxs("div",{className:"text-sm text-muted-foreground space-y-1",children:[e.jsx("p",{children:'• "name" (any case)'}),e.jsx("p",{children:'• "full_name" or "fullname"'}),e.jsx("p",{children:'• "customer_name"'}),e.jsx("p",{children:'• "client_name"'}),e.jsx("p",{children:'• "addressee"'})]})]}),e.jsxs("div",{className:"p-4 bg-secondary/50 rounded-lg border",children:[e.jsx("h4",{className:"font-semibold text-foreground mb-2",children:"Manual Specification"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:e.jsxs("p",{children:["Use the ",e.jsx("code",{children:"primary_name_column"})," parameter in your upload request to specify a different column name."]})})]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-semibold mb-3",children:"Sample File Formats"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2",children:"CSV Format Example"}),e.jsx(s,{identifier:"csv-example",children:`name,email,phone
"John Smith","john@example.com","555-1234"
"ABC Corporation","contact@abc.com","555-5678"
"Smith Family Trust","trust@example.com","555-9012"
"Dr. Sarah Johnson","sarah.j@example.com","555-3456"`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2",children:"Text File Format Example"}),e.jsx(s,{identifier:"txt-example",children:`John Smith
ABC Corporation
Smith Family Trust
Dr. Sarah Johnson`})]})]})]}),e.jsx("div",{className:"bg-muted/50 p-4 rounded-lg border",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(C,{className:"h-5 w-5 text-primary mt-1"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-foreground mb-2",children:"Important Notes"}),e.jsxs("div",{className:"text-sm text-muted-foreground space-y-1",children:[e.jsx("p",{children:"• Files with special characters or international names are fully supported"}),e.jsx("p",{children:"• Excel files should use the first worksheet for data"}),e.jsx("p",{children:"• Large files may take longer to process but are handled efficiently"}),e.jsx("p",{children:"• Empty rows and columns are automatically ignored"})]})]})]})})]})]})})})]}),e.jsxs("div",{className:"text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg",children:[e.jsx("h3",{className:"text-2xl font-bold mb-4",children:"Ready to Start Building?"}),e.jsx("p",{className:"text-muted-foreground mb-6 max-w-2xl mx-auto",children:"Get your API key from the dashboard and start integrating AI-powered name parsing into your applications today."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsx(T,{size:"lg",asChild:!0,children:e.jsx("a",{href:"/dashboard",children:"Get API Key"})}),e.jsx(T,{size:"lg",variant:"outline",asChild:!0,children:e.jsx("a",{href:"/contact",children:"Need Help?"})})]})]})]})})}export{we as default};
//# sourceMappingURL=ApiDocsPage-HrRUBHy5.js.map
