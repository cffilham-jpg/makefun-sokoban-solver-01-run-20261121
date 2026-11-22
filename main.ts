import*as f from'node:fs';
const{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:O='/output'}=process.env,X=250e3;
function S(t){
const r=t.split('\n').filter(x=>x),h=r.length,w=Math.max(...r.map(x=>x.length)),N=w*h,G=[],B=[];let P=-1;
const U2=()=>new Uint8Array(N),I2=()=>new Int32Array(N),A=U2().fill(1);
r.forEach((y,j)=>[...y].forEach((z,x)=>{const i=j*w+x;A[i]=z=='#'|!x|x>w-2|!j|j>h-2;if(z>'%'&&z<'0')G.push(i);if(z=='$'|z=='*')B.push(i);if(z=='@'|z=='+')P=i;}));
const D=[-w,w,-1,1];
function V(W,g){const v=U2(),q=g.map(x=>(v[x]=1,x));for(const u of q)for(const d of D){const y=u-d;W[y]|W[y-d]|v[y]||(v[y]=1,q.push(y));}return v}
let z=null;R:{const v=V(A,G),k=P/w|0,C=U2();for(let i=k*w+w;i-->k*w;)C[i]=!A[i]&!v[i];if(B.some(b=>C[b]))break R;const p=I2().fill(-1),o=[];for(let s=0;s<N;s++){if(A[s]|C[s]|p[s]+1)continue;const q=[s];p[s]=o.length;for(const u of q)for(const d of D){const n=u+d;A[n]|C[n]|p[n]+1||(p[n]=o.length,q.push(n));}o.push({b:[],g:[]});}B.forEach(b=>o[p[b]].b.push(b));G.forEach(g=>p[g]>-1&&o[p[g]].g.push(g));if(G.some(g=>!~p[g])||o.some(x=>x.b.length-x.g.length))break R;z=o.filter(x=>x.b.length)}
function F(W,g,b,p,M){const o=U2();g.forEach(x=>o[x]=1);const Y=V(W,g);if(b.some(x=>!Y[x]))return null;const n=b.length,Z=a=>a.every(x=>o[x]),c=U2(),s=I2(),m=I2(),T=I2(),Q=(a,v)=>a.forEach(x=>c[x]=v),w=x=>W[x]|c[x];let q=0,y=0;
function L(a,z,f){let l=f,n2=0;a[T[n2++]=f]=z;while(n2){const u=T[--n2];u<l&&(l=u);for(const d of D){const x=u+d;w(x)|a[x]==z||(a[x]=z,T[n2++]=x);}}return l}
function K(u){for(const a of[u,u-1,u-w,u-w-1]){const e=a+1,C=a+w,d=C+1;if(w(a)&w(e)&w(C)&w(d)&&(c[a]&!o[a]|c[e]&!o[e]|c[C]&!o[C]|c[d]&!o[d]))return 1;}return 0}
const E=(l,a)=>a.reduce((k,x)=>k*N+x,l);
Q(b,1);
const K2=[E(L(s,++q,p),b)],J=[0],X2=new Set(K2);
Q(b,0);
let f=Z(b)?0:-1;
for(let e=0;f<0&&e<K2.length;e++){let k=K2[e];const u=[];for(let i=n;i--;)k=(k-(u[i]=k%N))/N;
Q(u,1);L(s,++q,k);const z=q;
for(let i=0;i<n&&f<0;i++){const bb=u[i];for(const d of D){const v=bb+d;if(s[bb-d]!=z||w(v)||!Y[v])continue;c[bb]=0;c[v]=1;let k2=-1,nx;if(!K(v)){nx=[...u];nx[i]=v;nx.sort((a,b)=>a-b);k2=E(L(m,++y,bb),nx);}c[v]=0;c[bb]=1;if(k2>-1&&!X2.has(k2)){if(K2.length>=M){Q(u,0);return null}X2.add(k2);K2.push(k2);J.push([e,bb,v]);if(Z(nx)){f=K2.length-1;break;}}}}
Q(u,0)}
if(f<0)return null
const P2=[];for(let x=f;x;x=J[x][0])P2.unshift(x);
let M2='',p2=p,u2=[...b];
for(const x of P2){const[,a,o2]=J[x],d=o2-a;Q(u2,1);M2+=W2(p2,a-d);Q(u2,0);M2+='UDLR'[D.indexOf(d)];p2=a;u2[u2.indexOf(a)]=o2;}
return M2
function W2(a,b){if(a==b)return'';const p=s.fill(-1),Q=[a];p[a]=a;for(const u of Q){if(u==b)break;for(const j in D){const n=u+D[j];w(n)|p[n]+1||(p[n]=u,T[n]=j,Q.push(n));}}if(p[b]<0)throw 0;let s2='';for(let u=b;u!=a;u=p[u])s2='udlr'[T[u]]+s2;return s2}}
if(!z)return F(A,G,B,P,X)||F(A,G,B,P,8*X)||''
let p=P,M3='';
for(const R3 of z){const W=A.slice();for(const q of z)if(q!=R3)for(const b of q.d?q.g:q.b)W[b]=1;const z2=F(W,R3.g,R3.b,p,X)||F(W,R3.g,R3.b,p,8*X);if(z2==null)return'';M3+=z2;for(const C of z2)p+=D['udlrUDLR'.indexOf(C)&3];R3.d=1}
return M3}
for(const id of f.readdirSync(I)){f.mkdirSync(O+'/'+id,{recursive:true});f.writeFileSync(O+'/'+id+'/solution.txt',S(f.readFileSync(I+'/'+id+'/level.txt','utf8'))+'\n')}
