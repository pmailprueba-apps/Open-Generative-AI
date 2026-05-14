import { spawn } from "child_process";

const audioPath = process.argv[2];
const lang = process.argv[3] || "es";

const model = "medium";

const pythonCode = `
from faster_whisper import WhisperModel

model = WhisperModel("${model}", compute_type="int8")
segments, info = model.transcribe("${audioPath}", language="${lang}")

result = []
for segment in segments:
    result.append(segment.text)

print("TRANSCRIBE_RESULT:" + " ".join(result))
`;

const proc = spawn("/usr/local/bin/python3.11", ["-c", pythonCode]);

let result = "";
let error = "";

proc.stdout.on("data", (data) => {
  result += data.toString();
});

proc.stderr.on("data", (data) => {
  error += data.toString();
});

proc.on("close", (code) => {
  if (code === 0) {
    process.stdout.write(result);
  } else {
    process.stderr.write(error);
    process.exit(1);
  }
});