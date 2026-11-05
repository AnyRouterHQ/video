import json,os,sys,kokoro_onnx,soundfile as sf,numpy as np
M=os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx");V=os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
voice=sys.argv[1]; speed=float(sys.argv[2]); lines=json.load(open(sys.argv[3])); out=sys.argv[4]
k=kokoro_onnx.Kokoro(M,V); res=[]
for i,l in enumerate(lines):
    s,sr=k.create(l["say"],voice=voice,speed=speed)
    sf.write(f"{out}/{i:02d}.wav",s,sr); res.append(len(s)/sr)
print(json.dumps(res))
