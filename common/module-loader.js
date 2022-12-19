import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const load_modules = async (modulesDirectory, context, route) => {
    const modules = readdirSync(modulesDirectory, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

    for(const module of modules) {
        const moduleDirectory = join(modulesDirectory, module);
        const { default: createModule } = await import(pathToFileURL(join(modulesDirectory, module)));
        await createModule(moduleDirectory, context, route);
    }
};

export default load_modules;