# Contributing to EaglEs EyE

Thank you for your interest in contributing to **EaglEs EyE**! We aim to build a clean, high-performance, and dependable planetary intelligence platform.

---

## 1. Development Principles

1. **Clean Code & Strong Typing:** All new code must adhere to strict TypeScript standards and clean architecture separation.
2. **Deterministic Tests:** Never introduce regressions. Unit and integration tests must run without external network calls via mocked fixtures.
3. **Zero Leaked Secrets:** Never check in API tokens, Cesium keys, or private endpoints. Always rely on `.env.example` templates.

---

## 2. Getting Started

1. Fork the repository to your GitHub account: `https://github.com/enrolconsultancy1-hue/EaglEs-EyE-Geospatial`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/EaglEs-EyE-Geospatial.git
   cd EaglEs-EyE-Geospatial
   ```
3. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Set up your local environment:
   ```bash
   cp .env.example .env
   ```

---

## 3. Commit Convention

We follow the **Conventional Commits** specification:

- `feat:` A new feature or capability (e.g., `feat(aviation): add military transponder filtering`)
- `fix:` A bug fix (e.g., `fix(cesium): resolve billboard memory leak on layer unmount`)
- `docs:` Documentation improvements (e.g., `docs(api): document 63 proxy endpoints`)
- `style:` Formatting changes with no production code logic change
- `refactor:` Code restructuring without changing external behavior
- `test:` Adding or improving test cases
- `chore:` Build scripts, package updates, or configuration adjustments

---

## 4. Quality Checks

Before submitting a Pull Request, verify that all quality gates pass:

```bash
# Verify formatting
npm run format:check

# Run test suite
npm test

# Build production artifacts
npm run build
```

---

## 5. Submitting a Pull Request

- Provide a concise title following Conventional Commits.
- Complete the PR template in full.
- Reference any related issues (e.g., `Closes #42`).
- Ensure all CI workflow checks pass.
