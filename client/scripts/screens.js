requirejs.config({
    shim: {
        lab: {
            exports: 'lab'
        },
        HeadphoneCheck: {
            exports: 'HeadphoneCheck'
        }
    },
    paths: {
        lab: '../lib/lab',
        HeadphoneCheck: '../lib/HeadphoneCheck'
    }
});

define(['lab', 'templating', 'HeadphoneCheck'], function(lab, templating, HeadphoneCheck) {
return {
    dissimilarityScreen: (template, audioFiles) => {
        const populatedTemplate = templating.populateScreenTemplate(
            template,
            {
                'audio_src_a': audioFiles.audio_src_a,
                'audio_src_b': audioFiles.audio_src_b
            });
        
        const labScreen = new lab.html.Form({
            content: populatedTemplate
        });

        let playing = false;
        const playAudio = function() {
            playing = true;
            const playerA = document.getElementById("audio_a");
            const playerB = document.getElementById("audio_b");
            playerA.onended = () => { playerB.play() };
            playerB.onended = () => { playing = false; }
            playerA.play();
        }

        let playListener;
        labScreen.on('run', () => {
            playAudio();
            playListener = document.addEventListener('keypress', event => {
                if (event.key === 'r' && !playing) {
                    playAudio();
                }
            });

            const numberBox = document.getElementById('dissimilarity_rating');
            numberBox.focus();
        });

        labScreen.on('end', () => {
            document.removeEventListener('keypress', playListener);
        });

        return labScreen;
    },
    textScreen: template => {
        const labScreen = new lab.html.Screen({
            content: template,
            responses: {
                keypress: 'confirm'
            }
        });
        return labScreen;
    },
    headphoneCheck: template => {
        const labScreen = new lab.html.Screen({
            content: template,
        });
        labScreen.on('run', () => {
            HeadphoneCheck.runHeadphoneCheck({totalTrials: 1});
            $(document).on('hcHeadphoneCheckEnd', (event, data) => {
                if (data.didPass) {
                    labScreen.end();
                } else {
                    $('<div/>', {
                        class: 'hc-calibration-instruction',
                        html: 'You must be wearing headphones to participate.' +
                            ' The experiment will now terminate.<br/><b>' +
                            'Please close your browser window.</b>',
                    }).appendTo($('#hc-container'));
                }
            });
        });
        return labScreen;
    },
    questionnaire: template => {
        const labScreen = new lab.html.Form({
            content: template,
        });
        return labScreen;
    },
    auditionFiles: (template, audioFiles) => {
        const labScreen = new lab.html.Screen({
            content: template,
        });

        let playListener;
        let continueListener;
        labScreen.on('run', () => {
            const playButton = document.getElementById('play-audio');
            const continueButton = document.getElementById('continue');
            playListener = playButton.addEventListener('click', event => {
                const player = new Audio();
                let fileIndex = 0;
                const playAudio = () => {
                    if (fileIndex < audioFiles.length) {
                        player.src = "audio/" + audioFiles[fileIndex];
                        player.play();
                        fileIndex += 1;
                    } else {
                        playButton.disabled = true;
                        continueButton.disabled = false;
                    }
                }
                player.onended = playAudio;
                playAudio();
            });

            continueListener = continueButton.addEventListener('click', event =>
            {
                labScreen.end();
            })
        });
        labScreen.on('end', () => {
            const playButton = document.getElementById('play-audio');
            const continueButton = document.getElementById('play-audio');
            playButton.removeEventListener('click', playListener);
            continueButton.removeEventListener('click', continueListener);
        });
        return labScreen;
    }
};
});