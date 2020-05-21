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

define(['lab', 'templating', 'sections', 'screens'], function(lab, templating, sections, screens) {
async function get() {
    const experimentSpecReq = await fetch('api/get-experiment-spec');
    const experimentSpec = await experimentSpecReq.json();

    const experimentScreens = ['dissimilarity_rating'];
    const templates = await templating.loadTemplates(experimentScreens);
    const screenText = await templating.loadScreenText(experimentScreens);

    const dissimilaritySection = sections.dissimilarityInnerBlock(
        templating.populateScreenTemplate(
            templates.dissimilarity_rating,
            screenText.dissimilarity_rating),
        experimentSpec.trials);

    const experiment = new lab.flow.Sequence({
        content: [dissimilaritySection],
    });
    return experiment;
}
return {get};
});