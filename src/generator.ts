// src/generator.ts
import { Project, Scope, SourceFile, TypeNode, WriterFunctionOrValue, Writers } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

function findClassNameAndAddImports(
	nameOfClass: string,
	sourceFiles: SourceFile[],
	currentFile: SourceFile
) {
	sourceFiles.forEach((sourceFile) => {
		const matchingEntity =
			sourceFile.getClass(nameOfClass) ||
			sourceFile.getInterface(nameOfClass) ||
			sourceFile.getEnum(nameOfClass);
		let foundFilePath = sourceFile.getFilePath();
		if (matchingEntity) {
			const relativePath =
				'./' +
				path
					.relative(path.dirname(currentFile.getFilePath()), foundFilePath)
					.replace('.ts', '');
			// Add import for the found class
			currentFile.addImportDeclaration({
				moduleSpecifier: relativePath, //sourceFile.getFilePath(),
				namedImports: [ nameOfClass ]
			});
		}
	});
}

function findTsConfigPath(startPath: string): string | null {
	let currentPath = startPath;
	while (currentPath !== path.parse(currentPath).root) {
		const tsConfigPath = path.resolve(currentPath, 'tsconfig.json');
		if (fs.existsSync(tsConfigPath)) {
			return tsConfigPath;
		}
		currentPath = path.resolve(currentPath, '..');
	}
	return null;
}

export function generateFiles(identifier: string, repos: string[]) {
	const tsConfigPath = findTsConfigPath(process.cwd());
	if (!tsConfigPath) {
		console.error(
			'tsconfig.json not found in the current directory or any parent directories.'
		);
		return;
	}
	// const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
	const project = new Project({
		tsConfigFilePath: tsConfigPath // path.resolve(__dirname, '../tsconfig.json')
	});

	// Get Project Source Files
	const sourceFiles = project.getSourceFiles();

	generateUseCase(project, identifier, repos, sourceFiles);
	generateController(project, identifier, sourceFiles);
	project.save();
}

function generateUseCase(
	project: Project,
	identifier: String,
	repos: string[],
	sourceFiles: SourceFile[]
) {
	// Create UseCase file
	const useCaseFile = project.createSourceFile(`${identifier}UseCase.ts`);

	const requiredSharedClasses = [ 'UseCase', 'Result', 'ResultError', 'ErrorCodes' ];
	requiredSharedClasses.map((requiredClass) => {
		findClassNameAndAddImports(requiredClass, sourceFiles, useCaseFile);
	});
	useCaseFile.addImportDeclaration({
		moduleSpecifier: `./I${identifier}Request`,
		namedImports: [ `I${identifier}Request` ]
	});
	useCaseFile.addImportDeclaration({
		moduleSpecifier: `./I${identifier}Response`,
		namedImports: [ `I${identifier}Response` ]
	});

	// Create UseCase class
	const useCaseClass = useCaseFile.addClass({
		name: `${identifier}UseCase`,
		isExported: true,
		implements: [ `UseCase<I${identifier}Request, I${identifier}Response>` ]
	});

	// Define the interface for repositories
	if (repos && repos.length > 0) {
		const reposInterface = useCaseFile.addInterface({
			name: `I${identifier}Repos`,
			isExported: false,
			properties: repos.map((repo) => ({
				name: repo.toLowerCase(),
				type: repo
			}))
		});

		// Iterate through repoNames and search for the class in all source files
		repos.forEach((nameOfClass) => {
			findClassNameAndAddImports(nameOfClass, sourceFiles, useCaseFile);
		});

		// Add private repos property
		useCaseClass.addProperty({
			name: 'repos',
			type: reposInterface.getName(),
			scope: Scope.Private
		});

		// Add constructor with dependency injection
		useCaseClass.addConstructor({
			parameters: [
				{
					name: 'repos',
					type: reposInterface.getName()
				}
			],
			scope: Scope.Private,
			statements: 'this.repos = repos;' //
		});
	}
	// Add execute method
	useCaseClass.addMethod({
		name: 'execute',
		returnType: `Promise<Result<I${identifier}Response>>`,
		parameters: [
			{
				name: 'request',
				type: `I${identifier}Request`,
				hasQuestionToken: true
			}
		],
		statements: [ '// Implementation goes here', 'return new Promise((resolve, reject)=>{})' ]
	});
}

function generateController(project: Project, identifier: string, sourceFiles: SourceFile[]) {
	// Create Controller file
	const controllerFile = project.createSourceFile(`${identifier}Controller.ts`);

	const requiredSharedClasses = [ 'BaseController', 'Result', 'ResultError', 'ErrorCodes' ];
	requiredSharedClasses.map((requiredClass) => {
		findClassNameAndAddImports(requiredClass, sourceFiles, controllerFile);
	});

	// Create BaseController class - NOT NEEDED
	// const baseControllerClass = controllerFile.addClass({
	// 	name: 'BaseController',
	// 	isAbstract: true,
	// 	methods: [
	// 		{
	// 			name: 'executeImpl',
	// 			isAbstract: true,
	// 			returnType: 'Promise<void | any>',
	// 			parameters: [ { name: 'req', type: 'Request' }, { name: 'res', type: 'Response' } ]
	// 		}
	// 		// ... other methods as in the provided example ...
	// 	]
	// });

	// Create specific Controller class
	const controllerClass = controllerFile.addClass({
		name: `${identifier}Controller`,
		isExported: true,
		extends: 'BaseController',
		properties: [
			{
				name: 'useCase',
				type: `${identifier}UseCase`,
				scope: Scope.Private
			}
		]
	});

	// Add constructor to the specific Controller class
	controllerClass.addConstructor({
		parameters: [
			{
				name: 'useCase',
				type: `${identifier}UseCase`
			}
		],
		statements: [ 'super()', 'this.useCase = useCase;' ]
	});

	// Add executeImpl method to the specific Controller class
	controllerClass.addMethod({
		name: 'executeImpl',
		isAsync: true,
		returnType: 'Promise<any>',
		parameters: [ { name: 'req', type: 'Request' }, { name: 'res', type: 'Response' } ],
		statements: [
			'const { body } = req;',
			'try {',
			`  const responseOrError = await this.useCase.execute(body);`,
			'  if (responseOrError.isFailure) {',
			'    return this.fail(res, responseOrError.error);',
			'  }',
			'  return this.ok(res, responseOrError.getValue());',
			'} catch (error) {',
			'  remoteLogger.error("Error while executing", error);',
			'  return this.fail(res, {',
			`    code: ErrorCodes.INTERNAL_SERVER_ERROR,`,
			'    message: (error as Error)?.message,',
			'  });',
			'}'
		]
	});
	controllerFile.addImportDeclarations([
		{ moduleSpecifier: 'express', namedImports: [ 'Request', 'Response' ] },
		{ moduleSpecifier: `./${identifier}UseCase`, namedImports: [ `${identifier}UseCase` ] }
		// ... other necessary imports ...
	]);
}
