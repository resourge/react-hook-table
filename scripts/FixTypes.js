import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const fixTypes = (typePath) => {
	const typesFilePath = path.resolve(__dirname, typePath);

	let content = fs.readFileSync(typesFilePath, 'utf-8');
	
	// Change declare to export
	content = content.replace(/declare/g, 'export declare');
	// Change type to export type
	content = content.replace(/type /g, 'export type ');
	
	// Remover last export
	const lastExport = content.lastIndexOf('export {');
	content = content.substring(0, lastExport);
	
	// Remove last line break
	const lastLine = content.lastIndexOf('\n');
	content = content.substring(0, lastLine);
	
	// Write File
	fs.writeFileSync(typesFilePath, content);
}

fixTypes('../dist/index.d.ts')