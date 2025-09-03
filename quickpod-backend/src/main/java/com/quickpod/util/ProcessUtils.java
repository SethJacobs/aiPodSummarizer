package com.quickpod.util;

import java.io.*;
import java.util.List;
import java.util.Arrays;

public class ProcessUtils {
    public static class Result {
        public final int exitCode;
        public final String stdout;
        public final String stderr;
        public Result(int exitCode, String stdout, String stderr) { this.exitCode = exitCode; this.stdout = stdout; this.stderr = stderr; }
    }

    public static Result run(List<String> cmd, File workdir, long timeoutMs) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        if (workdir != null) pb.directory(workdir);
        pb.redirectErrorStream(false);
        Process p = pb.start();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ByteArrayOutputStream err = new ByteArrayOutputStream();

        Thread tout = new Thread(() -> {
            try (InputStream is = p.getInputStream()) { is.transferTo(out); } catch (IOException ignored) {}
        });
        Thread terr = new Thread(() -> {
            try (InputStream is = p.getErrorStream()) { is.transferTo(err); } catch (IOException ignored) {}
        });
        tout.start();
        terr.start();

        boolean finished;
        if (timeoutMs > 0) {
            finished = p.waitFor(timeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS);
            if (!finished) {
                p.destroyForcibly();
                throw new RuntimeException("Timeout running: " + String.join(" ", cmd));
            }
        } else {
            p.waitFor();
        }

        tout.join();
        terr.join();

        int code = p.exitValue();
        String sout = out.toString();
        String serr = err.toString();
        return new Result(code, sout, serr);
    }

    /**
     * Validates the ML environment to ensure NumPy compatibility
     * @return true if environment is valid, false otherwise
     */
    public static boolean validateMLEnvironment() {
        try {
            File workdir = new File(".");
            Result result = run(Arrays.asList("python", "validate_ml_env.py"), workdir, 10000);
            return result.exitCode == 0;
        } catch (Exception e) {
            System.err.println("Failed to validate ML environment: " + e.getMessage());
            return false;
        }
    }
}
