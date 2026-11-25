"""stt.py <audio file> [start_s dur_s] : ElevenLabs speech-to-text (scribe_v1) as a listening check.
Prints the transcript. The API key is read from the anyrouter .env.production.local and never printed."""
import json, subprocess, sys, tempfile, urllib.request, uuid, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import api_key, FF

def stt(path, ss=None, dur=None):
    src = path
    if ss is not None:
        src = tempfile.mktemp(suffix=".mp3")
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", path, "-ac", "1", src], check=True)
    b = uuid.uuid4().hex; data = open(src, "rb").read()
    body = (f"--{b}\r\nContent-Disposition: form-data; name=\"model_id\"\r\n\r\nscribe_v1\r\n"
            f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n").encode() + data + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request("https://api.elevenlabs.io/v1/speech-to-text", data=body,
                                 headers={"xi-api-key": api_key(), "content-type": f"multipart/form-data; boundary={b}", "user-agent": "curl/8.5.0"})
    return json.load(urllib.request.urlopen(req, timeout=120))["text"]

if __name__ == "__main__":
    a = sys.argv[1:]
    print(stt(a[0], *(float(x) for x in a[1:3])) if len(a) > 1 else stt(a[0]))
