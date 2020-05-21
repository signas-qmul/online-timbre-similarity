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

define(['lab', 'templating', 'screens'], function(lab, templating, screens) {
async function get() {
    const experimentScreens = ['dissimilarity_rating'];
    const templates = await templating.loadTemplates(experimentScreens);
    const screenText = await templating.loadScreenText(experimentScreens);

    const dissimilarityScreen = screens.dissimilarityScreen(
        templating.populateScreenTemplate(
            templates.dissimilarity_rating,
            screenText.dissimilarity_rating),
        ["vocal_synthetic_003-091-025.wav",
            "bass_electronic_018-024-100.wav"]);

    const experiment = new lab.flow.Sequence({
        content: [dissimilarityScreen],
    });
    return experiment;
}
return {get};
});