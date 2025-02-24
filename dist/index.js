/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 746:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 670:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 595:
/***/ ((module) => {

module.exports = eval("require")("@octokit/rest");


/***/ }),

/***/ 473:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

;// CONCATENATED MODULE: ./constants.js
const coding_constants= {

    coding_instructions: `Your task is to review a Pull Request.
    Your task is to review a Pull Request for technical inconsistencies.
    You will receive a git diff. You're expected to conduct a technical review to suggest enhancements in various aspects such as code quality, maintainability, readability, performance, and security.
    This includes identifying potential bugs or security vulnerabilities.
    For technical reviews, instructions will be outlined in the form of coding standards and guidelines for React, Redux and Saga.
    Ensure adherence to technical coding standards and guidelines.
    -Technical Coding Standards and Guidelines for Redux, React, and Saga are as below:
    1. Redux Setup:
    a.Check that Redux is set up correctly with reducers, actions, and the store.
    b.Verify that action types are defined as constants and are consistent across the application.
    c.Ensure that action creators are used to encapsulate action logic and avoid direct manipulation of action objects.
    2. Redux Middleware:
    a.Review the usage of Redux Middleware for tasks such as logging, error handling, or asynchronous operations.
    b.Ensure that middleware functions are pure and do not cause side effects unrelated to Redux state management.
    c.Check for proper error handling in middleware to prevent application crashes and provide meaningful error messages to users.
    3. Saga Implementation:
    a.Evaluate the usage of Redux Saga for handling asynchronous logic and side effects.
    b.Verify that sagas are structured appropriately, with clear separation of concerns and minimal coupling between sagas.
    c.Check for proper error handling in sagas, including handling of failed API requests and other asynchronous operations.
    4.Component Architecture:
    a.Review the component architecture to ensure adherence to best practices and maintainability.
    b.Check for proper separation of container and presentational components, with container components responsible for connecting to Redux and managing state.
    c.Ensure that components are reusable, composable, and focused on a single responsibility.
    5.State Management:
    a.Evaluate the usage of Redux for state management, considering factors such as the size and complexity of the application.
    b.Check for appropriate normalization of state, especially for nested or relational data structures.
    c.Verify that selectors are used to derive derived data from the Redux store efficiently.
    6.Code Organization and Structure:
    a.Check that the project structure follows best practices and is organized logically.
    b.Ensure that files and folders are named descriptively and consistently.
    c.Verify that code is modular and follows the single responsibility principle, with each module responsible for a specific feature or functionality.
    7.Error Handling:
    a.Evaluate error handling mechanisms throughout the codebase, including in Redux actions, reducers, middleware, and sagas.
    b.Check for consistent error handling patterns and ensure that errors are handled gracefully to prevent application crashes and provide a good user experience.
    8.Performance Optimization:
    a. Review code for potential performance bottlenecks and inefficiencies.
    b. Check for unnecessary re-renders in React components and identify opportunities for optimization using techniques such as memoization and PureComponent.
    c. Evaluate the usage of Redux selectors and memoization to improve performance when accessing derived data from the store.
    9.Testing:
    a.Verify that the codebase is adequately covered by unit tests, integration tests, and end-to-end tests.
    b.Check for proper mocking of external dependencies, such as APIs and services, in tests to ensure isolation and reproducibility.
    c.Evaluate test coverage and identify areas where additional tests are needed to improve code quality and reliability.
    10.Documentation and Comments:
    a.Ensure that code is well-documented with comments, especially for complex logic or algorithms.
    b.Check that documentation is up-to-date and accurately reflects the behavior and usage of functions, components, and modules.
    c.Encourage the use of README files and other documentation to provide an overview of the project structure, architecture, and development workflow.

Write your reply and examples in GitHub Markdown format.`

}
;// CONCATENATED MODULE: ./index.js

const core = __nccwpck_require__(746);
const github = __nccwpck_require__(670);
const { Octokit } = __nccwpck_require__(595);
const axios = __nccwpck_require__(473);

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

})();

module.exports = __webpack_exports__;
/******/ })()
;