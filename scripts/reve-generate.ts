#!/usr/bin/env npx tsx
/**
 * reve-generate.ts
 *
 * CLI tool for generating game assets via the AIML API proxy for Reve.
 *
 * Usage:
 *   npx tsx scripts/reve-generate.ts --type bg --game manna-catch --prompt "..." --output public/sprites/manna-catch/bg-sky.png
 *
 * Options:
 *   --type     bg (1024x1024 background), icon (512x512 game icon), edit (edit existing image)
 *   --game     Game slug (for logging/organization)
 *   --prompt   Text prompt describing the desired image
 *   --output   Output file path for the generated image
 *   --input    (edit only) Path to the source image to edit
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = "https://api.aimlapi.com/v1/images/generations";
const MODEL_CREATE = "reve/create-image";
const MODEL_EDIT = "reve/edit-image";
const COST_ESTIMATE = 0.04; // USD per image

const TYPE_CONFIG: Record<string, { aspect_ratio: string; label: string }> = {
  bg: { aspect_ratio: "1:1", label: "background" },
  icon: { aspect_ratio: "1:1", label: "game icon" },
  edit: { aspect_ratio: "1:1", label: "image edit" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), ".env");
  const vars: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return vars;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--") && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

function printUsage(): void {
  console.log(`
Reve Asset Generator (AIML API)

Usage:
  npx tsx scripts/reve-generate.ts --type <type> --game <slug> --prompt "<text>" --output <path>

Types:
  bg     Background image (1024x1024)
  icon   Game icon (512x512)
  edit   Edit an existing image (requires --input)

Options:
  --type     Required. One of: bg, icon, edit
  --game     Required. Game slug for logging (e.g. manna-catch)
  --prompt   Required. Text prompt for generation
  --output   Required. Output file path (e.g. public/sprites/manna-catch/bg-sky.png)
  --input    Required for edit type. Path to source image

Examples:
  npx tsx scripts/reve-generate.ts --type bg --game manna-catch --prompt "bright cartoon sky with fluffy clouds" --output public/sprites/manna-catch/bg-sky.png
  npx tsx scripts/reve-generate.ts --type icon --game manna-catch --prompt "golden basket catching manna, game icon style" --output public/sprites/manna-catch/icon.png
  npx tsx scripts/reve-generate.ts --type edit --game manna-catch --input public/sprites/manna-catch/bg-sky.png --prompt "add rainbow in the sky" --output public/sprites/manna-catch/bg-sky-v2.png

Environment:
  AIML_API_KEY   Required. Set in .env file or as environment variable.
`);
}

function imageToBase64(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: Input image not found: ${resolved}`);
    process.exit(1);
  }
  const buffer = fs.readFileSync(resolved);
  return buffer.toString("base64");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Validate required args
  const missing: string[] = [];
  if (!args.type) missing.push("--type");
  if (!args.game) missing.push("--game");
  if (!args.prompt) missing.push("--prompt");
  if (!args.output) missing.push("--output");

  if (missing.length > 0 || !TYPE_CONFIG[args.type]) {
    if (missing.length > 0) {
      console.error(`Missing required arguments: ${missing.join(", ")}`);
    }
    if (args.type && !TYPE_CONFIG[args.type]) {
      console.error(`Invalid type "${args.type}". Must be one of: ${Object.keys(TYPE_CONFIG).join(", ")}`);
    }
    printUsage();
    process.exit(1);
  }

  if (args.type === "edit" && !args.input) {
    console.error("Missing required argument: --input (required for edit type)");
    printUsage();
    process.exit(1);
  }

  // Load API key
  const envVars = loadEnv();
  const apiKey = process.env.AIML_API_KEY || envVars.AIML_API_KEY;

  if (!apiKey) {
    console.error("Error: AIML_API_KEY not found.");
    console.error("Set it in your .env file or as an environment variable.");
    process.exit(1);
  }

  const config = TYPE_CONFIG[args.type];
  const model = args.type === "edit" ? MODEL_EDIT : MODEL_CREATE;

  console.log(`\n--- Reve Asset Generator ---`);
  console.log(`Game:   ${args.game}`);
  console.log(`Type:   ${config.label} (${config.aspect_ratio})`);
  console.log(`Model:  ${model}`);
  console.log(`Prompt: ${args.prompt}`);
  console.log(`Output: ${args.output}`);
  if (args.type === "edit") {
    console.log(`Input:  ${args.input}`);
  }
  console.log();

  // Build request body
  // Reve API uses aspect_ratio (not size) and convert_base64_to_url (not response_format).
  // We request base64 directly to avoid CDN placeholder issues.
  const body: Record<string, unknown> = {
    model,
    prompt: args.prompt,
    aspect_ratio: config.aspect_ratio,
    convert_base64_to_url: false,
  };

  if (args.type === "edit" && args.input) {
    // AIML edit endpoint expects image_url (a URL or a base64 data URI), not a raw `image` field.
    body.image_url = `data:image/png;base64,${imageToBase64(args.input)}`;
  }

  const startTime = Date.now();

  console.log("Generating image...");

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Error: Failed to connect to AIML API.");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error: API returned ${response.status} ${response.statusText}`);
    console.error(errorText);
    process.exit(1);
  }

  const result = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };

  if (!result.data || result.data.length === 0) {
    console.error("Error: API returned no image data.");
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const imageData = result.data[0];
  const imageUrl = imageData.url;
  const imageB64 = imageData.b64_json;

  if (!imageUrl && !imageB64) {
    console.error("Error: API response missing both url and b64_json.");
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(path.resolve(args.output));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  // Download or decode the image
  const outputPath = path.resolve(args.output);

  if (imageB64) {
    // Decode base64 response
    const buffer = Buffer.from(imageB64, "base64");
    fs.writeFileSync(outputPath, buffer);
  } else if (imageUrl) {
    // Download from URL with polling for CDN readiness.
    // The Reve API returns a CDN URL immediately, but complex prompts may take
    // time to generate. The CDN serves a tiny 8x8 placeholder (93 bytes) until
    // the real image is ready. We poll until we get a file larger than 1 KB.
    console.log(`Downloading from: ${imageUrl}`);
    const MIN_VALID_SIZE = 1024; // 1 KB, real images are 50 KB+
    const MAX_POLL_ATTEMPTS = 30; // 30 attempts
    const POLL_INTERVAL_MS = 5000; // 5 seconds between polls
    let buffer: Buffer | null = null;

    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
      let imgResponse: Response;
      try {
        imgResponse = await fetch(imageUrl);
      } catch (err) {
        console.error("Error: Failed to download generated image.");
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }

      if (!imgResponse.ok) {
        console.error(`Error: Image download failed with ${imgResponse.status}`);
        process.exit(1);
      }

      const arrayBuffer = await imgResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      if (buffer.length >= MIN_VALID_SIZE) {
        if (attempt > 1) {
          console.log(`Image ready after ${attempt} attempts.`);
        }
        break;
      }

      if (attempt === MAX_POLL_ATTEMPTS) {
        console.error(`Error: CDN image still a placeholder after ${MAX_POLL_ATTEMPTS} attempts (${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000)}s).`);
        console.error(`Got ${buffer.length} bytes. The generation may have failed upstream.`);
        process.exit(1);
      }

      if (attempt === 1) {
        console.log(`Image not ready yet (${buffer.length} bytes). Polling CDN...`);
      }
      process.stdout.write(`  Attempt ${attempt}/${MAX_POLL_ATTEMPTS}...\r`);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    if (buffer) {
      fs.writeFileSync(outputPath, buffer);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\nDone.`);
  console.log(`  File:     ${outputPath}`);
  console.log(`  Size:     ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
  console.log(`  Time:     ${elapsed}s`);
  console.log(`  Est cost: ~$${COST_ESTIMATE.toFixed(2)}`);
  console.log();
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
