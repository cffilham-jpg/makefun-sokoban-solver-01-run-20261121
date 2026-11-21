import{mkdirSync as a,readdirSync as b,readFileSync as c,writeFileSync as d}from'node:fs';
import{join as e}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output',X=250e3;
function S(t){
const r=t.split('\n').filter(x=>x),h=r.length,w=Math.max(...r.map(x=>x.length)),N=w*h,A=new Uint8Array(N).fill(1),G=[];let B=[],P=-1;
r.forEach((y,j)=>{for(let x=0;x<y.length;x++){const z=y[x],i=j*w+x;if(z=='#')continue;A[i]=0;if('.*+'.includes(z))G.push(i);if('$*'.includes(z))B.push(i);if('@+'.includes(z))P=i;}});
for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!x||!y||x>w-2||y>h-2)A[y*w+x]=1;
B.sort((x,y)=>x-y);
const D=[-w,w,-1,1];
function V(W,g){const v=new Uint8Array(N),q=[...g];for(const x of g)v[x]=1;for(let i=0;i<q.length;i++)for(const d of D){const y=q[i]-d;if(!W[y]&&!W[y-d]&&!v[y]){v[y]=1;q.push(y);}}return v;}
function R(){const v=V(A,G),k=P/w|0,C=new Uint8Array(N);for(let i=k*w;i<k*w+w;i++)if(!A[i]&&!v[i])C[i]=1;if(B.some(b=>C[b]))return null;const p=new Int32Array(N).fill(-1),o=[];for(let s=0;s<N;s++){if(A[s]||C[s]||p[s]>-1)continue;const q=[s];p[s]=o.length;for(let i=0;i<q.length;i++)for(const d of D){const n=q[i]+d;if(!A[n]&&!C[n]&&p[n]<0){p[n]=o.length;q.push(n);}}o.push({b:[],g:[]});}for(const b of B)o[p[b]].b.push(b);for(const g of G)if(p[g]>-1)o[p[g]].g.push(g);if(G.some(g=>p[g]<0)||o.some(x=>x.b.length!=x.g.length))return null;return o.filter(x=>x.b.length);}
function F(W,g,b,p,M){const o=new Uint8Array(N);for(const x of g)o[x]=1;const Y=V(W,g);if(b.some(x=>!Y[x]))return null;const n=b.length,Z=a=>a.every(x=>o[x]),c=new Uint8Array(N),s=new Int32Array(N),m=new Int32Array(N),T=new Int32Array(N);let q=0,y=0;
function L(a,z,f){let l=f,n2=0;T[n2++]=f;a[f]=z;while(n2){const u=T[--n2];if(u<l)l=u;for(const d of D){const x=u+d;if(!W[x]&&!c[x]&&a[x]!=z){a[x]=z;T[n2++]=x;}}}return l;}
function K(u){for(const a of[u,u-1,u-w,u-w-1]){const e=a+1,C=a+w,d=C+1;if(!(W[a]||c[a])||!(W[e]||c[e])||!(W[C]||c[C])||!(W[d]||c[d]))continue;if(c[a]&&!o[a]||c[e]&&!o[e]||c[C]&&!o[C]||c[d]&&!o[d])return 1;}return 0;}
const E=(l,a)=>{let k=l;for(const x of a)k=k*N+x;return k;};
for(const x of b)c[x]=1;
const K2=[E(L(s,++q,p),b)],H=[-1],F2=[0],T2=[0],X2=new Map([[K2[0],0]]);
for(const x of b)c[x]=0;
let f=Z(b)?0:-1;
for(let e=0;f<0&&e<K2.length;e++){let k=K2[e];const u=new Array(n);for(let i=n-1;i>=0;i--){u[i]=k%N;k=(k-u[i])/N;}const l=k;
for(const x of u)c[x]=1;L(s,++q,l);const z=q;
for(let i=0;i<n&&f<0;i++){const bb=u[i];for(let j=0;j<4;j++){const d=D[j],v=bb+d;if(s[bb-d]!=z||W[v]||c[v]||!Y[v])continue;c[bb]=0;c[v]=1;let k2=-1,nx=null;if(!K(v)){nx=u.slice();nx[i]=v;nx.sort((a,b)=>a-b);k2=E(L(m,++y,bb),nx);}c[v]=0;c[bb]=1;if(k2<0||X2.has(k2))continue;if(K2.length>=M){for(const x of u)c[x]=0;return null;}X2.set(k2,K2.length);K2.push(k2);H.push(e);F2.push(bb);T2.push(v);if(Z(nx)){f=K2.length-1;break;}}}
for(const x of u)c[x]=0;}
if(f<0)return null;
const P2=[];for(let x=f;x>0;x=H[x])P2.push(x);P2.reverse();
let M2='',p2=p,u2=b.slice();
for(const x of P2){const a=F2[x],o2=T2[x],d=o2-a;for(const z of u2)c[z]=1;M2+=W2(p2,a-d);for(const z of u2)c[z]=0;M2+='UDLR'[D.indexOf(d)];p2=a;u2=u2.slice();u2[u2.indexOf(a)]=o2;u2.sort((x,y)=>x-y);}
return{pushes:P2.length,moves:M2};
function W2(a,b){if(a==b)return'';const p=new Int32Array(N).fill(-1),h=new Array(N),Q=[a];p[a]=a;for(let i=0;i<Q.length;i++){const u=Q[i];if(u==b)break;for(let j=0;j<4;j++){const n=u+D[j];if(W[n]||c[n]||p[n]>-1)continue;p[n]=u;h[n]='udlr'[j];Q.push(n);}}if(p[b]<0)throw new Error('x');let s='';for(let u=b;u!=a;u=p[u])s=h[u]+s;return s;}}
const o=R();
if(!o){const z=F(A,G,B,P,X)||F(A,G,B,P,8*X);return z?z.moves:'';}
let p=P,M3='';
for(const R3 of o){const W=A.slice();for(const q of o)if(q!=R3)for(const b of q.d?q.g:q.b)W[b]=1;const z=F(W,R3.g,R3.b,p,X)||F(W,R3.g,R3.b,p,8*X);if(!z)return'';M3+=z.moves;for(const C of z.moves.toLowerCase())p+=C=='u'?-w:C=='d'?w:C=='l'?-1:1;R3.d=1;}
return M3;}
for(const id of b(I).sort()){const m=S(c(e(I,id,'level.txt'),'utf8'));a(e(O,id),{recursive:true});d(e(O,id,'solution.txt'),m+'\n');}
