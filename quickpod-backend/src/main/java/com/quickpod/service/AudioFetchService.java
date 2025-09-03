package com.quickpod.service;

import com.quickpod.util.ProcessUtils;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AudioFetchService {

    // Use yt-dlp to download the best audio and ffmpeg to convert to wav
    public File downloadAndExtractWav(String url) throws Exception {
        String id = UUID.randomUUID().toString();
        File tmpDir = Files.createTempDirectory("quickpod_" + id).toFile();

        // 1) run yt-dlp to get audio file in best audio format (let it choose)
        File outTemplate = new File(tmpDir, "audio.%(ext)s");
        List<String> cmd1 = new ArrayList<>();
        cmd1.add("yt-dlp");  // ensure yt-dlp is in PATH
        cmd1.add("-x");
        cmd1.add("--audio-format");
        cmd1.add("wav"); // request wav, yt-dlp will invoke ffmpeg to create wav if available
        cmd1.add("-o");
        cmd1.add(outTemplate.getAbsolutePath());
        cmd1.add(url);

        ProcessUtils.Result r1 = ProcessUtils.run(cmd1, tmpDir, 10 * 60 * 1000);
        if (r1.exitCode != 0) {
            throw new RuntimeException("yt-dlp failed: " + r1.stderr);
        }

        // find the wav file produced
        File[] files = tmpDir.listFiles((d, name) -> name.toLowerCase().endsWith(".wav") || name.toLowerCase().endsWith(".m4a") || name.toLowerCase().endsWith(".mp3"));
        if (files == null || files.length == 0) {
            throw new RuntimeException("No audio file produced by yt-dlp in " + tmpDir.getAbsolutePath());
        }

        // prefer wav if present
        File wav = null;
        for (File f : files) {
            if (f.getName().toLowerCase().endsWith(".wav")) { wav = f; break; }
        }
        if (wav == null) wav = files[0];

        // If file is not wav, convert to wav using ffmpeg
        if (!wav.getName().toLowerCase().endsWith(".wav")) {
            File wavOut = new File(tmpDir, "audio_converted.wav");
            List<String> conv = new ArrayList<>();
            conv.add("ffmpeg");
            conv.add("-y");
            conv.add("-i");
            conv.add(wav.getAbsolutePath());
            conv.add("-ar");
            conv.add("16000");
            conv.add("-ac");
            conv.add("1");
            conv.add(wavOut.getAbsolutePath());
            ProcessUtils.Result rconv = ProcessUtils.run(conv, tmpDir, 2 * 60 * 1000);
            if (rconv.exitCode != 0) {
                throw new RuntimeException("ffmpeg conversion failed: " + rconv.stderr);
            }
            wav = wavOut;
        }

        return wav;
    }
}
