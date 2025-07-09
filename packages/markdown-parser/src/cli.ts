#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import chalk from "chalk";
import simpleGit from "simple-git";
import { MarkdownParser } from "./parser.js";
import { ParserOptions, CheatsheetIndexData } from "./types.js";

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

program
  .command("individual <pattern>")
  .description(
    "Parse multiple markdown files and create individual JSON files with index"
  )
  .option(
    "-o, --output-dir <path>",
    "Output directory for individual files (defaults to ./public/data/cheatsheets)"
  )
  .option(
    "--index-output <path>",
    "Output path for index file (defaults to ./public/data/cheatsheets-index.json)"
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

      const outputDir = options.outputDir || "./public/data/cheatsheets";
      const indexOutput =
        options.indexOutput || "./public/data/cheatsheets-index.json";

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const individualData: CheatsheetIndexData = await parser.parseIndividual(
        files,
        parserOptions,
        outputDir,
        indexOutput
      );

      console.log(
        chalk.green(
          `✅ Successfully created individual cheatsheet files in: ${outputDir}`
        )
      );
      console.log(
        chalk.green(`✅ Successfully created index file: ${indexOutput}`)
      );

      // Print summary
      console.log(chalk.cyan("\n📊 Summary:"));
      console.log(`   Total Cheatsheets: ${individualData.cheatsheets.length}`);
      individualData.cheatsheets.forEach((cheatsheet, index) => {
        console.log(
          `   ${index + 1}. ${cheatsheet.name} (${cheatsheet.id}.json)`
        );
      });
      console.log(`   Created: ${individualData.createdAt}`);
      console.log(`   Version: ${individualData.version}`);
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error}`));
      process.exit(1);
    }
  });

program
  .command("github")
  .description(
    "Download and parse cheatsheets from Fechin/reference GitHub repository"
  )
  .option(
    "-o, --output-dir <path>",
    "Output directory for individual files (defaults to ./public/data/cheatsheets)"
  )
  .option(
    "--index-output <path>",
    "Output path for index file (defaults to ./public/data/cheatsheets-index.json)"
  )
  .option(
    "--temp-dir <path>",
    "Temporary directory for cloning repo (defaults to ./temp-repo)"
  )
  .option("--no-metadata", "Skip metadata extraction")
  .option("--no-code-blocks", "Do not preserve code block formatting")
  .option("--no-span-config", "Do not extract span configuration")
  .option("--pretty", "Pretty print JSON output")
  .option("--keep-temp", "Keep temporary repository directory after processing")
  .action(async (options) => {
    try {
      const parser = new MarkdownParser();
      const parserOptions: ParserOptions = {
        includeMetadata: options.metadata !== false,
        preserveCodeBlocks: options.codeBlocks !== false,
        extractSpanConfig: options.spanConfig !== false,
      };

      const repoUrl = "https://github.com/Fechin/reference.git";
      const tempDir = options.tempDir || "./temp-repo";
      const outputDir = options.outputDir || "./public/data/cheatsheets";
      const indexOutput =
        options.indexOutput || "./public/data/cheatsheets-index.json";
      const postsDir = path.join(tempDir, "source", "_posts");

      console.log(chalk.blue(`📥 Cloning repository: ${repoUrl}`));

      // Clean up any existing temp directory
      if (fs.existsSync(tempDir)) {
        console.log(
          chalk.yellow(`🧹 Cleaning up existing temp directory: ${tempDir}`)
        );
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      // Clone the repository
      const git = simpleGit();
      await git.clone(repoUrl, tempDir, ["--depth", "1"]);
      console.log(chalk.green(`✅ Repository cloned to: ${tempDir}`));

      // Check if posts directory exists
      if (!fs.existsSync(postsDir)) {
        console.error(chalk.red(`❌ Posts directory not found: ${postsDir}`));
        process.exit(1);
      }

      // Find all markdown files in the posts directory
      console.log(chalk.blue(`📖 Finding markdown files in: ${postsDir}`));
      const pattern = path.join(postsDir, "*.md");
      const files = await glob(pattern);

      if (files.length === 0) {
        console.log(chalk.yellow(`⚠️ No markdown files found in: ${postsDir}`));
        return;
      }

      console.log(chalk.blue(`📖 Found ${files.length} markdown files`));

      // List found files
      files.forEach((file, index) => {
        const fileName = path.basename(file);
        console.log(chalk.gray(`   ${index + 1}. ${fileName}`));
      });

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log(chalk.blue(`🔄 Processing files...`));

      // Parse all files and create individual JSON files + index
      const individualData: CheatsheetIndexData = await parser.parseIndividual(
        files,
        parserOptions,
        outputDir,
        indexOutput
      );

      console.log(
        chalk.green(
          `✅ Successfully created individual cheatsheet files in: ${outputDir}`
        )
      );
      console.log(
        chalk.green(`✅ Successfully created index file: ${indexOutput}`)
      );

      // Clean up temporary directory unless --keep-temp is specified
      if (!options.keepTemp) {
        console.log(
          chalk.yellow(`🧹 Cleaning up temporary directory: ${tempDir}`)
        );
        fs.rmSync(tempDir, { recursive: true, force: true });
      } else {
        console.log(chalk.blue(`📁 Temporary directory preserved: ${tempDir}`));
      }

      // Print summary
      console.log(chalk.cyan("\n📊 Summary:"));
      console.log(`   Repository: ${repoUrl}`);
      console.log(`   Total Files Found: ${files.length}`);
      console.log(
        `   Total Cheatsheets Processed: ${individualData.cheatsheets.length}`
      );
      console.log(`   Output Directory: ${outputDir}`);
      console.log(`   Index File: ${indexOutput}`);

      console.log(chalk.cyan("\n📋 Processed Cheatsheets:"));
      individualData.cheatsheets.forEach((cheatsheet, index) => {
        console.log(
          `   ${index + 1}. ${cheatsheet.name} (${cheatsheet.id}.json)`
        );
      });

      console.log(`\n   Created: ${individualData.createdAt}`);
      console.log(`   Version: ${individualData.version}`);
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
