#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const overridesPath = path.join(repoRoot, "data", "project-overrides.json");
const snapshotPath = path.join(repoRoot, "data", "github-repos.snapshot.json");
const outputPath = path.join(repoRoot, "js", "projects-data.js");
const run = promisify(execFile);

const endpoint = "https://api.github.com/users/jesusugarte10/repos?sort=updated&per_page=100&type=owner";

const rawOverrides = await readFile(overridesPath, "utf8");
const overrides = JSON.parse(rawOverrides);

let repos;
let snapshotDate = new Date().toISOString().slice(0, 10);

try {
    const { stdout } = await run("curl", [
        "-fsSL",
        "-H",
        "Accept: application/vnd.github+json",
        "-H",
        "User-Agent: cactus-project-sync",
        endpoint
    ], {
        cwd: repoRoot
    });

    repos = JSON.parse(stdout);
    await writeFile(snapshotPath, JSON.stringify(repos, null, 2), "utf8");
} catch (error) {
    const rawSnapshot = await readFile(snapshotPath, "utf8");
    repos = JSON.parse(rawSnapshot);
    snapshotDate = overrides.snapshotDate || snapshotDate;
    console.warn(`Using local snapshot because GitHub refresh failed: ${error.message}`);
}

const prettyWord = (word) => {
    const dictionary = {
        ai: "AI",
        api: "API",
        cs1: "CS1",
        cs50: "CS50",
        cfi: "CFI",
        geo: "Geo",
        github: "GitHub",
        hololens: "HoloLens",
        mrtk: "MRTK",
        tcp: "TCP",
        ucf: "UCF"
    };

    const normalized = word.toLowerCase();

    if (dictionary[normalized]) {
        return dictionary[normalized];
    }

    if (/^[A-Z0-9]+$/.test(word)) {
        return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const defaultTitle = (name) => name
    .split(/[-_]+/)
    .filter(Boolean)
    .map(prettyWord)
    .join(" ");

const cleanupSummary = (summary) => summary
    .replace(/\s+/g, " ")
    .trim();

const fallbackSummary = (repo) => {
    const title = defaultTitle(repo.name);

    if (repo.language) {
        return `${title} is a public ${repo.language} repository in the GitHub archive.`;
    }

    return `${title} is a public GitHub repository in the archive.`;
};

const buildRepoEntry = (repo, index) => {
    const repoOverride = overrides.repoOverrides[repo.name] || {};
    const tags = Array.isArray(repoOverride.tags) ? [...repoOverride.tags] : [];

    if (repo.language && !tags.includes(repo.language)) {
        tags.unshift(repo.language);
    }

    if (repo.homepage && repo.homepage.trim() && !tags.includes("Live Demo")) {
        tags.push("Live Demo");
    }

    return {
        id: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: repoOverride.title || defaultTitle(repo.name),
        kind: "public_repo",
        repoUrl: repo.html_url,
        liveUrl: repo.homepage || "",
        summary: cleanupSummary(repoOverride.summary || repo.description || fallbackSummary(repo)),
        language: repo.language || "",
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        displayOrder: index + 1,
        tags: tags.slice(0, 3),
        visibilityNote: repoOverride.visibilityNote || "Public GitHub repository"
    };
};

const hiddenRepos = new Set(overrides.hiddenRepos || []);
const publicRepos = repos.filter((repo) => !repo.private && !hiddenRepos.has(repo.name));
const sortedRepos = publicRepos
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

const tail = new Set(overrides.repoTailOrder || []);
const reorderedRepos = [
    ...sortedRepos.filter((repo) => !tail.has(repo.name)),
    ...sortedRepos.filter((repo) => tail.has(repo.name))
];

const repoEntries = reorderedRepos.map(buildRepoEntry);

const data = {
    snapshotDate,
    featuredProducts: overrides.featuredProducts,
    publicRepos: repoEntries
};

const fileContents = `window.PORTFOLIO_DATA = ${JSON.stringify(data, null, 4)};\n`;

await writeFile(outputPath, fileContents, "utf8");

console.log(`Updated ${path.relative(repoRoot, outputPath)} with ${repoEntries.length} public repositories.`);
