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
        welcome_1: 'text_screen',
        welcome_2: 'text_screen',
        info_1: 'text_screen',
        info_2: 'text_screen',
        info_3: 'text_screen',
        info_4: 'text_screen',
        consent: 'consent_form',
        consent_failure: 'text_screen_no_continue',
        pdf_download: 'text_screen',
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const createdScreens = [];
    for (const template in templates) {
        let screen;
        if (sectionScreenTemplates[template] === 'consent_form') {
            screen = screens.consentForm(
                templates[template],
                templates.consent_failure);
        } else if (sectionScreenTemplates[template] === 'text_screen') {
            screen = screens.textScreen(templates[template]);
        } else if (template === 'consent_failure') {
            continue;
        }
        createdScreens.push(screen);
    }
    const block = new lab.flow.Sequence({
        content: createdScreens,
    });

    return block;
}

async function headphoneCheck() {
    const sectionScreenTemplates = {
        headphone_explanation: 'text_screen',
        headphone_check: 'headphone_check',
        headphone_complete: 'text_screen',
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    const headphoneExplanation =
        screens.textScreen(templates.headphone_explanation);
    const headphoneScreen = screens.headphoneCheck(templates.headphone_check);
    const headphoneComplete =
        screens.textScreen(templates.headphone_complete);
    const block = new lab.flow.Sequence({
        content: [headphoneExplanation, headphoneScreen, headphoneComplete],
    });
    return block;
}

async function auditionFiles(audioFiles) {
    const sectionScreenTemplates = {
        audition_explanation: 'text_screen',
        audition_files: 'audition_files',
    }
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    const auditionExplanation =
        screens.textScreen(templates.audition_explanation);
    const auditionScreen = screens.auditionFiles(
        templates.audition_files,
        audioFiles);

    const block = new lab.flow.Sequence({
        content: [auditionExplanation, auditionScreen],
    })
    return block;
}

function dissimilarityInnerBlock(
    template,
    screenName,
    audioFilePairs,
    practiceReminderTemplate)
{

    const block = new lab.flow.Loop({
        template: screens.dissimilarityScreen.bind(
            undefined,
            template,
            screenName,
            practiceReminderTemplate),
        templateParameters: audioFilePairs
    });
    return block;
}

async function dissimilarityPracticeBlock(audioFilePairs) {
    const sectionScreenTemplates = {
        practice_explanation_1: 'text_screen',
        practice_explanation_2: 'text_screen',
        dissimilarity_rating: 'dissimilarity_rating',
        practice_reminder: 'text_screen'
    };
    const templates =
        await templating.getSectionScreenTemplates(sectionScreenTemplates);
    
    const explanation1 = screens.textScreen(templates.practice_explanation_1);
    const explanation2 = screens.textScreen(templates.practice_explanation_2);
    const practiceBlock = dissimilarityInnerBlock(
        templates.dissimilarity_rating,
        'practice_dissimilarity',
        audioFilePairs,
        templates.practice_reminder);
    const block = new lab.flow.Sequence({
        content: [explanation1, explanation2, practiceBlock],
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
            'dissimilarity',
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