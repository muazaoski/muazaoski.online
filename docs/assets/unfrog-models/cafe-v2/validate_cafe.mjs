import fs from 'node:fs';
import assert from 'node:assert/strict';
const url=new URL('./cafe-shell-v2.glb',import.meta.url),buf=fs.readFileSync(url);
assert.equal(buf.readUInt32LE(0),0x46546c67);assert.equal(buf.readUInt32LE(4),2);assert.equal(buf.readUInt32LE(8),buf.length);
const gltf=JSON.parse(buf.subarray(20,20+buf.readUInt32LE(12)).toString());
assert.equal(gltf.scenes.length,1,'only the game shell scene, not original/preview scenes');
assert.equal(gltf.scenes[0].nodes.length,1,'one instanceable root');
const root=gltf.nodes[gltf.scenes[0].nodes[0]];
assert.deepEqual(root.translation||[0,0,0],[0,0,0],'no Blender preview offset in game asset');
assert.equal(root.extras.floor_footprint,'14 x 16');assert.equal(root.extras.entrance_width,3.2);
assert.ok(!gltf.nodes.some(n=>/Preview|Demo|^Cube$|Cashier|Chair|Stove/.test(n.name||'')),'no furniture, stage or user scene leaked into shell');
for(const name of ['Cafe_Floor','Cafe_Wall_Back','Cafe_Wall_Left','Cafe_Wall_Right','Cafe_Wall_Front','Cafe_Door_Frame','Cafe_Roof_Cutaway','Cafe_Sign'])assert.ok(gltf.nodes.some(n=>n.extras?.logical_part===name),name+' preserved');
for(const name of ['Cafe_Wall_Back','Cafe_Wall_Left','Cafe_Wall_Right','Cafe_Wall_Front','Cafe_Roof_Cutaway'])assert.equal(gltf.nodes.find(n=>n.extras?.logical_part===name).extras.cutaway_part,true);
const sign=gltf.nodes.find(n=>n.extras?.customizable_sign);assert.ok(sign);assert.ok(gltf.meshes[sign.mesh].primitives.every(p=>p.attributes.TEXCOORD_0!==undefined),'customizable sign has UVs');
assert.ok(gltf.materials.every(m=>(m.alphaMode||'OPAQUE')==='OPAQUE'),'solid walls/window insert; visibility controls cutaway');
let triangles=0,primitives=0;
for(const mesh of gltf.meshes)for(const p of mesh.primitives){assert.equal(p.mode||4,4);assert.ok(p.attributes.NORMAL!==undefined);triangles+=gltf.accessors[p.indices].count/3;primitives++;}
assert.equal(triangles,5000);assert.equal(gltf.meshes.length,40);assert.ok(buf.length<350000);
const floor=gltf.nodes.find(n=>n.extras?.logical_part==='Cafe_Floor');const bounds=[[],[]];
for(const index of floor.children){const n=gltf.nodes[index];for(const p of gltf.meshes[n.mesh].primitives){const a=gltf.accessors[p.attributes.POSITION];bounds[0].push(a.min);bounds[1].push(a.max);}}
const min=[0,1,2].map(i=>Math.min(...bounds[0].map(b=>b[i]))),max=[0,1,2].map(i=>Math.max(...bounds[1].map(b=>b[i])));
assert.ok(Math.abs(max[0]-min[0]-14)<.01);assert.ok(Math.abs(max[2]-min[2]-16)<.01,'Y-up ground footprint 14x16');
console.log(JSON.stringify({status:'PASS',meshes:gltf.meshes.length,primitives,triangles,bytes:buf.length,floorBounds:{min,max},modularCutaway:true,uvSign:true,noPreviewOrUserObjects:true},null,2));
