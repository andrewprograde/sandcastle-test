import { Command } from "commander";
import { greet } from "./greet.js";

const program = new Command();

program
  .name("app")
  .description("A simple TypeScript CLI application")
  .version("0.1.0");

program
  .command("greet <name>")
  .description("Greet someone by name")
  .action((name: string) => {
    console.log(greet(name));
  });

program.parse(process.argv);
