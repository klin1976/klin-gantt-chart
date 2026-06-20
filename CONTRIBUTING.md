# Contributing to klin-gantt-chart

First off, thank you for considering contributing to `klin-gantt-chart`! It's people like you that make it such a great project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

* Use a clear and descriptive title for the issue to identify the problem.
* Describe the exact steps which reproduce the problem in as many details as possible.
* Provide specific examples to demonstrate the steps.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

* Use a clear and descriptive title for the issue to identify the suggestion.
* Provide a step-by-step description of the suggested enhancement in as many details as possible.
* Describe the current behavior and explain which behavior you expected to see instead and why.

### Pull Requests

* Fill in the required template.
* Do not include issue numbers in the PR title.
* Follow the coding guidelines below.
* Ensure all tests and linting checks pass before submitting your PR.

## Coding Guidelines

* **JavaScript/React:** We use modern React (Hooks, Functional Components) and ES6+ syntax.
* **Styling:** Tailwind CSS is used for styling. Please follow the existing utility-first approach.
* **State Management:** Zustand is used for state management. Put global state in the `src/store/` directory.
* **Documentation:** Add JSDoc comments to new components, hooks, and utilities. Use `prop-types` for component props validation.
* **Linting:** We use ESLint. Make sure to run `npm run lint` before committing your changes.

## Development Setup

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/your-username/klin-gantt-chart.git`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

We look forward to your contributions!
