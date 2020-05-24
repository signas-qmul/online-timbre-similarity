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
    console.log(experimentSpec);

    const headphoneCheckSection = await sections.headphoneCheck();
    const auditionFiles = await sections.auditionFiles(experimentSpec.files);
    const dissimilarityPracticeSection =
        await sections.dissimilarityPracticeBlock(
            experimentSpec.practiceTrials);
    const dissimilaritySection = await sections.dissimilarityBlock(
        experimentSpec.trials,
        100);
    const questionnaireSection = await sections.questionnaire();

    const experiment = new lab.flow.Sequence({
        content: [
            headphoneCheckSection,
            auditionFiles,
            dissimilarityPracticeSection,
            dissimilaritySection,
            questionnaireSection],
    });
    return experiment;
}
return {get};
});