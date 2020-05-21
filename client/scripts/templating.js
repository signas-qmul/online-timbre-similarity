define([], function() {
async function loadResourceFiles(fileNames, path, extension) {
    const fileBodies = {};
    for (const fileName of fileNames) {
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
        const regex = new RegExp(`<%${textIdentifier}%>`, 'g');
        outputTemplate = outputTemplate.replace(
            regex,
            screenText[textIdentifier]);
    }
    return outputTemplate;
}

return {populateScreenTemplate, loadScreenText, loadTemplates};
});