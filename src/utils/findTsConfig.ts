import * as path from 'path';
import * as fs from 'fs';

export function findTsConfigPath(startPath: string): string | null {
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
