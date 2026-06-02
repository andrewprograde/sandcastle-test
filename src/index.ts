import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { greet } from "./greet.js";
import { getJoke } from "./joke.js";

export function createProgram(output: (message: string) => void = console.log): Command {
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
    .command("joke")
    .description("Tell a funny joke")
    .action(() => {
      output(getJoke());
    });

  return program;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createProgram().parse(process.argv);
}
