package com.quickpod.controller;

import com.google.gson.Gson;
import com.quickpod.service.AudioFetchService;
import com.quickpod.util.ProcessUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SummarizeController {

    @Autowired
    private AudioFetchService audioFetchService;

    private Gson gson = new Gson();

    @PostMapping(value = "/summarize", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String,Object> summarize(@RequestBody Map<String,String> body) throws Exception {
        String url = body.getOrDefault("url", "").trim();
        if (url.isEmpty()) {
            return error("Missing url parameter");
        }

        File wav = null;
        try {
            wav = audioFetchService.downloadAndExtractWav(url);

            // Call Python helper
            File outJson = Files.createTempFile("quickpod_out_", ".json").toFile();
            List<String> cmd = new ArrayList<>();
            cmd.add("python3");
            cmd.add("ml_helper/local_transcribe_summarize.py");
            cmd.add("--audio");
            cmd.add(wav.getAbsolutePath());
            cmd.add("--whisper-model");
            cmd.add("tiny");
            cmd.add("--summarize-model");
            cmd.add("t5-small");
            cmd.add("--out");
            cmd.add(outJson.getAbsolutePath());

            ProcessUtils.Result pres = ProcessUtils.run(cmd, null, 30 * 60 * 1000);
            if (pres.exitCode != 0) {
                throw new RuntimeException("Python helper failed:\nstdout: " + pres.stdout + "\nstderr: " + pres.stderr);
            }

            String json = Files.readString(outJson.toPath());
            Map parsed = gson.fromJson(json, Map.class);

            Map<String,Object> resp = new LinkedHashMap<>();
            resp.put("ok", true);
            resp.put("transcript", parsed.getOrDefault("transcript", ""));
            resp.put("summary", parsed.getOrDefault("summary", ""));
            resp.put("bullets", parsed.getOrDefault("bullets", Collections.emptyList()));
            return resp;
        } catch (Exception ex) {
            return error("Failed to process: " + ex.getMessage());
        }
    }

    private Map<String,Object> error(String msg) {
        Map<String,Object> m = new HashMap<>();
        m.put("ok", false);
        m.put("error", msg);
        return m;
    }
}
