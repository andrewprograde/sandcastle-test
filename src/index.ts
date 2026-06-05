import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { getFishAsciiArt } from "./fish.js";
import { greet } from "./greet.js";
import { formatHackerNewsStories, getTopHackerNewsStories } from "./hackerNews.js";
import { getJoke } from "./joke.js";

export function createProgram(
  output: (message: string) => void = console.log,
  error: (message: string) => void = console.error,
): Command {
  const program = new Command();

  program
    .name("app")
    .description("A simple TypeScript CLI application")
    .version("0.1.0");

  program
    .command("greet <name>")
    .description("Greet someone by name")
    .action((name: string) => {
      output(greet(name));
    });

  program
    .command("fish")
    .description("Show ASCII art of a fish")
    .action(() => {
      output(getFishAsciiArt());
    });

  program
    .command("joke")
    .description("Tell a funny joke")
    .action(() => {
      output(getJoke());
    });

  program
    .command("hacker-news")
    .alias("hn")
    .description("Show the top 10 Hacker News stories")
    .action(async () => {
      try {
        const stories = await getTopHackerNewsStories();
        output(formatHackerNewsStories(stories));
      } catch (cause) {
        error(cause instanceof Error ? cause.message : "Failed to fetch Hacker News stories");
        process.exitCode = 1;
      }
    });

  return program;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await createProgram().parseAsync(process.argv);
}
