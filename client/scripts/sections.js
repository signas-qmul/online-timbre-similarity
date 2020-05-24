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
async function welcomeScreens() {
    const sectionScreenTemplates = {
        welcome: 'text_screen',
        description: 'text_screen',
        consent: 'text_screen',
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const createdScreens = [];
    for (const template in templates) {
        const screen = screens.textScreen(templates[template]);
        createdScreens.push(screen);
    }
    const block = new lab.flow.Sequence({
        content: createdScreens,
    });

    return block;
}

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
        practice_explanation: 'text_screen'
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const practiceBlock = dissimilarityInnerBlock(
        templates.dissimilarity_rating,
        audioFilePairs);
    const explanation = screens.textScreen(templates.practice_explanation);
    const block = new lab.flow.Sequence({
        content: [explanation, practiceBlock],
    });
    
    return block;
}

async function dissimilarityBlock(audioFilePairs, pairsPerTrial) {
    pairsPerTrial = pairsPerTrial || 100;

    const sectionScreenTemplates = {
        dissimilarity_rating: 'dissimilarity_rating',
        dissimilarity_break: 'text_screen',
        dissimilarity_explanation: 'text_screen',
        dissimilarity_complete: 'text_screen'
    };

    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);

    const explanationScreen =
        screens.textScreen(templates.dissimilarity_explanation);
    const blockScreens = [explanationScreen];
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

    const completeScreen =
        screens.textScreen(templates.dissimilarity_complete);
    blockScreens.push(completeScreen);

    const block = new lab.flow.Sequence({
        content: blockScreens
    });
    return block;
}

async function questionnaire() {
    const sectionScreenTemplates = {
        questionnaire: 'questionnaire',
        questionnaire_explanation: 'text_screen'
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const questionnaireScreen = screens.questionnaire(templates.questionnaire);
    const questionnaireExplanation =
        screens.textScreen(templates.questionnaire_explanation);
    const block = new lab.flow.Sequence({
        content: [questionnaireExplanation, questionnaireScreen]
    });
    return block;
}

async function experimentComplete() {
    const sectionScreenTemplates = {
        experiment_complete: 'text_screen_no_continue'
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const experimentCompleteScreen =
        screens.textScreenNoContinue(templates.experiment_complete);
    
    experimentCompleteScreen.on('run', () => {
        const stopButton = document.getElementById('stop-button');
        stopButton.style.display = 'none';
    });
    return experimentCompleteScreen;
}

return {
    welcomeScreens,
    auditionFiles,
    headphoneCheck,
    dissimilarityInnerBlock,
    dissimilarityPracticeBlock,
    dissimilarityBlock,
    questionnaire,
    experimentComplete
};
});