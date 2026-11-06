import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { FRAMES } from "./presets.mjs";

export function encoder() {
  const ff = spawnSync("ffmpeg", ["-hide_banner", "-encoders"], {
    encoding: "utf8",
  });
  if (ff.status === 0 && ff.stdout.includes("libaom-av1")) return "ffmpeg";
  const av = spawnSync("avifenc", ["--version"], { encoding: "utf8" });
  if (av.status === 0) return "avifenc";
  throw new Error(
    "AV1 encoder with alpha needed: brew install libavif; or brew tap homebrew-ffmpeg/ffmpeg && brew install homebrew-ffmpeg/ffmpeg/ffmpeg",
  );
}
export function probe(file, expectedFrames = FRAMES) {
  const json = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "stream=index,codec_name,width,height,nb_frames",
        "-of",
        "json",
        file,
      ],
      { encoding: "utf8" },
    ),
  );
  const streams = json.streams ?? [];
  if (
    streams.length < 2 ||
    streams.some(
      (s) => s.codec_name !== "av1" || s.width !== 256 || s.height !== 256,
    ) ||
    !streams.some((s) => Number(s.nb_frames) === expectedFrames)
  )
    throw new Error("AVIF stream gate failed");
  return streams;
}
export function encode(dir, output, kind = encoder(), options = {}) {
  const frames = Array.from({ length: options.frames ?? FRAMES }, (_, i) =>
    path.join(dir, `f${String(i).padStart(3, "0")}.png`),
  );
  for (let retry = 0; retry < 4; retry++) {
    const args =
      kind === "ffmpeg"
        ? [
            "-v",
            "error",
            "-y",
            "-framerate",
            String(options.fps ?? 24),
            "-i",
            path.join(dir, "f%03d.png"),
            "-filter_complex",
            "[0:v]format=yuva444p,split[m][a];[a]alphaextract[al];[m]format=yuv420p[c]",
            "-map",
            "[c]",
            "-map",
            "[al]",
            "-c:v",
            "libaom-av1",
            "-crf",
            String(36 + retry * 4),
            "-b:v",
            "0",
            "-cpu-used",
            "4",
            "-row-mt",
            "1",
            output,
          ]
        : [
            "--fps",
            String(options.fps ?? 24),
            "--repetition-count",
            "infinite",
            "-y",
            "420",
            "-q",
            String(
              (options.quality ?? 60) - retry * (options.qualityStep ?? 16),
            ),
            "--qalpha",
            String(
              (options.alphaQuality ?? 80) - retry * (options.alphaStep ?? 0),
            ),
            "-s",
            String(options.speed ?? 6),
            "-j",
            "2",
            ...frames,
            output,
          ];
    execFileSync(kind === "ffmpeg" ? "ffmpeg" : "avifenc", args, {
      stdio: "ignore",
      maxBuffer: 16 * 1024 * 1024,
    });
    probe(output, frames.length);
    if (fs.statSync(output).size <= 60 * 1024) return fs.statSync(output).size;
  }
  throw new Error("AVIF exceeds 60 KB after quality retries");
}
