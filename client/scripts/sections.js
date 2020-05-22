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
async function headphoneCheck() {
    const sectionScreenTemplates = {
        headphone_check: 'headphone_check',
    }
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    const headphoneScreen = screens.headphoneCheck(templates.headphone_check);
    return headphoneScreen;
}

function dissimilarityInnerBlock(template, audioFilePairs) {

    const block = new lab.flow.Loop({
        template: screens.dissimilarityScreen.bind(
            undefined,
            template),
        templateParameters: audioFilePairs
    });
    return block;
}

async function dissimilarityBlock(audioFilePairs, pairsPerTrial) {
    pairsPerTrial = pairsPerTrial || 100;

    const sectionScreenTemplates = {
        dissimilarity_rating: 'dissimilarity_rating',
        dissimilarity_break: 'text_screen'
    };

    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);

    const blockScreens = [];
    const numberOfInnerBlocks =
        Math.ceil(audioFilePairs.length / pairsPerTrial);
    for (let i = 0; i < numberOfInnerBlocks; i++) {
        const innerBlockAudioPairs =
            audioFilePairs.slice(i * pairsPerTrial, (i + 1) * pairsPerTrial);
        const thisInnerBlock = dissimilarityInnerBlock(
            templates.dissimilarity_rating,
            innerBlockAudioPairs);
        blockScreens.push(thisInnerBlock);

        if (i < numberOfInnerBlocks - 1) {
            const breakScreen =
                screens.textScreen(templates.dissimilarity_break);
            blockScreens.push(breakScreen);
        }
    }
    const block = new lab.flow.Sequence({
        content: blockScreens
    });
    return block;
}

return {headphoneCheck, dissimilarityInnerBlock, dissimilarityBlock};
});