import { Project } from 'ts-morph';
import { findTsConfigPath } from '../utils/findTsConfig';

// Function to find classes based on a condition
function findClassesByCondition(project: Project, condition: (classDeclaration: any) => boolean): string[] {
  const classes: string[] = [];
  for (const sourceFile of project.getSourceFiles()) {
    for (const classDeclaration of sourceFile.getClasses()) {
      if (condition(classDeclaration)) {
        const className = classDeclaration.getName();
        if (className) classes.push(className);
      }
    }
  }
  console.log("Found", classes)
  return classes;
}

function findClassesImplementingUseCase(): string[] {
  const tsConfigPath = findTsConfigPath(process.cwd());
  if (!tsConfigPath) {
    console.error('tsconfig.json not found in the current directory or any parent directories.');
    return [];
  }
  const project = new Project({ tsConfigFilePath: tsConfigPath });
  return findClassesByCondition(project, classDeclaration =>
    // @ts-ignore
    classDeclaration.getImplements().some(implementedInterface => implementedInterface.getType().getSymbol()?.getName() === 'UseCase')
  );
}

function findClassesExtendingAsyncUseCase(): string[] {
  const tsConfigPath = findTsConfigPath(process.cwd());
  if (!tsConfigPath) {
    console.error('tsconfig.json not found in the current directory or any parent directories.');
    return [];
  }
  const project = new Project({ tsConfigFilePath: tsConfigPath });
  return findClassesByCondition(project, classDeclaration => {
    const baseClass = classDeclaration.getBaseClass();
    return baseClass && baseClass.getName() === 'AsyncUseCase';
  });
}
