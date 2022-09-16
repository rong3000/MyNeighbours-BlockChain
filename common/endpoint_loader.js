import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const load_endpoints = async (moduleDirectory, context) => {
    const endpointsDirectory = join(moduleDirectory, 'endpoints');

    const endpoints = readdirSync(endpointsDirectory, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

    for(const endpoint of endpoints) {
        const { default: createEndpoint } = await import(pathToFileURL(join(endpointsDirectory, endpoint)));
        createEndpoint(context);
    }      
};

export default load_endpoints;