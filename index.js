import {coding_constants } from './constants';
const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const axios = require("axios");

async function run() {
  try {
    const githubToken = core.getInput("github_token");
    const openaiApiKey = core.getInput("openai_api_key");
    const prNumber = core.getInput("pr_number");
    const reviewType = "full";

    const octokit = new Octokit({ auth: githubToken });
    const { owner, repo } = github.context.repo;

    // Get changed files in the PR
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    core.info(`Found ${files.length} changed files.`);

    for (const file of files) {
      if (file.status === "removed") continue;

      // Fetch file content
      const { data: fileContent } = await octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: "main",
      });

      const content = Buffer.from(fileContent.content, "base64").toString("utf-8");

      core.info(`Reviewing file: ${file.filename}`);

      // Send to OpenAI for review
      const review = await reviewCodeWithOpenAI(content, openaiApiKey, reviewType);

      // Post review comments
      await postComment(octokit, owner, repo, prNumber, file.filename, review);
    }

    core.info("Code review completed.");
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

async function reviewCodeWithOpenAI(code, apiKey, reviewType) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: coding_constants.coding_instructions },
          { role: "user", content: code },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    core.error(`OpenAI Error: ${error.response?.data || error.message}`);
    return "Failed to analyze code.";
  }
}

async function postComment(octokit, owner, repo, prNumber, filePath, comment) {
  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      event: "COMMENT",
      comments: [
        {
          path: filePath,
          position: 1, // Adjust if needed
          body: comment,
        },
      ],
    });
  } catch (error) {
    core.error(`GitHub Comment Error: ${error.message}`);
  }
}

run();
