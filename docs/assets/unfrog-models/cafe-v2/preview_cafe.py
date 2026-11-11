import bpy
from pathlib import Path

out=Path(r'D:\Projects\muazaoski.online\docs\assets\unfrog-models\cafe-v2')
model=bpy.data.collections['Unfrog Cafe v2'];rig=bpy.data.collections['Unfrog Cafe v2 Preview Rig']
scene=bpy.data.scenes.new('Unfrog Cafe v2 Preview');scene.collection.children.link(model);scene.collection.children.link(rig)
scene.camera=bpy.data.objects['Cafe_Preview_Camera'];scene.render.engine=bpy.context.scene.render.engine
scene.render.resolution_x=1280;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format=next(i.identifier for i in bpy.types.ImageFormatSettings.bl_rna.properties['file_format'].enum_items if i.name=='PNG (.png)')
scene.render.film_transparent=False
world=bpy.data.worlds.new('Cafe Preview World');world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.35,.4,.32,1);bg.inputs['Strength'].default_value=.45;scene.world=world
mesh=bpy.data.meshes.new('Preview ground mesh');mesh.from_pydata([(-30,-30,-.02),(30,-30,-.02),(30,30,-.02),(-30,30,-.02)],[],[(0,1,2,3)])
ground=bpy.data.objects.new('Cafe Preview Ground',mesh);rig.objects.link(ground);ground.location.x=24
mat=bpy.data.materials.new('UF_Preview_Ground');mat.use_nodes=True
bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Base Color'].default_value=(.43,.48,.39,1);bsdf.inputs['Roughness'].default_value=.95;mesh.materials.append(mat)
scene.render.filepath=str(out/'cafe-exterior.png');bpy.ops.render.render(write_still=True,scene=scene.name)
parts=['Cafe_Roof_Cutaway','Cafe_Wall_Front','Cafe_Wall_Right','Cafe_Sign','Cafe_Preview_Branding']
hidden=[]
for name in parts:
    group=bpy.data.objects[name]
    for obj in group.children_recursive:hidden.append((obj,obj.hide_render));obj.hide_render=True
try:
    scene.render.filepath=str(out/'cafe-interior.png');bpy.ops.render.render(write_still=True,scene=scene.name)
finally:
    for obj,value in hidden:obj.hide_render=value
print('Saved exterior and interior preview PNGs in',out)
print('Export format default:',bpy.ops.export_scene.gltf.get_rna_type().properties['export_format'].default)
