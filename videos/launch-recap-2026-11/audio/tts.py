"""tts.py <voice_id> <text...> | --lines  : ElevenLabs TTS with timestamps, cached per (voice|model|settings|text).
Writes audio/vo-cache/<key>.wav (48 kHz mono) and <key>.json (word timings, seconds). Key is ELEVENLABS_API_KEY from the environment,
else from $ANYROUTER_ENV (default: the anyrouter checkout's .env.production.local); never printed."""
import base64, hashlib, json, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = f"{ROOT}/audio/vo-cache"; os.makedirs(CACHE, exist_ok=True)
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.32, "similarity_boost": 0.8, "style": 0.55, "use_speaker_boost": True, "speed": 1.08}
FF = "/usr/lib/jellyfin-ffmpeg/ffmpeg"

def api_key():
    if os.environ.get("ELEVENLABS_API_KEY"): return os.environ["ELEVENLABS_API_KEY"]
    for l in open(os.environ.get("ANYROUTER_ENV", os.path.expanduser("~/project/anyrouter-dev/anyrouter/.env.production.local"))):
        if l.startswith("ELEVENLABS_API_KEY="): return l.split("=", 1)[1].strip().strip("\"'")
    raise SystemExit("no ELEVENLABS_API_KEY")

def key(voice, say): return hashlib.sha1(json.dumps([voice, MODEL, SETTINGS, say], sort_keys=True).encode()).hexdigest()[:16]

def words(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur, s0 = [], "", None
    for c, a, b in zip(chars, st, en):
        if c.isspace():
            if cur: out.append({"w": cur, "s": s0, "e": prev}); cur = ""
            continue
        if not cur: s0 = a
        cur += c; prev = b
    if cur: out.append({"w": cur, "s": s0, "e": prev})
    return out

def tts(voice, say):
    k = key(voice, say); wav = f"{CACHE}/{k}.wav"
    if os.path.exists(wav): return k
    body = json.dumps({"text": say, "model_id": MODEL, "voice_settings": SETTINGS}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
                                 data=body, headers={"xi-api-key": api_key(), "content-type": "application/json", "user-agent": "curl/8.5.0", "accept": "*/*"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    mp3 = f"{CACHE}/{k}.mp3"; open(mp3, "wb").write(base64.b64decode(r["audio_base64"]))
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", mp3, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", wav], check=True)
    json.dump({"say": say, "voice": voice, "words": words(r["normalized_alignment"] or r["alignment"])}, open(f"{CACHE}/{k}.json", "w"))
    print("tts", voice[:6], len(say), "chars:", say[:50], flush=True)
    return k

if __name__ == "__main__":
    print(tts(sys.argv[1], " ".join(sys.argv[2:])))
