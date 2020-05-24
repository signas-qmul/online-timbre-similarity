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

async function auditionFiles(audioFiles) {
    const sectionScreenTemplates = {
        audition_files: 'audition_files',
    }
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    const auditionScreen = screens.auditionFiles(
        templates.audition_files,
        audioFiles);
    return auditionScreen;
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

async function dissimilarityPracticeBlock(audioFilePairs) {
    const sectionScreenTemplates = {
        dissimilarity_rating: 'dissimilarity_rating',
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const block = dissimilarityInnerBlock(
        templates.dissimilarity_rating,
        audioFilePairs);
    
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

async function questionnaire() {
    const sectionScreenTemplates = {
        questionnaire: 'questionnaire',
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const questionnaireScreen = screens.questionnaire(templates.questionnaire);
    return questionnaireScreen;
}

return {
    auditionFiles,
    headphoneCheck,
    dissimilarityInnerBlock,
    dissimilarityPracticeBlock,
    dissimilarityBlock,
    questionnaire
};
});