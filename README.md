# 🚀 Speedvitals CLI

A powerful command-line tool for analyzing website performance using Lighthouse metrics. Monitor Core Web Vitals, set performance budgets, and integrate performance testing into your CI/CD pipeline.

[![npm version](https://img.shields.io/npm/v/speedvitals.svg)](https://www.npmjs.com/package/speedvitals)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Comprehensive Performance Analysis** - Analyze websites using Lighthouse metrics including LCP, FCP, CLS, TBT, and more
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
| `--log-results`                  | Boolean    | Log detailed results to the console (default: `false`)                         |

#### Performance Budget Options

> **Note:** If any custom budget value is set, all other default budget values will be ignored.

| Option                          | Type   | Description                          | Default |
| ------------------------------- | ------ | ------------------------------------ | ------- |
| `--lcp <ms>`                    | Number | Largest Contentful Paint budget (ms) | 515     |
| `--cls <score>`                 | Number | Cumulative Layout Shift budget       | 0.0     |
| `--fcp <ms>`                    | Number | First Contentful Paint budget (ms)   | 1800    |
| `--tbt <ms>`                    | Number | Total Blocking Time budget (ms)      | 200     |
| `--server-response-time <ms>`   | Number | Server response time budget (ms)     | 600     |
| `--speed-index <ms>`            | Number | Speed Index budget (ms)              | 2300    |
| `--performance-score <score>`   | Number | Performance score (0-100)            | 90      |
| ------------------------------- | ------ | ------------------------------------ | ------- |
| `--lcp <ms>`                    | Number | Largest Contentful Paint budget (ms) | 515     |
| `--cls <score>`                 | Number | Cumulative Layout Shift budget       | 0.0     |
| `--fcp <ms>`                    | Number | First Contentful Paint budget (ms)   | 1800    |
| `--tbt <ms>`                    | Number | Total Blocking Time budget (ms)      | 200     |
| `--server-response-time <ms>`   | Number | Server response time budget (ms)     | 600     |
| `--speed-index <ms>`            | Number | Speed Index budget (ms)              | 2300    |
| `--performance-score <score>`   | Number | Performance score (0-100)            | 90      |

### `help` Command

Display help information:

```bash
speedvitals help [command]
```

## 🌍 Supported Locations

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

## 📱 Supported Devices

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

### CI/CD Integration

The CLI automatically detects CI environments and includes build metadata:

```bash
speedvitals analyze \
  --urls '["https://staging.example.com"]' \
  --baseBranch main \
  --fail-on-regression true
```

## 🔄 CI/CD Examples

### GitHub Actions

```yaml
name: Performance Testing

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
        run: npx speedvitals analyze --urls '["https://staging.example.com"]' --device mobile --location us --baseBranch main --lcp 2500 --cls 0.1 --fcp 1800 --tbt 200 --performance-score 90
```

### GitLab CI

```yaml
performance-test:
  stage: test
  image: node:18
  script:
    - npm install -g speedvitals
    - speedvitals analyze --urls '["https://staging.example.com"]' --fail-on-regression true
  variables:
    SPEEDVITALS_API_KEY: $SPEEDVITALS_API_KEY
```

### CircleCI

```yaml
version: 2.1

jobs:
  performance:
    docker:
      - image: node:18
    steps:
      - checkout
      - run:
          name: Install CLI
          command: npm install -g speedvitals
      - run:
          name: Performance Tests
          command: speedvitals analyze --urls '["https://staging.example.com"]' --fail-on-regression true
          environment:
            SPEEDVITALS_API_KEY: $SPEEDVITALS_API_KEY

workflows:
  test:
    jobs:
      - performance
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
