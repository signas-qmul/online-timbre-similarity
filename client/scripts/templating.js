define([], function() {
async function loadResourceFiles(fileNames, path, extension) {
    const fileBodies = {};
    for (const fileName of fileNames) {
        if (fileName in fileBodies) continue;

        const fileData = await fetch(`${path}/${fileName}.${extension}`);
        const fileText = extension ===
            'json' ? await fileData.json() : await fileData.text();
        fileBodies[fileName] = fileText;
    }
    return fileBodies;
}

async function loadTemplates(templateNames) {
    return loadResourceFiles(templateNames, 'templates', 'html');
}

async function loadScreenText(screenNames) {
    return loadResourceFiles(screenNames, 'screen_text', 'json');
}

function populateScreenTemplate(template, screenText) {
    let outputTemplate = template;
    for (const textIdentifier in screenText) {
        let replacementText = screenText[textIdentifier];
        if (Array.isArray(replacementText)) {
            replacementText = replacementText.join('');
        }

        const regex = new RegExp(`<%${textIdentifier}%>`, 'g');
        outputTemplate = outputTemplate.replace(
            regex,
            replacementText);
    }
    return outputTemplate;
}

async function getSectionScreenTemplates(screens) {
    const templates = await loadTemplates(Object.values(screens));
    const screenText = await loadScreenText(Object.keys(screens));
    const populatedTemplates = {};
    for (const screen in screens) {
        populatedTemplates[screen] = populateScreenTemplate(
            templates[screens[screen]],
            screenText[screen]);
    }
    return populatedTemplates;
}

return {populateScreenTemplate, getSectionScreenTemplates};
});