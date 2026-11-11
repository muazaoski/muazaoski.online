"""Bake evaluated geometry into material batches, keeping visibility groups separate."""
import bpy,re
from pathlib import Path
from mathutils import Vector

out=Path(r'D:\Projects\muazaoski.online\docs\assets\unfrog-models\cafe-v2')
path=out/'cafe-shell-v2.glb';blend=out/'cafe-v2.blend'
assert not path.exists() and not blend.exists(), 'Do not overwrite existing deliverables.'
source=bpy.data.objects['UF_Cafe_v2'];depsgraph=bpy.context.evaluated_depsgraph_get()
scene=bpy.data.scenes.new('Unfrog Cafe v2 Game Export')
parent=bpy.data.objects.new('UF_Cafe_v2_Game',None);scene.collection.objects.link(parent)
parent['floor_footprint']='14 x 16';parent['entrance_width']=3.2
parent['render_only']=True;parent['integration']='Keep existing game collision/placement, lamp logic and sign canvas; attach via logical_part extras.'
count=0
for group in source.children:
    if group.get('preview_only'):continue
    node=bpy.data.objects.new(group.name+'_Game',None);scene.collection.objects.link(node);node.parent=parent
    node['logical_part']=group.name
    if group.get('cutaway_part'):node['cutaway_part']=True
    buckets={}
    for obj in group.children_recursive:
        if obj.type!='MESH':continue
        evaluated=obj.evaluated_get(depsgraph);mesh=evaluated.to_mesh()
        try:
            transform=source.matrix_world.inverted() @ obj.matrix_world
            for face in mesh.polygons:
                mat=obj.data.materials[min(face.material_index,len(obj.data.materials)-1)]
                # The canvas is a distinct addressable mesh rather than merged with trim.
                key=(mat.name,obj.name if obj.get('customizable_sign') else '')
                verts,faces=buckets.setdefault(key,([],[]));start=len(verts)
                verts.extend(tuple(transform @ mesh.vertices[i].co) for i in face.vertices)
                faces.append(tuple(range(start,start+len(face.vertices))))
        finally:evaluated.to_mesh_clear()
    for (matname,part),(verts,faces) in buckets.items():
        name='Sign_Paint_Surface' if part else group.name+'_'+matname
        data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.materials.append(bpy.data.materials[matname]);data.update()
        obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.parent=node
        if part:
            obj['customizable_sign']=True
            # Front face gets full-board UVs compatible with the existing canvas.
            uv=data.uv_layers.new(name='UVMap')
            for face in data.polygons:
                for loop_index in face.loop_indices:
                    co=data.vertices[data.loops[loop_index].vertex_index].co
                    uv.data[loop_index].uv=((co.x+4.05)/8.1,(co.z-3.995)/1.85)
        data.calc_loop_triangles();count+=len(data.loop_triangles)
# Blender's dynamic RNA enum is empty here; read its own documented default.
fmt=re.search(r"export_format='([^']+)'",bpy.ops.export_scene.gltf.__doc__).group(1)
previous=bpy.context.window.scene
try:
    bpy.context.window.scene=scene
    result=bpy.ops.export_scene.gltf(filepath=str(path),export_format=fmt,use_active_scene=True,export_extras=True,export_cameras=False,export_lights=False)
    assert 'FINISHED' in result and path.is_file()
finally:bpy.context.window.scene=previous
root=bpy.data.objects['UF_Cafe_v2']
for obj in bpy.context.selected_objects:obj.select_set(False)
root.select_set(True);bpy.context.view_layer.objects.active=root
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            region=area.spaces.active.region_3d
            region.view_location=Vector((24,0,2));region.view_distance=28
            region.view_rotation=bpy.data.objects['Cafe_Preview_Camera'].rotation_euler.to_quaternion()
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
print('Game shell:',sum(o.type=='MESH' for o in scene.objects),'material batches;',count,'triangles;',path.stat().st_size,'bytes')
print('Saved:',path,blend)
