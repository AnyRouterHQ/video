import sys,glob
from PIL import Image
out=sys.argv[1]; cols=int(sys.argv[2]); w=int(sys.argv[3]); files=sys.argv[4:]
ims=[Image.open(f).convert('RGB') for f in files]; ims=[i.resize((w,int(i.height*w/i.width))) for i in ims]
h=max(i.height for i in ims); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h),'white')
for k,i in enumerate(ims): S.paste(i,((k%cols)*w,(k//cols)*h))
S.save(out)
