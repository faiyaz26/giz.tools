#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import chalk from "chalk";
import { MarkdownParser } from "./parser.js";
import { ParserOptions } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name("parse-markdown")
  .description("Parse markdown files into structured JSON for Husky CMS")
  .version("1.0.0");

program
  .command("single <file>")
  .description("Parse a single markdown file")
  .option(
    "-o, --output <path>",
    "Output file path (defaults to <filename>.json)"
  )
  .option("--no-metadata", "Skip metadata extraction")
  .option("--no-code-blocks", "Do not preserve code block formatting")
  .option("--no-span-config", "Do not extract span configuration")
  .option("--pretty", "Pretty print JSON output")
  .action(async (file: string, options) => {
    try {
      const parser = new MarkdownParser();
      const parserOptions: ParserOptions = {
        includeMetadata: options.metadata !== false,
        preserveCodeBlocks: options.codeBlocks !== false,
        extractSpanConfig: options.spanConfig !== false,
      };

      console.log(chalk.blue(`📖 Parsing: ${file}`));

      const result = await parser.parseFile(file, parserOptions);

      if (!result.success) {
        console.error(chalk.red(`❌ Error parsing ${file}: ${result.error}`));
        process.exit(1);
      }

      const outputPath =
        options.output ||
        path.join(path.dirname(file), `${path.parse(file).name}.json`);

      const jsonOutput = parser.toJSON(
        result.document!,
        options.pretty ? 2 : 0
      );

      await fs.promises.writeFile(outputPath, jsonOutput, "utf-8");

      console.log(
        chalk.green(`✅ Successfully parsed and saved to: ${outputPath}`)
      );

      // Print summary
      const doc = result.document!;
      console.log(chalk.cyan("\n📊 Summary:"));
      console.log(`   Title: ${doc.metadata.title || "N/A"}`);
      console.log(`   Sections: ${doc.sections.length}`);
      console.log(
        `   Total Cards: ${doc.sections.reduce(
          (total, section) =>
            total +
            section.subsections.reduce(
              (subTotal, sub) => subTotal + sub.cards.length,
              0
            ),
          0
        )}`
      );
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error}`));
      process.exit(1);
    }
  });

program
  .command("batch <pattern>")
  .description("Parse multiple markdown files matching a glob pattern")
  .option(
    "-o, --output-dir <path>",
    "Output directory (defaults to same directory as input files)"
  )
  .option("--no-metadata", "Skip metadata extraction")
  .option("--no-code-blocks", "Do not preserve code block formatting")
  .option("--no-span-config", "Do not extract span configuration")
  .option("--pretty", "Pretty print JSON output")
  .action(async (pattern: string, options) => {
    try {
      const files = await glob(pattern);

      if (files.length === 0) {
        console.log(
          chalk.yellow(`⚠️  No files found matching pattern: ${pattern}`)
        );
        return;
      }

      console.log(chalk.blue(`📖 Found ${files.length} files to parse`));

      const parser = new MarkdownParser();
      const parserOptions: ParserOptions = {
        includeMetadata: options.metadata !== false,
        preserveCodeBlocks: options.codeBlocks !== false,
        extractSpanConfig: options.spanConfig !== false,
      };

      const results = await parser.parseFiles(files, parserOptions);

      let successCount = 0;
      let errorCount = 0;

      for (const result of results) {
        if (result.success) {
          const inputFile = result.filePath!;
          const outputDir = options.outputDir || path.dirname(inputFile);
          const outputPath = path.join(
            outputDir,
            `${path.parse(inputFile).name}.json`
          );

          const jsonOutput = parser.toJSON(
            result.document!,
            options.pretty ? 2 : 0
          );
          await fs.promises.writeFile(outputPath, jsonOutput, "utf-8");

          console.log(
            chalk.green(
              `✅ ${path.basename(inputFile)} → ${path.basename(outputPath)}`
            )
          );
          successCount++;
        } else {
          console.error(
            chalk.red(`❌ ${path.basename(result.filePath!)}: ${result.error}`)
          );
          errorCount++;
        }
      }

      console.log(chalk.cyan(`\n📊 Batch Summary:`));
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);
      console.log(`   📁 Total: ${results.length}`);
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error}`));
      process.exit(1);
    }
  });

program
  .command("example")
  .description("Parse the Python cheatsheet as an example")
  .option("--pretty", "Pretty print JSON output")
  .action(async (options) => {
    const exampleFile = path.resolve(__dirname, "../examples/python.md");

    if (!fs.existsSync(exampleFile)) {
      console.error(chalk.red(`❌ Example file not found: ${exampleFile}`));
      console.log(
        chalk.yellow(
          "Make sure the python.md example file exists in the examples directory."
        )
      );
      process.exit(1);
    }

    try {
      const parser = new MarkdownParser();

      console.log(chalk.blue(`📖 Parsing example file: ${exampleFile}`));

      const result = await parser.parseFile(exampleFile);

      if (!result.success) {
        console.error(chalk.red(`❌ Error parsing example: ${result.error}`));
        process.exit(1);
      }

      const outputPath = path.join(
        __dirname,
        "../examples/python-cheatsheet-parsed.json"
      );
      const jsonOutput = parser.toJSON(
        result.document!,
        options.pretty ? 2 : 0
      );

      await fs.promises.writeFile(outputPath, jsonOutput, "utf-8");

      console.log(chalk.green(`✅ Example parsed successfully!`));
      console.log(chalk.green(`📄 Output saved to: ${outputPath}`));

      // Print detailed summary
      const doc = result.document!;
      console.log(chalk.cyan("\n📊 Example Summary:"));
      console.log(`   📋 Title: ${doc.metadata.title}`);
      console.log(`   🏷️  Tags: ${doc.metadata.tags?.join(", ")}`);
      console.log(`   📂 Categories: ${doc.metadata.categories?.join(", ")}`);
      console.log(`   📖 Sections: ${doc.sections.length}`);

      console.log(chalk.cyan("\n🗂️  Section Structure:"));
      doc.sections.forEach((section, index) => {
        console.log(
          `   ${index + 1}. ${section.title} (${
            section.subsections.length
          } subsections)`
        );
        section.subsections.slice(0, 3).forEach((sub, subIndex) => {
          const spanInfo = sub.cards[0]?.spanConfig
            ? ` [${sub.cards[0].spanConfig}]`
            : "";
          console.log(`      ${subIndex + 1}. ${sub.title}${spanInfo}`);
        });
        if (section.subsections.length > 3) {
          console.log(`      ... and ${section.subsections.length - 3} more`);
        }
      });
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error}`));
      process.exit(1);
    }
  });

program
  .command("unified <pattern>")
  .description(
    "Parse multiple markdown files and create unified cheatsheet JSON"
  )
  .option(
    "-o, --output <path>",
    "Output file path (defaults to unified-cheatsheets.json)"
  )
  .option("--no-metadata", "Skip metadata extraction")
  .option("--no-code-blocks", "Do not preserve code block formatting")
  .option("--no-span-config", "Do not extract span configuration")
  .option("--pretty", "Pretty print JSON output")
  .action(async (pattern: string, options) => {
    try {
      const parser = new MarkdownParser();
      const parserOptions: ParserOptions = {
        includeMetadata: options.metadata !== false,
        preserveCodeBlocks: options.codeBlocks !== false,
        extractSpanConfig: options.spanConfig !== false,
        unifiedOutput: true,
      };

      console.log(chalk.blue(`📖 Finding files matching: ${pattern}`));

      const files = await glob(pattern);
      if (files.length === 0) {
        console.log(
          chalk.yellow(`⚠️ No files found matching pattern: ${pattern}`)
        );
        return;
      }

      console.log(chalk.blue(`📖 Parsing ${files.length} files...`));

      const unifiedData = await parser.parseUnified(files, parserOptions);

      const outputPath = options.output || "unified-cheatsheets.json";
      const jsonOutput = parser.toUnifiedJSON(
        unifiedData,
        options.pretty ? 2 : 0
      );

      await fs.promises.writeFile(outputPath, jsonOutput, "utf-8");

      console.log(
        chalk.green(`✅ Successfully created unified cheatsheet: ${outputPath}`)
      );

      // Print summary
      console.log(chalk.cyan("\n📊 Summary:"));
      console.log(`   Total Cheatsheets: ${unifiedData.cheatsheets.length}`);
      unifiedData.cheatsheets.forEach((cheatsheet, index) => {
        console.log(
          `   ${index + 1}. ${cheatsheet.metadata.title || cheatsheet.id} (${
            cheatsheet.sections.length
          } sections)`
        );
      });
      console.log(`   Created: ${unifiedData.createdAt}`);
      console.log(`   Version: ${unifiedData.version}`);
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error}`));
      process.exit(1);
    }
  });

// Handle case where no command is provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
