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

define(['lab', 'screens'], function(lab, screens) {
function dissimilarityInnerBlock(template, audioFilePairs) {
    const block = new lab.flow.Loop({
        template: screens.dissimilarityScreen.bind(undefined, template),
        templateParameters: audioFilePairs
    });
    return block;
}

function dissimilarityOuterBlock(template, audioFilePairs) {
}

return {dissimilarityInnerBlock, dissimilarityOuterBlock};
});