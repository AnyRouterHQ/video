"""music.py <pid> <length_s> : one original instrumental bed from the ElevenLabs Music API -> audio/music/<pid>.mp3 + .wav (48 kHz).
Prompt and settings are saved next to it (<pid>.json). The API key is read from the anyrouter env file and never printed."""
import json, os, subprocess, sys, urllib.error, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import api_key, FF, ROOT

PROMPT = ("Original instrumental for a calm, modern tech product recap video. Upbeat but relaxed electronic, steady 118 BPM, "
          "soft four-on-the-floor kick, warm analog synth pads, a light plucked arpeggio, gentle hi-hats, round sub bass. "
          "Clean start, even energy with no big drops or builds, leaves room for a narrator, "
          "and ends by resolving on a sustained major chord that fades out. No vocals.")

def compose(pid, length_s):
    d = f"{ROOT}/audio/music"; os.makedirs(d, exist_ok=True)
    body = {"prompt": PROMPT, "music_length_ms": int(round(length_s * 1000)), "model_id": "music_v1", "force_instrumental": True}
    req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192", data=json.dumps(body).encode(),
                                 headers={"xi-api-key": api_key(), "content-type": "application/json", "user-agent": "curl/8.5.0"})
    try:
        r = urllib.request.urlopen(req, timeout=600)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"music API {e.code}: {e.read()[:400].decode(errors='replace')}")
    mp3 = f"{d}/{pid}.mp3"; open(mp3, "wb").write(r.read())
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", mp3, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", f"{d}/{pid}.wav"], check=True)
    json.dump({**body, "endpoint": "POST /v1/music", "output_format": "mp3_44100_192", "song_id": r.headers.get("song-id")}, open(f"{d}/{pid}.json", "w"), indent=1)
    print(pid, "ok", os.path.getsize(mp3), "bytes")

if __name__ == "__main__":
    compose(sys.argv[1], float(sys.argv[2]))
