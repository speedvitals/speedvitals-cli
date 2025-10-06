# 🚀 Speedvitals CLI

A command-line tool for analyzing website performance using Lighthouse metrics. Monitor Core Web Vitals, set performance budgets, and integrate performance testing into your CI/CD pipeline.

[![npm version](https://img.shields.io/npm/v/speedvitals.svg)](https://www.npmjs.com/package/speedvitals)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📑 Table of Contents

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🔑 Getting Started](#-getting-started)
- [📖 Usage](#-usage)
- [💻 Command Reference](#-command-reference)
- [🌍 Supported Locations](#supported-locations)
- [📱 Supported Devices](#supported-devices)
- [🔄 CI/CD Integration](#-cicd-integration)
  - [GitHub Actions](#github-actions)
  - [GitLab CI](#gitlab-ci)
  - [Jenkins](#jenkins)
  - [CircleCI](#circleci)
  - [Azure Pipelines](#azure-pipelines)
- [📊 Output Example](#-output-example)
- [🔗 Links](#-links)

## ✨ Features

- **Performance Analysis** - Analyze websites using Lighthouse metrics including LCP, FCP, CLS, TBT, and more
- **Performance Budgets** - Set custom budgets for all Core Web Vitals and get alerts on regressions
- **Multiple Test Locations** - Test from 15+ global locations.
- **Device Emulation** - Test across various devices (mobile, desktop, tablets, specific phone models)
- **Batch Testing** - Analyze multiple URLs simultaneously with configurable concurrency
- **CI/CD Integration** - Integrate seamlessly with GitHub Actions, GitLab CI, CircleCI, and more

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g speedvitals
```

### Local Installation

```bash
npm install --save-dev speedvitals
```

### Run with npx

```bash
npx speedvitals analyze --urls '["https://example.com"]'
```

## 🔑 Getting Started

### 1. Get Your API Key

Get your API key from [Speedvitals Account Settings](https://speedvitals.com/account/api).

### 2. Set Up Authentication

You can provide your API key in two ways:

**Option 1: Environment Variable (Recommended)**

```bash
export SPEEDVITALS_API_KEY="your-api-key-here"
```

**Option 2: Command Line Flag**

```bash
speedvitals analyze --api-key "your-api-key-here" --urls '["https://example.com"]'
```

### 3. Run Your First Analysis

```bash
speedvitals analyze --urls '["https://example.com"]'
```

## 📖 Usage

### Basic Usage

Analyze a single URL with default settings (mobile device, US location):

```bash
speedvitals analyze --urls '["https://example.com"]'
```

### Analyze Multiple URLs

```bash
speedvitals analyze --urls '["https://example.com", "https://example.com/about", "https://example.com/contact"]'
```

### Custom Device and Location

```bash
speedvitals analyze \
  --urls '["https://example.com"]' \
  --device desktop \
  --location us
```

### Advanced Configuration

Use the `--config` option for fine-grained control over each URL:

```bash
speedvitals analyze \
  --config '[
    ["https://example.com", "mobile", "us"],
    ["https://example.com/about", "desktop", "uk"],
    ["https://example.com/products", "iphone13ProMax", "jp"]
  ]'
```

### Performance Budgets

Set custom performance budgets and fail on regressions:

```bash
speedvitals analyze \
  --urls '["https://example.com"]' \
  --lcp 2500 \
  --cls 0.1 \
  --fcp 1800 \
  --tbt 200 \
  --performance-score 90 \
  --fail-on-regression true
```

## 💻 Command Reference

### `analyze` Command

Analyze website performance using Lighthouse.

#### Options

| Option                           | Type       | Description                                                                    |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `--config <path>`                | JSON Array | Array of URLs with device and location: `[['url', 'device', 'location'], ...]` |
| `--urls <urls>`                  | JSON Array | Array of URLs to analyze: `['url1', 'url2', ...]`                              |
| `--device <device>`              | String     | Device type for testing (see [Supported Devices](#-supported-devices))         |
| `--location <location>`          | String     | Testing location (see [Supported Locations](#-supported-locations))            |
| `--api-key <key>`                | String     | API key for authentication                                                     |
| `--baseBranch <branch>`          | String     | Base branch name for CI/CD                                                     |
| `--fail-on-regression <boolean>` | Boolean    | Exit with error code on budget regression: `true` or `false` (default: `true`) |

#### Performance Budget Options

> **Note:** If any custom budget value is set, all other default budget values will be ignored.

| Option                        | Type   | Description                          | Default |
| ----------------------------- | ------ | ------------------------------------ | ------- |
| `--lcp <ms>`                  | Number | Largest Contentful Paint budget (ms) | 2500    |
| `--cls <score>`               | Number | Cumulative Layout Shift budget       | 0.1     |
| `--fcp <ms>`                  | Number | First Contentful Paint budget (ms)   | 1800    |
| `--tbt <ms>`                  | Number | Total Blocking Time budget (ms)      | 200     |
| `--server-response-time <ms>` | Number | Server response time budget (ms)     | 800     |
| `--speed-index <ms>`          | Number | Speed Index budget (ms)              | 3400    |
| `--performance-score <score>` | Number | Performance score (0-100)            | 90      |

### `help` Command

Display help information:

```bash
speedvitals help [command]
```

## Supported Locations

| Location Code | Region                  |
| ------------- | ----------------------- |
| `us`          | United States (Central) |
| `ca`          | Canada                  |
| `br`          | Brazil                  |
| `de`          | Germany                 |
| `uk`          | United Kingdom          |
| `nl`          | Netherlands             |
| `pl`          | Poland                  |
| `ch`          | Switzerland             |
| `jp`          | Japan                   |
| `in`          | India                   |
| `sg`          | Singapore               |
| `au`          | Australia               |
| `id`          | Indonesia               |
| `kr`          | South Korea             |
| `tw`          | Taiwan                  |

## Supported Devices

### Generic Devices

- `mobile` - Generic mobile device
- `desktop` - Generic desktop device
- `highEndLaptop` - High-end laptop
- `macbookAirM1` - MacBook Air M1

### Tablets

- `ipad102` - iPad 10.2"
- `galaxyTabS7` - Samsung Galaxy Tab S7

### Smartphones (iPhone)

- `iphone13ProMax` - iPhone 13 Pro Max
- `iphone11` - iPhone 11
- `iphone7` - iPhone 7

### Smartphones (Android)

- `galaxyS10Plus` - Samsung Galaxy S10+
- `galaxyA50` - Samsung Galaxy A50
- `galaxyJ8` - Samsung Galaxy J8
- `redmiNote8Pro` - Xiaomi Redmi Note 8 Pro
- `redmi5A` - Xiaomi Redmi 5A
- `motoG5` - Motorola Moto G5

# 🔄 CI/CD Integration

The CLI automatically detects CI environments and includes build metadata in your performance reports. `--fail-on-regression` flag is defaulted to `true` in CI environments to ensure your pipeline fails on budget regressions.

```bash
speedvitals analyze \
  --urls '["https://staging.example.com"]' \
  --baseBranch main \
```

## CI/CD Examples

### GitHub Actions

This workflow triggers on every push to `main` or `develop` branches, and on all pull requests targeting these branches.

**Setting up secrets:**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SPEEDVITALS_API_KEY`
5. Value: Your API key from [Speedvitals Account Settings](https://speedvitals.com/account/api)
6. Click **Add secret**

**Workflow file:** `.github/workflows/performance.yml`

```yaml
name: Speedvitals Performance Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Run Performance Analysis
        env:
          SPEEDVITALS_API_KEY: ${{ secrets.SPEEDVITALS_API_KEY }}
        run: |
          npx speedvitals analyze \
            --urls '["https://staging.example.com"]' \
            --device mobile \
            --location us \
            --baseBranch main \
            --lcp 2500 \
            --cls 0.1 \
            --fcp 1800 \
            --tbt 200 \
            --performance-score 90
```

### GitLab CI

This job runs on every push to any branch as part of the `test` stage.

**Setting up secrets:**

1. Go to your GitLab project
2. Click **Settings** → **CI/CD**
3. Expand **Variables**
4. Click **Add variable**
5. Key: `SPEEDVITALS_API_KEY`
6. Value: Your API key from [Speedvitals Account Settings](https://speedvitals.com/account/api)
7. Uncheck **Protect variable** (unless you only want it on protected branches)
8. Check **Mask variable** to hide it in logs
9. Click **Add variable**

**Workflow file:** `.gitlab-ci.yml`

```yaml
performance-test:
  stage: test
  image: node:20
  script:
    - npm install -g speedvitals
    - |
      speedvitals analyze \
        --urls '["https://staging.example.com"]' \
        --device mobile \
        --location us \
        --baseBranch main \
  variables:
    SPEEDVITALS_API_KEY: $SPEEDVITALS_API_KEY
  only:
    - merge_requests
    - main
    - develop
```

### Jenkins

This pipeline runs on every push to `main` or `develop` branches.

**Setting up secrets:**

1. Go to Jenkins dashboard
2. Click **Manage Jenkins** → **Credentials**
3. Select the appropriate domain/store
4. Click **Add Credentials**
5. Kind: **Secret text**
6. Secret: Your API key from [Speedvitals Account Settings](https://speedvitals.com/account/api)
7. ID: `speedvitals-api-key`
8. Description: `Speedvitals API Key`
9. Click **OK**

**Workflow file:** `Jenkinsfile`

```groovy
pipeline {
    agent any

    environment {
        SPEEDVITALS_API_KEY = credentials('speedvitals-api-key')
    }

    stages {
        stage('Speedvitals Performance Test') {
            when {
                branch pattern: "main|develop", comparator: "REGEXP"
            }
            steps {
                script {
                    sh '''
                        npm install -g speedvitals
                        speedvitals analyze \
                          --urls '["https://staging.example.com"]' \
                          --device mobile \
                          --location us \
                          --baseBranch main
                    '''
                }
            }
        }
    }
}
```

### CircleCI

This workflow runs on every commit to any branch.

**Setting up secrets:**

1. Go to your CircleCI project
2. Click **Project Settings**
3. Click **Environment Variables**
4. Click **Add Environment Variable**
5. Name: `SPEEDVITALS_API_KEY`
6. Value: Your API key from [Speedvitals Account Settings](https://speedvitals.com/account/api)
7. Click **Add Environment Variable**

**Workflow file:** `.circleci/config.yml`

```yaml
version: 2.1

jobs:
  performance:
    docker:
      - image: node:20
    steps:
      - checkout

      - run:
          name: Install Speedvitals CLI
          command: npm install -g speedvitals

      - run:
          name: Run Performance Analysis
          command: |
            speedvitals analyze \
              --urls '["https://staging.example.com"]' \
              --device mobile \
              --location us \
              --baseBranch main
workflows:
  version: 2
  test:
    jobs:
      - performance:
          filters:
            branches:
              only:
                - main
                - develop
```

### Azure Pipelines

This pipeline runs on every push to `main` or `develop` branches, and on pull requests targeting these branches.

**Setting up secrets:**

1. Go to your Azure DevOps project
2. Click **Pipelines** → **Library**
3. Click **+ Variable group**
4. Name: `speedvitals-variables`
5. Click **+ Add** under Variables
6. Name: `SPEEDVITALS_API_KEY`
7. Value: Your API key from [Speedvitals Account Settings](https://speedvitals.com/account/api)
8. Click the lock icon to make it secret
9. Click **Save**

**Workflow file:** `azure-pipelines.yml`

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: speedvitals-variables

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: "20.x"
    displayName: "Install Node.js"

  - script: |
      npm install -g speedvitals
      speedvitals analyze \
        --urls '["https://staging.example.com"]' \
        --device mobile \
        --location us \
        --baseBranch main
    displayName: "Run Performance Analysis"
    env:
      SPEEDVITALS_API_KEY: $(SPEEDVITALS_API_KEY)
```

## 📊 Output Example

```
🚀 Starting analysis of 3 URL(s)...
⣾ Progress: ████████████████████ 100% | 3/3 URLs completed

✅ No budget regressions detected.
🎉 Successfully completed analysis of 3 URL(s).
```

When a budget regression is detected:

```
⚠️ Budget regression detected for largest_contentful_paint: 2800 > 2500
⚠️ Budget regression detected for performance_score: 85 < 90
❌ Budget regression detected Exited with error.
```

## 🔗 Links

- [Speedvitals Website](https://speedvitals.com)
- [API Documentation](https://developers.speedvitals.com)
- [Get API Key](https://speedvitals.com/account/api)
