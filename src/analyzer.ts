import { Project } from "ts-morph";
import * as fs from "fs";

export function analyzeFiles(): string {
  const project = new Project();
  const files = fs.readdirSync(process.cwd());
  let verbIdentifier = "";

  files.forEach((file) => {
    const regex = /I([A-Za-z]+)Request\.ts/;
    const match = file.match(regex);
    // const match = file.match(/I[A-Za-z]+Request\.ts$/);
    if (match) {
      const extractedName = match[1];
      const requestFile = project.addSourceFileAtPath(file);
      const requestClassName = requestFile.getClasses()[0]?.getName() || "1";
      verbIdentifier = extractedName
    }
  });
  return verbIdentifier;
}
