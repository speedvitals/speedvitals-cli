import envCi from "env-ci";

const isCI = () => {
  const ci = envCi();
  return ci.isCi || !process.stdout.isTTY;
};

export class Spinner {
  private frames: string[];
  private current: number;
  private timer: NodeJS.Timeout | null;
  private message: string;
  private isSpinning: boolean;
  private isInCI: boolean;

  constructor(message: string = "Loading...") {
    this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    this.current = 0;
    this.timer = null;
    this.message = message;
    this.isSpinning = false;
    this.isInCI = isCI();
  }

  start(): void {
    if (this.isSpinning) return;

    this.isSpinning = true;

    // In CI, just print the message once
    if (this.isInCI) {
      process.stdout.write(`⏳ ${this.message}\n`);
      return;
    }

    // Hide cursor
    process.stdout.write("\x1b[?25l");

    this.render();

    this.timer = setInterval(() => {
      this.current = (this.current + 1) % this.frames.length;
      this.render();
    }, 80);
  }

  private render(): void {
    if (this.isInCI) return;

    process.stdout.write("\x1b[2K"); // Clear entire line
    process.stdout.write(`\r${this.frames[this.current]} ${this.message}`);
  }

  updateMessage(message: string): void {
    this.message = message;
    if (this.isSpinning) {
      this.render();
    }
  }

  stop(finalMessage?: string): void {
    if (!this.isSpinning) return;

    this.isSpinning = false;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.isInCI) {
      if (finalMessage) {
        process.stdout.write(`${finalMessage}\n`);
      }
      return;
    }

    process.stdout.write("\x1b[2K");
    if (finalMessage) {
      process.stdout.write(`\r${finalMessage}\n`);
    } else {
      process.stdout.write("\r");
    }

    // Show cursor
    process.stdout.write("\x1b[?25h");
  }

  succeed(message?: string): void {
    this.stop(`✅ ${message || this.message}`);
  }

  fail(message?: string): void {
    this.stop(`❌ ${message || this.message}`);
  }

  warn(message?: string): void {
    this.stop(`⚠️ ${message || this.message}`);
  }

  info(message?: string): void {
    this.stop(`ℹ️ ${message || this.message}`);
  }
}

export class SpinnerProgressBar {
  private total: number;
  private current: number;
  private width: number;
  private startTime: number;
  private lastUpdate: number;
  private isComplete: boolean;
  private currentMessage: string;
  private frames: string[];
  private frameIndex: number;
  private timer: NodeJS.Timeout | null;
  private isActive: boolean;
  private lastProgressLine: string;
  private isInCI: boolean;

  constructor(total: number, width: number = 50) {
    this.total = total;
    this.current = 0;
    this.width = width;
    this.startTime = Date.now();
    this.lastUpdate = 0;
    this.isComplete = false;
    this.currentMessage = "";
    this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    this.frameIndex = 0;
    this.timer = null;
    this.isActive = false;
    this.lastProgressLine = "";
    this.isInCI = isCI();
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;

    if (this.isInCI) {
      process.stdout.write(`⏳ Starting analysis...\n`);
      return;
    }

    // Hide cursor when starting
    process.stdout.write("\x1b[?25l");

    this.renderInitial();

    this.timer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.updateSpinner();
    }, 80);
  }

  private renderInitial(): void {
    if (this.isInCI) return;

    const percentage = Math.floor((this.current / this.total) * 100);
    const completed = Math.floor((this.current / this.total) * this.width);
    const remaining = this.width - completed;

    const progressBar = "█".repeat(completed) + "░".repeat(remaining);
    const spinner = this.frames[this.frameIndex];

    let line = `\r${spinner} Analyzing Progress |${progressBar}| ${percentage}% | ${this.current}/${this.total} URLs`;

    if (this.currentMessage) {
      const truncatedMessage =
        this.currentMessage.length > 40
          ? this.currentMessage.substring(0, 37) + "..."
          : this.currentMessage;
      line += ` - ${truncatedMessage}`;
    }

    this.lastProgressLine = line;
    process.stdout.write("\x1b[2K"); // Clear entire line
    process.stdout.write(line);
  }

  private updateSpinner(): void {
    if (!this.isActive || this.isInCI) return;

    // Only update the spinner character at the beginning
    process.stdout.write(`\r${this.frames[this.frameIndex]}`);
  }

  update(current: number, message?: string): void {
    if (this.isComplete) return;

    this.current = Math.min(current, this.total);
    if (message) {
      this.currentMessage = message;
    }

    // In CI, print progress updates less frequently
    if (this.isInCI) {
      const percentage = Math.floor((this.current / this.total) * 100);
      if (
        percentage === 25 ||
        percentage === 50 ||
        percentage === 75 ||
        this.current === this.total
      ) {
        process.stdout.write(
          `   Progress: ${this.current}/${this.total} URLs (${percentage}%)\n`
        );
      }
      return;
    }

    // Throttle updates to avoid flickering (update at most every 100ms)
    const now = Date.now();
    if (now - this.lastUpdate < 100 && this.current < this.total) {
      return;
    }
    this.lastUpdate = now;

    this.render();
  }

  private render(): void {
    if (!this.isActive || this.isInCI) return;

    const percentage = Math.floor((this.current / this.total) * 100);
    const completed = Math.floor((this.current / this.total) * this.width);
    const remaining = this.width - completed;

    const progressBar = "█".repeat(completed) + "░".repeat(remaining);
    const spinner = this.frames[this.frameIndex];

    let line = `\r${spinner} Analyzing Progress |${progressBar}| ${percentage}% | ${this.current}/${this.total} URLs`;

    if (this.currentMessage) {
      const truncatedMessage =
        this.currentMessage.length > 40
          ? this.currentMessage.substring(0, 37) + "..."
          : this.currentMessage;
      line += ` - ${truncatedMessage}`;
    }

    this.lastProgressLine = line;
    process.stdout.write("\x1b[2K"); // Clear entire line
    process.stdout.write(line);
  }
  complete(message?: string): void {
    if (this.isComplete) return;

    this.isComplete = true;
    this.current = this.total;

    // Stop the spinner animation
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);

    if (this.isInCI) {
      process.stdout.write(
        `✅ Analyzing Progress | 100% | ${this.total}/${this.total} URLs | ${elapsed}s total\n`
      );
      if (message) {
        process.stdout.write(`   ${message}\n`);
      }
      return;
    }

    const progressBar = "█".repeat(this.width);
    const completeLine = `\r✅ Analyzing Progress |${progressBar}| 100% | ${this.total}/${this.total} URLs | ${elapsed}s total`;

    process.stdout.write("\x1b[2K"); // Clear entire line
    process.stdout.write(completeLine);

    if (message) {
      process.stdout.write(`\n  ${message}`);
    }

    process.stdout.write("\n"); // Move to next line

    // Show cursor
    process.stdout.write("\x1b[?25h");
  }

  stop(): void {
    this.complete();
  }
}

export default { Spinner, SpinnerProgressBar };
