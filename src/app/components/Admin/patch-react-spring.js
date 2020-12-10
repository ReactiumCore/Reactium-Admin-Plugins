const path = require('path');
const op = require('object-path');
const fs = require('fs-extra');

const reactSpringEntry = require.resolve('react-spring');
const jsonPath = path.resolve(path.dirname(reactSpringEntry), 'package.json');

try {
    const reactSpringPackage = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    op.del(reactSpringPackage, 'sideEffects');
    fs.writeFileSync(
        jsonPath,
        JSON.stringify(reactSpringPackage, null, 2),
        'utf8',
    );
    console.log('Patching ' + jsonPath);
} catch (error) {
    console.error('Error writing patch to ' + jsonPath, error);
    process.exit(1);
}
