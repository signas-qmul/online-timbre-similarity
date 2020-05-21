requirejs.config({
    shim: {
        lab: {
            exports: 'lab'
        }
    },
    paths: {
        lab: '../lib/lab'
    }
});

define(['lab'], function(lab) {
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
        outputTemplate = outputTemplate.replace(
            `<%${textIdentifier}%>`,
            screenText[textIdentifier]);
    }
    return outputTemplate;
}

async function get() {
    const experimentScreens = ['dissimilarity_rating'];
    const templates = await loadTemplates(experimentScreens);
    const screenText = await loadScreenText(experimentScreens);

    const text = new lab.html.Screen({
        content: populateScreenTemplate(
            templates.dissimilarity_rating,
            screenText.dissimilarity_rating),
    })
    const experiment = new lab.flow.Sequence({
        content: [text],
    });
    return experiment;
}
return {get};
});