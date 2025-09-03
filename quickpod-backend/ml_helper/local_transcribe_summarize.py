#!/usr/bin/env python3
"""
local_transcribe_summarize.py

Usage:
  python3 local_transcribe_summarize.py --audio /path/to/audio.wav --whisper-model small --out /tmp/out.json

This script:
  - runs Whisper (local) to transcribe an audio file
  - runs a HuggingFace summarization pipeline (local) on the transcript (chunking)
  - writes JSON: { "transcript": "...", "summary": "...", "bullets": [...] }
"""

import argparse, json, sys
from pathlib import Path

def ensure_imports():
    try:
        import whisper
        from transformers import pipeline
    except Exception as e:
        print("Missing Python packages. Please run: pip install -r requirements.txt", file=sys.stderr)
        raise

ensure_imports()

import whisper
from transformers import pipeline

def transcribe_whisper(audio_path: str, whisper_model: str):
    model = whisper.load_model(whisper_model)
    result = model.transcribe(audio_path, verbose=False)
    return result.get("text", "")

def chunk_text_by_chars(text: str, max_chars=1200):
    sentences = [s.strip() for s in text.replace("\n", " ").split(". ") if s.strip()]
    chunks = []
    cur = []
    cur_len = 0
    for s in sentences:
        slen = len(s) + 2
        if cur_len + slen > max_chars and cur:
            chunks.append(". ".join(cur) + ".")
            cur = [s]
            cur_len = slen
        else:
            cur.append(s)
            cur_len += slen
    if cur:
        chunks.append(". ".join(cur) + ".")
    return chunks

def split_to_bullets(text: str, max_bullets=5):
    import re
    sents = re.split(r'(?<=[.!?])\s+', text.strip())
    bullets = []
    for s in sents:
        clean = s.strip()
        if not clean:
            continue
        bullets.append(clean if clean.endswith(".") else clean + ".")
        if len(bullets) >= max_bullets:
            break
    if len(bullets) < max_bullets:
        parts = text.split(", ")
        for p in parts:
            if len(bullets) >= max_bullets: break
            if p.strip() not in bullets:
                bullets.append(p.strip() + ("" if p.strip().endswith(".") else "."))
    return bullets

def summarize_transcript(transcript: str, model_name="t5-small"):
    # For T5, we need to use text2text-generation pipeline
    if "t5" in model_name.lower():
        summarizer = pipeline("text2text-generation", model=model_name, device=-1)
        chunks = chunk_text_by_chars(transcript, max_chars=500)  # T5 has smaller context
        summaries = []
        for c in chunks:
            # T5 needs "summarize: " prefix
            prompt = f"summarize: {c}"
            out = summarizer(prompt, max_length=100, min_length=20, do_sample=False)
            summaries.append(out[0]["generated_text"])
        if len(summaries) == 1:
            final = summaries[0]
        else:
            concat = " ".join(summaries)
            prompt = f"summarize: {concat}"
            out = summarizer(prompt, max_length=150, min_length=40, do_sample=False)
            final = out[0]["generated_text"]
    else:
        # Original BART-style summarization
        summarizer = pipeline("summarization", model=model_name, device=-1)
        chunks = chunk_text_by_chars(transcript, max_chars=1000)
        summaries = []
        for c in chunks:
            out = summarizer(c, max_length=130, min_length=30, do_sample=False)
            summaries.append(out[0]["summary_text"])
        if len(summaries) == 1:
            final = summaries[0]
        else:
            concat = " ".join(summaries)
            out = summarizer(concat, max_length=180, min_length=60, do_sample=False)
            final = out[0]["summary_text"]
    
    bullets = split_to_bullets(final, max_bullets=5)
    return final, bullets, chunks, summaries

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True, help="Path to audio file (wav/mp3)")
    parser.add_argument("--whisper-model", default="small", help="Whisper model (tiny, small, medium...)")
    parser.add_argument("--summarize-model", default="t5-small", help="HF model for summarization")
    parser.add_argument("--out", required=True, help="Output JSON path")
    args = parser.parse_args()

    audio_path = args.audio
    whisper_model = args.whisper_model
    summarize_model = args.summarize_model
    out_path = args.out

    if not Path(audio_path).exists():
        print("Audio file not found: " + audio_path, file=sys.stderr)
        sys.exit(2)

    print("Transcribing with Whisper model:", whisper_model, file=sys.stderr)
    transcript = transcribe_whisper(audio_path, whisper_model)
    print(f"Transcript length: {len(transcript)} chars", file=sys.stderr)

    print("Summarizing with", summarize_model, file=sys.stderr)
    final_summary, bullets, chunks, chunk_summaries = summarize_transcript(transcript, model_name=summarize_model)

    result = {
        "transcript": transcript,
        "summary": final_summary,
        "bullets": bullets,
        "chunk_count": len(chunks),
        "chunk_summaries": chunk_summaries
    }

    Path(out_path).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote out to", out_path, file=sys.stderr)

if __name__ == "__main__":
    main()
