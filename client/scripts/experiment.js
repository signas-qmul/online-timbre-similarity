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

define(['lab', 'sections'], function(lab, sections) {
async function get() {
    const experimentSpecReq = await fetch('api/get-experiment-spec');
    const experimentSpec = await experimentSpecReq.json();

    const dissimilaritySection = await sections.dissimilarityBlock(
        experimentSpec.trials,
        5);

    const experiment = new lab.flow.Sequence({
        content: [dissimilaritySection],
    });
    return experiment;
}
return {get};
});