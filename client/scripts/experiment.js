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

    const headphoneCheckSection = await sections.headphoneCheck();
    const dissimilaritySection = await sections.dissimilarityBlock(
        experimentSpec.trials,
        100);

    const experiment = new lab.flow.Sequence({
        content: [headphoneCheckSection, dissimilaritySection],
    });
    return experiment;
}
return {get};
});