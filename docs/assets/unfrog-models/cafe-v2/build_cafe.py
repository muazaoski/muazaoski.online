"""Blender authoring script. Separate preview furniture; shell fits existing 14x16 café."""
import bpy, math
from mathutils import Vector

assert not bpy.data.objects.get('UF_Cafe_v2'), 'Existing v2 model found; preserve it.'
collection=bpy.data.collections.new('Unfrog Cafe v2');bpy.context.scene.collection.children.link(collection)
root=bpy.data.objects.new('UF_Cafe_v2',None);collection.objects.link(root);root.location=(24,0,0)
root['floor_footprint']='14 x 16';root['entrance_width']=3.2;root['integration']='Blender Z up exports glTF Y up; front Blender -Y becomes game +Z'

def group(name):
    obj=bpy.data.objects.new(name,None);collection.objects.link(obj);obj.parent=root;return obj
floor=group('Cafe_Floor');back=group('Cafe_Wall_Back');left=group('Cafe_Wall_Left');right=group('Cafe_Wall_Right');front=group('Cafe_Wall_Front')
door=group('Cafe_Door_Frame');roof=group('Cafe_Roof_Cutaway');sign=group('Cafe_Sign');demo=group('Cafe_Preview_Furniture');branding=group('Cafe_Preview_Branding')
for obj in [front,left,right,back,roof]:obj['cutaway_part']=True
demo['preview_only']=True;branding['preview_only']=True

def material(name,color,roughness=.75,metal=0,emission=0):
    mat=bpy.data.materials.new('UF_'+name);mat.use_nodes=True
    node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    rgb=tuple(int(color[i:i+2],16)/255 for i in (0,2,4))
    # UI hex is sRGB; node colors are linear.
    linear=tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)
    node.inputs['Base Color'].default_value=(*linear,1);node.inputs['Roughness'].default_value=roughness;node.inputs['Metallic'].default_value=metal
    if emission:node.inputs['Emission Color'].default_value=(*linear,1);node.inputs['Emission Strength'].default_value=emission
    mat.diffuse_color=(*linear,1);return mat
cream=material('Wall_Cream','E6DDC6');green=material('Jade_Paint','365E4D');deep=material('Deep_Green','17382E');mint=material('Sage_Paint','90AC93');wood=material('Honey_Oak','AB7950');wood2=material('Oak_Light','BD8F64');darkwood=material('Walnut','614630');coral=material('Terracotta','BD7155');glass=material('Window_Blue','9EBBBC',.28,.08);gold=material('Brass','C8A564',.35,.55);ink=material('Lettering','F2E7CC');lightmat=material('Warm_Lamp','FFE3A4',.45,0,.5);leaf=material('Leaf','58814C');leaf2=material('Leaf_Light','86A463');soil=material('Soil','514235');ceramic=material('Ceramic','E8DCC2',.4);metal=material('Stove_Metal','4A5550',.42,.35)

def adopt(obj,name,parent,mat):
    obj.name=name
    for c in list(obj.users_collection):c.objects.unlink(obj)
    collection.objects.link(obj);obj.parent=parent
    if mat:obj.data.materials.append(mat)
    return obj
def box(name,pos,size,mat,parent,bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0));obj=adopt(bpy.context.object,name,parent,mat);obj.location=pos
    for v in obj.data.vertices:v.co.x*=size[0];v.co.y*=size[1];v.co.z*=size[2]
    if bevel:
        mod=obj.modifiers.new('Soft crafted edges','BEVEL');mod.width=bevel;mod.segments=1
    return obj
def cyl(name,pos,radius,depth,mat,parent,vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=(0,0,0));obj=adopt(bpy.context.object,name,parent,mat);obj.location=pos;return obj
def ball(name,pos,size,mat,parent):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(0,0,0));obj=adopt(bpy.context.object,name,parent,mat);obj.location=pos;obj.scale=size;return obj
def text(name,value,pos,size,mat,parent):
    data=bpy.data.curves.new(name,'FONT');data.body=value;data.align_x='CENTER';data.align_y='CENTER';data.size=size;data.extrude=.006;data.space_character=1.12
    obj=bpy.data.objects.new(name,data);collection.objects.link(obj);obj.parent=parent;obj.location=pos;obj.rotation_euler=(math.pi/2,0,0);data.materials.append(mat);return obj

box('Foundation',(0,0,.055),(14,16,.11),darkwood,floor,.05)
for i in range(16):box('Oak floor plank %02d'%i,(0,-7.5+i,.135),(13.95,.97,.055),wood2 if i%3==0 else wood,floor,.006)
# Opaque walls: transparency is never used to fake the indoor cutaway.
for obj,pos,size in [(back,(0,8,2.02),(14,.26,3.82)),(left,(-7,0,2.02),(.26,16,3.82)),(right,(7,0,2.02),(.26,16,3.82))]:
    box(obj.name+'_Paint',pos,size,cream,obj)
    axis=1 if obj==back else 0
    p=list(pos);p[2]=.59;s=list(size);s[axis]=.30;s[2]=.9;box(obj.name+'_Wainscot',p,s,green,obj)
    p[2]=1.08;s[axis]=.34;s[2]=.08;box(obj.name+'_Chair_Rail',p,s,wood,obj,.015)
    p[2]=3.89;s[axis]=.32;s[2]=.14;box(obj.name+'_Crown',p,s,deep,obj,.018)
    p[2]=.23;s[axis]=.32;s[2]=.16;box(obj.name+'_Skirting',p,s,darkwood,obj,.012)
# Front facade has actual openings around the window inserts.
for x in [-4.3,4.3]:
    box('Front sill wall',(x,-8,.69),(5.4,.3,1.1),green,front)
    box('Front header wall',(x,-8,3.54),(5.4,.3,.78),cream,front)
    for px in [x-2.43,x+2.43]:box('Window masonry pier',(px,-8,2.19),(.54,.3,1.98),cream,front)
    box('Window frame',(x,-8.15,2.2),(4.4,.16,1.95),darkwood,front)
    box('Window opaque glass',(x,-8.245,2.2),(4.12,.045,1.65),glass,front,.015)
    for px in [x-2.12,x,x+2.12]:box('Window upright',(px,-8.29,2.2),(.085,.06,1.75),ink,front,.012)
    for z in [1.34,2.2,3.07]:box('Window crossbar',(x,-8.29,z),(4.32,.06,.085),ink,front,.012)
    box('Window oak sill',(x,-8.3,1.28),(4.7,.5,.12),wood,front)
for x in [-7,-1.6,1.6,7]:box('Facade post',(x,-8.18,2.01),(.18,.2,3.85),darkwood,door)
box('Entrance lintel',(0,-8.15,3.15),(3.35,.3,.22),wood,door)
box('Above doorway',(0,-8,3.64),(3.2,.3,.58),cream,front)
box('Door threshold',(0,-8.02,.18),(3.05,.6,.12),wood,door,.018)
box('Open door',(-1.39,-7.35,1.61),(.16,1.25,2.85),green,door)
box('Door glass',(-1.49,-7.35,1.96),(.045,.94,1.5),glass,door,.018)
cyl('Door brass handle',(-1.51,-7.86,1.54),.07,.16,gold,door,8).rotation_euler=(0,math.pi/2,0)
# Roof/awning is one explicitly separable gameplay visibility group.
box('Rounded roof fascia',(0,0,4.03),(14.7,16.7,.3),deep,roof,.1)
box('Jade standing seam roof',(0,0,4.21),(14.5,16.5,.15),green,roof,.06)
for x in range(-6,7,2):box('Roof seam',(x,0,4.31),(.05,16.22,.055),mint,roof,.012)
for i in range(14):
    x=-6.5+i;obj=box('Awning stripe %02d'%i,(x,-8.78,3.3),(.99,1.55,.12),ink if i%2==0 else green,roof,.015);obj.rotation_euler.x=math.radians(9)
    box('Awning valance %02d'%i,(x,-9.53,3.06),(.99,.1,.22),ink if i%2==0 else green,roof,.025)
# Keep the editable canvas panel separate from preview lettering.
box('Sign timber frame',(0,-8.24,4.92),(8.5,.24,2.25),darkwood,sign,.09)
box('Sign cream inset',(0,-8.38,4.92),(8.1,.045,1.85),cream,sign,.02)
box('Sign paint surface',(0,-8.412,4.92),(8.1,.005,1.85),cream,sign,0)['customizable_sign']=True
text('Preview cafe name','FROGSTEAD',(0,-8.44,5.13),.7,deep,branding)
text('Preview cafe subtitle','POND-TO-TABLE CAFE',(0,-8.44,4.59),.23,darkwood,branding)
for x in [-6.4,6.4]:
    box('Entrance planter',(x,-8.85,.47),(1,.85,.64),coral,door,.06);box('Planter soil',(x,-8.85,.805),(.85,.72,.025),soil,door,.01)
    for dx,dy,z in [(-.23,0,1.09),(.2,.1,1.16),(0,-.12,1.4)]:ball('Planter leaf',(x+dx,-8.85+dy,z),(.3,.25,.42),leaf if dx else leaf2,door)

# Separate demo furnishings; the game keeps ownership, inventory and placement.
box('Demo stove base',(-4,4,.89),(2,2,1.5),green,demo,.06);box('Demo stove top',(-4,4,1.68),(2.15,2.15,.12),metal,demo)
for x in [-4.65,-3.35]:cyl('Stove dial',(x,2.94,1.29),.11,.09,gold,demo,10).rotation_euler=(math.pi/2,0,0)
box('Stove oven inset',(-4,2.98,.8),(1.55,.05,.55),deep,demo,.025);box('Stove handle',(-4,2.86,1.04),(1.3,.12,.07),gold,demo,.015)
cyl('One burner',(-4,4,1.79),.47,.05,deep,demo);cyl('Soup pot',(-4,4,2.0),.35,.4,ceramic,demo);cyl('Pot lid',(-4,4,2.22),.38,.06,green,demo)
box('Cashier oak top',(-1,4,1.59),(2.8,1.8,.17),wood2,demo,.055);box('Cashier base',(-1,4,.87),(2.6,1.6,1.35),cream,demo)
for x in [-1.8,-1.4,-1,-.6,-.2]:box('Cashier slat',(x,3.15,.93),(.24,.045,1.1),wood,demo,.008)
box('Cash register',(-.5,4,1.93),(.72,.65,.54),deep,demo);box('Register face',(-.5,3.65,2.01),(.53,.04,.24),mint,demo,.015)
box('Serving oak top',(-4,-1,1.22),(3.4,1.8,.16),wood2,demo,.045)
for x in [-5.25,-2.75]:box('Serving trestle',(x,-1,.72),(.18,1.4,.95),deep,demo,.02)
for x in [-4.8,-3.2]:box('Serving tray',(x,-1,1.35),(1.25,1.2,.1),ceramic,demo,.04)
box('Dining tabletop',(2,-1,1.3),(2.2,2,.18),wood2,demo,.055)
cyl('Dining pedestal',(2,-1,.71),.2,1.05,deep,demo);cyl('Dining foot',(2,-1,.22),.64,.1,deep,demo)
for cy,angle in [(1,math.pi),(-3,0)]:
    seat=box('Chair seat',(2,cy,.8),(1.18,1.1,.18),coral,demo,.07)
    for x in [1.56,2.44]:
        for y in [cy-.36,cy+.36]:box('Chair leg',(x,y,.48),(.12,.12,.53),darkwood,demo,.012)
    by=cy+(.5 if angle else -.5);box('Chair curved-look back',(2,by,1.46),(1.18,.16,1.03),coral,demo,.07)
for x,y in [(-4.2,-1),(2,-1)]:
    cyl('Demo bowl',(x,y,1.48),.32,.16,ceramic,demo);ball('Demo greens',(x,y,1.63),(.24,.24,.12),leaf2,demo)
box('Wall poster frame',(3.9,7.81,2.48),(1.45,.1,1.7),darkwood,demo)
box('Wall poster',(3.9,7.74,2.48),(1.25,.04,1.48),ink,demo)
ball('Poster lily emblem',(3.9,7.7,2.56),(.4,.025,.4),leaf,demo)
for x,y in [(-4,4),(2,-1)]:
    cyl('Pendant cord',(x,y,3.6),.025,.65,deep,demo,8)
    cyl('Pendant shade',(x,y,3.17),.48,.28,coral,demo)
    cyl('Pendant diffuser',(x,y,3.02),.42,.025,lightmat,demo)

# An isolated preview camera/light rig leaves the user's default scene intact.
stage=bpy.data.collections.new('Unfrog Cafe v2 Preview Rig');bpy.context.scene.collection.children.link(stage)
def area(name,loc,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);stage.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((24,0,1))-obj.location).to_track_quat('-Z','Y').to_euler();return obj
area('Cafe softbox',(16,-10,16),2300,10);area('Cafe fill',(34,-4,10),1700,9);area('Cafe rim',(26,10,14),2200,8)
camera=bpy.data.objects.new('Cafe_Preview_Camera',bpy.data.cameras.new('Cafe_Preview_Camera'));stage.objects.link(camera);camera.location=(45,-25,22);camera.rotation_euler=(Vector((24,0,1.8))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=28
for obj in bpy.context.selected_objects:obj.select_set(False)
root.select_set(True);bpy.context.view_layer.objects.active=root
bpy.context.view_layer.update()
print('Created cafe v2:',len(collection.objects),'objects. Original Cube/Camera/Light preserved.')
print('Opaque walls; modular cutaway roof/sides; editable sign; preview furnishings separate.')
